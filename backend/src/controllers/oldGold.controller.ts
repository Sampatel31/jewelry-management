import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { calculateOldGoldValue } from '../utils/goldPricing';
import { auditLog } from '../utils/audit';

export const listOldGoldTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, customer_id } = req.query;
    let query = db('old_gold_transactions')
      .leftJoin('customers', 'old_gold_transactions.customer_id', 'customers.id')
      .select(
        'old_gold_transactions.*',
        'customers.name as customer_name',
        'customers.phone as customer_phone',
      )
      .orderBy('old_gold_transactions.created_at', 'desc');

    if (customer_id) query = query.where('old_gold_transactions.customer_id', customer_id);

    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const transactions = await query.limit(Number(limit)).offset(offset);
    res.json({ transactions, total: Number(total?.count || 0) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOldGoldTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await db('old_gold_transactions')
      .leftJoin('customers', 'old_gold_transactions.customer_id', 'customers.id')
      .select('old_gold_transactions.*', 'customers.name as customer_name')
      .where('old_gold_transactions.id', req.params.id)
      .first();
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createOldGoldTransaction = async (req: Request, res: Response) => {
  try {
    const { customer_id, metal_type, purity, weight_gm, rate_per_gram, notes, invoice_id } = req.body;
    const userId = (req as any).user.id;

    if (!purity || !weight_gm || !rate_per_gram) {
      return res.status(400).json({ message: 'purity, weight_gm and rate_per_gram are required' });
    }

    const exchange_value = calculateOldGoldValue(Number(weight_gm), purity, Number(rate_per_gram));
    const id = uuidv4();

    await db('old_gold_transactions').insert({
      id,
      customer_id: customer_id || null,
      invoice_id: invoice_id || null,
      metal_type: metal_type || 'gold',
      purity,
      weight_gm: Number(weight_gm),
      rate_per_gram: Number(rate_per_gram),
      exchange_value,
      status: 'received',
      notes: notes || null,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const created = await db('old_gold_transactions').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'old_gold_transactions', recordId: id, newValues: created, ipAddress: req.ip });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOldGoldTransaction = async (req: Request, res: Response) => {
  try {
    const existing = await db('old_gold_transactions').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });

    const updates: any = { ...req.body, updated_at: new Date() };

    // Recalculate exchange value if relevant fields change
    const purity = updates.purity || existing.purity;
    const weight_gm = Number(updates.weight_gm || existing.weight_gm);
    const rate_per_gram = Number(updates.rate_per_gram || existing.rate_per_gram);
    updates.exchange_value = calculateOldGoldValue(weight_gm, purity, rate_per_gram);

    const old = { ...existing };
    await db('old_gold_transactions').where({ id: req.params.id }).update(updates);
    const updated = await db('old_gold_transactions').where({ id: req.params.id }).first();
    const userId = (req as any).user?.id;
    await auditLog({ userId, action: 'UPDATE', tableName: 'old_gold_transactions', recordId: req.params.id, oldValues: old, newValues: updated, ipAddress: req.ip });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const calculateExchangeValue = async (req: Request, res: Response) => {
  try {
    const { purity, weight_gm, rate_per_gram } = req.body;
    if (!purity || !weight_gm || !rate_per_gram) {
      return res.status(400).json({ message: 'purity, weight_gm and rate_per_gram are required' });
    }
    const exchange_value = calculateOldGoldValue(Number(weight_gm), purity, Number(rate_per_gram));
    res.json({ exchange_value });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
