import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';
import { cacheGet, cacheSet, cacheDelPattern } from '../utils/cache';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, category_id, metal_type, low_stock } = req.query;
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    let query = db('products').join('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name')
      .where('products.is_active', true)
      .whereNull('products.deleted_at');
    if (search) query = query.where('products.name', 'ilike', `%${search}%`);
    if (category_id) query = query.where('products.category_id', category_id);
    if (metal_type) query = query.where('products.metal_type', metal_type);
    if (low_stock === 'true') query = query.whereRaw('products.stock_qty <= products.min_stock_qty');
    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const products = await query.limit(Number(limit)).offset(offset).orderBy('products.created_at', 'desc');
    const result = { products, total: Number(total?.count || 0), page: Number(page), limit: Number(limit) };
    await cacheSet(cacheKey, JSON.stringify(result), 60);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await db('products').where({ id: req.params.id }).whereNull('deleted_at').first();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const userId = (req as any).user?.id;
    await db('products').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const product = await db('products').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'products', recordId: id, newValues: product, ipAddress: req.ip });
    await cacheDelPattern('products:*');
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const old = await db('products').where({ id: req.params.id }).first();
    await db('products').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const product = await db('products').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'products', recordId: req.params.id, oldValues: old, newValues: product, ipAddress: req.ip });
    await cacheDelPattern('products:*');
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await db('products').where({ id: req.params.id }).update({ is_active: false, deleted_at: new Date(), updated_at: new Date() });
    await auditLog({ userId, action: 'DELETE', tableName: 'products', recordId: req.params.id, ipAddress: req.ip });
    await cacheDelPattern('products:*');
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getByBarcode = async (req: Request, res: Response) => {
  try {
    const product = await db('products').where({ barcode: req.params.barcode }).whereNull('deleted_at').first();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
