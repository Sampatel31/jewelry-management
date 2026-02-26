import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = db('suppliers').where('is_active', true).whereNull('deleted_at');
    if (search) query = query.where('name', 'ilike', `%${search}%`);
    const suppliers = await query.select('*').orderBy('name');
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await db('suppliers').where({ id: req.params.id }).whereNull('deleted_at').first();
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const userId = (req as any).user?.id;
    await db('suppliers').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const supplier = await db('suppliers').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'suppliers', recordId: id, newValues: supplier, ipAddress: req.ip });
    res.status(201).json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const old = await db('suppliers').where({ id: req.params.id }).first();
    await db('suppliers').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const supplier = await db('suppliers').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'suppliers', recordId: req.params.id, oldValues: old, newValues: supplier, ipAddress: req.ip });
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await db('suppliers').where({ id: req.params.id }).update({ is_active: false, deleted_at: new Date() });
    await auditLog({ userId, action: 'DELETE', tableName: 'suppliers', recordId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Supplier deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
