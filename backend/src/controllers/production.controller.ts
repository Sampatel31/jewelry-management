import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = db('production_jobs')
      .join('products', 'production_jobs.product_id', 'products.id')
      .leftJoin('users', 'production_jobs.assigned_to', 'users.id')
      .select('production_jobs.*', 'products.name as product_name', 'users.name as assigned_to_name')
      .orderBy('production_jobs.created_at', 'desc');
    if (status) query = query.where('production_jobs.status', status);
    const jobs = await query;
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = uuidv4();
    const count = await db('production_jobs').count('* as c').first();
    const jobNumber = `JOB-${String(Number(count?.c || 0) + 1).padStart(4, '0')}`;
    await db('production_jobs').insert({
      id, job_number: jobNumber, ...req.body, status: 'pending',
      created_by: userId, created_at: new Date(), updated_at: new Date(),
    });
    const job = await db('production_jobs').where({ id }).first();
    res.status(201).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await db('production_jobs').where({ id: req.params.id }).first();
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updates: any = { status, updated_at: new Date() };
    if (status === 'completed') {
      updates.completed_date = new Date();
      const job = await db('production_jobs').where({ id: req.params.id }).first();
      await db.transaction(async (trx) => {
        await trx('production_jobs').where({ id: req.params.id }).update(updates);
        await trx('products').where({ id: job.product_id }).increment('stock_qty', job.quantity);
        await trx('inventory_transactions').insert({
          id: uuidv4(), product_id: job.product_id, transaction_type: 'production',
          quantity: job.quantity, reference_id: req.params.id, reference_type: 'production_job',
          created_by: (req as any).user.id, created_at: new Date(),
        });
      });
    } else {
      await db('production_jobs').where({ id: req.params.id }).update(updates);
    }
    const job = await db('production_jobs').where({ id: req.params.id }).first();
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getBOM = async (req: Request, res: Response) => {
  try {
    const bom = await db('bom_items').where({ product_id: req.params.productId }).select('*');
    res.json(bom);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const saveBOM = async (req: Request, res: Response) => {
  try {
    const { product_id, items } = req.body;
    await db.transaction(async (trx) => {
      await trx('bom_items').where({ product_id }).delete();
      if (items?.length) {
        const bomItems = items.map((item: any) => ({ id: uuidv4(), product_id, ...item }));
        await trx('bom_items').insert(bomItems);
      }
    });
    const bom = await db('bom_items').where({ product_id }).select('*');
    res.json(bom);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
