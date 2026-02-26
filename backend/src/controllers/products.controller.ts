import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, category_id, metal_type, low_stock } = req.query;
    let query = db('products').join('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name')
      .where('products.is_active', true);
    if (search) query = query.where('products.name', 'ilike', `%${search}%`);
    if (category_id) query = query.where('products.category_id', category_id);
    if (metal_type) query = query.where('products.metal_type', metal_type);
    if (low_stock === 'true') query = query.whereRaw('products.stock_qty <= products.min_stock_qty');
    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const products = await query.limit(Number(limit)).offset(offset).orderBy('products.created_at', 'desc');
    res.json({ products, total: Number(total?.count || 0), page: Number(page), limit: Number(limit) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await db('products').where({ id: req.params.id }).first();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    await db('products').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const product = await db('products').where({ id }).first();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    await db('products').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const product = await db('products').where({ id: req.params.id }).first();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await db('products').where({ id: req.params.id }).update({ is_active: false, updated_at: new Date() });
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getByBarcode = async (req: Request, res: Response) => {
  try {
    const product = await db('products').where({ barcode: req.params.barcode }).first();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
