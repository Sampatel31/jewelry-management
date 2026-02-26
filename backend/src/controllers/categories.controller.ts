import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db('categories').select('*').orderBy('name');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    await db('categories').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const cat = await db('categories').where({ id }).first();
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    await db('categories').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const cat = await db('categories').where({ id: req.params.id }).first();
    res.json(cat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await db('categories').where({ id: req.params.id }).delete();
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
