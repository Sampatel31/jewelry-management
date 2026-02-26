import db from '../config/db';
import logger from './logger';

export const SYSTEM_PROMPT = `You are a read-only AI assistant for a jewelry management system.
You can answer questions about inventory, sales, customers, and business operations based on data provided.
You MUST NOT suggest any data modifications, deletions, or system changes.
You MUST NOT reveal sensitive personal information beyond what is needed for the question.
Always respond in a helpful, professional manner.`;

export interface RoleContext {
  role: string;
  context: Record<string, any>;
}

export async function fetchRoleContext(userId: string, role: string): Promise<RoleContext> {
  const context: Record<string, any> = {};

  try {
    // All roles can see summary metrics
    const [productCount] = await db('products').where('is_active', true).count('* as c');
    const [lowStock] = await db('products')
      .where('is_active', true)
      .whereRaw('stock_qty <= min_stock_qty')
      .count('* as c');
    context.products = { total: Number(productCount.c), lowStock: Number(lowStock.c) };

    if (['admin', 'manager'].includes(role)) {
      const [invoiceCount] = await db('invoices').count('* as c');
      const [revenue] = await db('invoices')
        .where('payment_status', 'paid')
        .sum('total_amount as s');
      context.sales = { totalInvoices: Number(invoiceCount.c), totalRevenue: Number(revenue.s || 0) };

      const [customerCount] = await db('customers').count('* as c');
      context.customers = { total: Number(customerCount.c) };
    }

    if (role === 'admin') {
      const [userCount] = await db('users').where('is_active', true).count('* as c');
      context.users = { active: Number(userCount.c) };
    }
  } catch (err) {
    logger.error('ai_context_error', { err });
  }

  return { role, context };
}

export function sanitizeResponse(text: string): string {
  // Remove any accidental data modification suggestions
  const blocked = [
    /delete\s+from/gi,
    /drop\s+table/gi,
    /update\s+\w+\s+set/gi,
    /insert\s+into/gi,
    /truncate\s+table/gi,
  ];
  let safe = text;
  for (const pattern of blocked) {
    safe = safe.replace(pattern, '[REDACTED]');
  }
  return safe;
}

export function ruleFallback(message: string, context: RoleContext): string {
  const m = message.toLowerCase();
  if (m.includes('stock') || m.includes('inventory')) {
    return `Based on current data: You have ${context.context.products?.total || 'N/A'} active products, with ${context.context.products?.lowStock || 'N/A'} items at or below minimum stock level.`;
  }
  if (m.includes('sale') || m.includes('revenue') || m.includes('invoice')) {
    if (context.context.sales) {
      return `Sales summary: ${context.context.sales.totalInvoices} invoices recorded with total paid revenue of ₹${context.context.sales.totalRevenue?.toLocaleString('en-IN') || 0}.`;
    }
    return "I don't have access to sales data for your role.";
  }
  if (m.includes('customer')) {
    if (context.context.customers) {
      return `You have ${context.context.customers.total} customers registered in the system.`;
    }
    return "I don't have access to customer data for your role.";
  }
  return "I can help with questions about inventory, sales, customers, and operations. Please ask a more specific question about your jewelry store data.";
}
