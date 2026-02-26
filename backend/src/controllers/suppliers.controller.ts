import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = db('suppliers').where('is_active', true);
    if (search) query = query.where('name', 'ilike', `%${search}%`);
    const suppliers = await query.select('*').orderBy('name');
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await db('suppliers').where({ id: req.params.id }).first();
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    await db('suppliers').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const supplier = await db('suppliers').where({ id }).first();
    res.status(201).json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    await db('suppliers').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const supplier = await db('suppliers').where({ id: req.params.id }).first();
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    await db('suppliers').where({ id: req.params.id }).update({ is_active: false });
    res.json({ message: 'Supplier deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
