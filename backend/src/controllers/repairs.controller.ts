import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';

export const getRepairs = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = db('repairs').join('customers', 'repairs.customer_id', 'customers.id')
      .select('repairs.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .whereNull('repairs.deleted_at')
      .orderBy('repairs.created_at', 'desc');
    if (status) query = query.where('repairs.status', status);
    const repairs = await query;
    res.json(repairs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createRepair = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const userId = (req as any).user?.id;
    const count = await db('repairs').count('* as c').first();
    const repairNumber = `REP-${String(Number(count?.c || 0) + 1).padStart(4, '0')}`;
    await db('repairs').insert({
      id, repair_number: repairNumber, ...req.body, status: 'received',
      created_at: new Date(), updated_at: new Date(),
    });
    const repair = await db('repairs').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'repairs', recordId: id, newValues: repair, ipAddress: req.ip });
    res.status(201).json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getRepair = async (req: Request, res: Response) => {
  try {
    const repair = await db('repairs').join('customers', 'repairs.customer_id', 'customers.id')
      .select('repairs.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .where('repairs.id', req.params.id)
      .whereNull('repairs.deleted_at')
      .first();
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRepair = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const old = await db('repairs').where({ id: req.params.id }).first();
    await db('repairs').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const repair = await db('repairs').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'repairs', recordId: req.params.id, oldValues: old, newValues: repair, ipAddress: req.ip });
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRepairStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user?.id;
    const updates: any = { status, updated_at: new Date() };
    if (status === 'delivered') updates.delivered_date = new Date();
    await db('repairs').where({ id: req.params.id }).update(updates);
    const repair = await db('repairs').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'repairs', recordId: req.params.id, newValues: { status }, ipAddress: req.ip });
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
