import { Request, Response } from 'express';
import db from '../config/db';
import { cacheGet, cacheSet } from '../utils/cache';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const cached = await cacheGet('reports:dashboard');
    if (cached) return res.json(JSON.parse(cached));

    const today = new Date().toISOString().split('T')[0];

    const [todaySales, totalCustomers, lowStock, pendingRepairs, recentSales] = await Promise.all([
      db('invoices').whereRaw('DATE(created_at) = ?', [today]).whereNull('deleted_at').sum('total_amount as total').first(),
      db('customers').whereNull('deleted_at').count('* as count').first(),
      db('products').whereRaw('stock_qty <= min_stock_qty').where('is_active', true).whereNull('deleted_at').count('* as count').first(),
      db('repairs').whereNotIn('status', ['delivered']).whereNull('deleted_at').count('* as count').first(),
      db('invoices').select(db.raw('DATE(created_at) as date'), db.raw('SUM(total_amount) as total'))
        .where('created_at', '>=', db.raw("NOW() - INTERVAL '30 days'"))
        .whereNull('deleted_at')
        .groupBy(db.raw('DATE(created_at)')).orderBy('date'),
    ]);

    const result = {
      today_sales: Number(todaySales?.total || 0),
      total_customers: Number(totalCustomers?.count || 0),
      low_stock_count: Number(lowStock?.count || 0),
      pending_repairs: Number(pendingRepairs?.count || 0),
      sales_trend: recentSales,
    };
    await cacheSet('reports:dashboard', JSON.stringify(result), 60);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { from, to, group_by = 'day' } = req.query;
    let dateFormat = 'YYYY-MM-DD';
    if (group_by === 'week') dateFormat = 'IYYY-IW';
    if (group_by === 'month') dateFormat = 'YYYY-MM';

    let query = db('invoices').select(
      db.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
      db.raw('COUNT(*) as count'),
      db.raw('SUM(total_amount) as total'),
    ).groupBy(db.raw(`TO_CHAR(created_at, '${dateFormat}')`)).orderBy('period');

    if (from) query = query.where('created_at', '>=', from as string);
    if (to) query = query.where('created_at', '<=', `${to} 23:59:59`);

    const sales = await query;
    res.json(sales);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventoryValuation = async (req: Request, res: Response) => {
  try {
    const valuation = await db('products')
      .join('categories', 'products.category_id', 'categories.id')
      .select('categories.name as category')
      .sum(db.raw('products.stock_qty * products.selling_price as value'))
      .count('products.id as count')
      .groupBy('categories.name')
      .where('products.is_active', true);
    res.json(valuation);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const products = await db('invoice_items')
      .join('products', 'invoice_items.product_id', 'products.id')
      .select('products.name', 'invoice_items.product_id')
      .sum('invoice_items.quantity as total_qty')
      .sum('invoice_items.total_price as total_revenue')
      .groupBy('products.name', 'invoice_items.product_id')
      .orderBy('total_qty', 'desc').limit(10);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getGSTReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    let query = db('invoices').select(
      db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
      db.raw('SUM(cgst_amount) as cgst'),
      db.raw('SUM(sgst_amount) as sgst'),
      db.raw('SUM(igst_amount) as igst'),
      db.raw('SUM(total_amount) as total'),
    ).groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')")).orderBy('month');
    if (from) query = query.where('created_at', '>=', from as string);
    if (to) query = query.where('created_at', '<=', `${to} 23:59:59`);
    const gst = await query;
    res.json(gst);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomersReport = async (req: Request, res: Response) => {
  try {
    const customers = await db('customers')
      .select('id', 'name', 'phone', 'total_purchases', 'loyalty_points')
      .orderBy('total_purchases', 'desc').limit(20);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
