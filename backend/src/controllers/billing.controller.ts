import { Request, Response } from 'express';
import crypto from 'crypto';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { calculateInvoiceTotals } from '../utils/gst';
import { generateInvoicePDF } from '../utils/invoice';
import { auditLog } from '../utils/audit';

const FINALIZED = 'finalized';

function computeInvoiceHash(invoice: any, items: any[]): string {
  const payload = {
    invoice_number: invoice.invoice_number,
    customer_id: invoice.customer_id,
    invoice_date: invoice.invoice_date,
    total_amount: invoice.total_amount,
    cgst_amount: invoice.cgst_amount,
    sgst_amount: invoice.sgst_amount,
    items: items.map((i: any) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
    })),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { items, payments, ...invoiceData } = req.body;
    const userId = (req as any).user.id;
    const id = uuidv4();

    const totals = calculateInvoiceTotals(items, invoiceData.discount_amount || 0);

    await db.transaction(async (trx) => {
      await trx('invoices').insert({
        id, ...invoiceData, ...totals, created_by: userId,
        created_at: new Date(), updated_at: new Date(),
      });

      for (const item of items) {
        await trx('invoice_items').insert({ id: uuidv4(), invoice_id: id, ...item });
        await trx('products').where({ id: item.product_id }).decrement('stock_qty', item.quantity);
        await trx('inventory_transactions').insert({
          id: uuidv4(), product_id: item.product_id, transaction_type: 'sale',
          quantity: -item.quantity, reference_id: id, reference_type: 'invoice',
          created_by: userId, created_at: new Date(),
        });
      }

      if (invoiceData.customer_id) {
        await trx('customers').where({ id: invoiceData.customer_id })
          .increment('total_purchases', totals.total_amount)
          .increment('loyalty_points', Math.floor(totals.total_amount / 1000));
      }
    });

    const invoice = await db('invoices').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'invoices', recordId: id, newValues: invoice, ipAddress: req.ip });
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, payment_status, search } = req.query;
    let query = db('invoices').leftJoin('customers', 'invoices.customer_id', 'customers.id')
      .select('invoices.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .orderBy('invoices.created_at', 'desc');
    if (payment_status) query = query.where('invoices.payment_status', payment_status);
    if (search) query = query.where('invoices.invoice_number', 'ilike', `%${search}%`);
    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const invoices = await query.limit(Number(limit)).offset(offset);
    res.json({ invoices, total: Number(total?.count || 0) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await db('invoices').leftJoin('customers', 'invoices.customer_id', 'customers.id')
      .select('invoices.*', 'customers.name as customer_name', 'customers.phone as customer_phone', 'customers.gst_number as customer_gst')
      .where('invoices.id', req.params.id).first();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const items = await db('invoice_items').where({ invoice_id: req.params.id });
    const payments = await db('payments').where({ invoice_id: req.params.id }).orderBy('payment_date', 'desc');
    res.json({ ...invoice, items, payments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await db('invoices').where({ id: req.params.id }).first();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.finalization_status === FINALIZED) {
      return res.status(403).json({ message: 'Invoice is finalized and cannot be modified' });
    }
    const old = { ...invoice };
    const updates: any = { ...req.body, updated_at: new Date() };

    // If finalizing, compute and store hash
    if (req.body.finalization_status === FINALIZED) {
      const items = await db('invoice_items').where({ invoice_id: req.params.id });
      const merged = { ...invoice, ...req.body };
      updates.invoice_hash = computeInvoiceHash(merged, items);
    }

    await db('invoices').where({ id: req.params.id }).update(updates);
    const updated = await db('invoices').where({ id: req.params.id }).first();
    const userId = (req as any).user?.id;
    await auditLog({ userId, action: 'UPDATE', tableName: 'invoices', recordId: req.params.id, oldValues: old, newValues: updated, ipAddress: req.ip });
    if (req.body.finalization_status === FINALIZED) {
      await auditLog({ userId, action: 'UPDATE', tableName: 'invoices', recordId: req.params.id, newValues: { event: 'INVOICE_FINALIZED', invoice_hash: updates.invoice_hash }, ipAddress: req.ip });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const addPayment = async (req: Request, res: Response) => {
  try {
    const { amount, payment_mode, payment_date, reference_number, notes } = req.body;
    const invoiceId = req.params.id;
    await db.transaction(async (trx) => {
      await trx('payments').insert({
        id: uuidv4(), invoice_id: invoiceId, amount, payment_mode,
        payment_date: payment_date || new Date(), reference_number, notes, created_at: new Date(),
      });
      const invoice = await trx('invoices').where({ id: invoiceId }).first();
      const newPaid = Number(invoice.paid_amount) + Number(amount);
      const status = newPaid >= Number(invoice.total_amount) ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
      await trx('invoices').where({ id: invoiceId }).update({ paid_amount: newPaid, payment_status: status, updated_at: new Date() });
    });
    res.json({ message: 'Payment recorded' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const invoice = await db('invoices').leftJoin('customers', 'invoices.customer_id', 'customers.id')
      .select('invoices.*', 'customers.name as customer_name', 'customers.phone as customer_phone', 'customers.gst_number as customer_gst')
      .where('invoices.id', req.params.id).first();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const items = await db('invoice_items').where({ invoice_id: req.params.id });
    const settings = await db('settings').whereIn('key', ['store_name', 'store_address', 'store_gst', 'store_phone']);
    const settingsMap: any = {};
    settings.forEach((s: any) => settingsMap[s.key] = s.value);
    generateInvoicePDF({ ...invoice, items, ...settingsMap }, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
