import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, transaction_type, notes } = req.body;
    const userId = (req as any).user.id;
    const old = await db('products').where({ id: product_id }).first();
    await db.transaction(async (trx) => {
      await trx('inventory_transactions').insert({
        id: uuidv4(), product_id, transaction_type: transaction_type || 'adjustment',
        quantity, notes, created_by: userId, created_at: new Date(),
      });
      await trx('products').where({ id: product_id }).increment('stock_qty', quantity);
    });
    const updated = await db('products').where({ id: product_id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'products', recordId: product_id, oldValues: { stock_qty: old?.stock_qty }, newValues: { stock_qty: updated?.stock_qty, adjustment: quantity }, ipAddress: req.ip });
    res.json({ message: 'Stock adjusted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, product_id } = req.query;
    let query = db('inventory_transactions')
      .join('products', 'inventory_transactions.product_id', 'products.id')
      .join('users', 'inventory_transactions.created_by', 'users.id')
      .select('inventory_transactions.*', 'products.name as product_name', 'users.name as created_by_name')
      .orderBy('inventory_transactions.created_at', 'desc');
    if (product_id) query = query.where('inventory_transactions.product_id', product_id);
    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const transactions = await query.limit(Number(limit)).offset(offset);
    res.json({ transactions, total: Number(total?.count || 0) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const products = await db('products')
      .whereRaw('stock_qty <= min_stock_qty').where('is_active', true)
      .select('*').orderBy('stock_qty');
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
