import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getRepairs = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = db('repairs').join('customers', 'repairs.customer_id', 'customers.id')
      .select('repairs.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
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
    const count = await db('repairs').count('* as c').first();
    const repairNumber = `REP-${String(Number(count?.c || 0) + 1).padStart(4, '0')}`;
    await db('repairs').insert({
      id, repair_number: repairNumber, ...req.body, status: 'received',
      created_at: new Date(), updated_at: new Date(),
    });
    const repair = await db('repairs').where({ id }).first();
    res.status(201).json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getRepair = async (req: Request, res: Response) => {
  try {
    const repair = await db('repairs').join('customers', 'repairs.customer_id', 'customers.id')
      .select('repairs.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .where('repairs.id', req.params.id).first();
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRepair = async (req: Request, res: Response) => {
  try {
    await db('repairs').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const repair = await db('repairs').where({ id: req.params.id }).first();
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRepairStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updates: any = { status, updated_at: new Date() };
    if (status === 'delivered') updates.delivered_date = new Date();
    await db('repairs').where({ id: req.params.id }).update(updates);
    const repair = await db('repairs').where({ id: req.params.id }).first();
    res.json(repair);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
