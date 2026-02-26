import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';
import { cacheGet, cacheSet, cacheDelPattern } from '../utils/cache';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const cached = await cacheGet('categories:all');
    if (cached) return res.json(JSON.parse(cached));
    const categories = await db('categories').select('*').orderBy('name');
    await cacheSet('categories:all', JSON.stringify(categories), 60);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const userId = (req as any).user?.id;
    await db('categories').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const cat = await db('categories').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'categories', recordId: id, newValues: cat, ipAddress: req.ip });
    await cacheDelPattern('categories:*');
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const old = await db('categories').where({ id: req.params.id }).first();
    await db('categories').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const cat = await db('categories').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'categories', recordId: req.params.id, oldValues: old, newValues: cat, ipAddress: req.ip });
    await cacheDelPattern('categories:*');
    res.json(cat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await db('categories').where({ id: req.params.id }).delete();
    await auditLog({ userId, action: 'DELETE', tableName: 'categories', recordId: req.params.id, ipAddress: req.ip });
    await cacheDelPattern('categories:*');
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
