import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = db('customers').select('*');
    if (search) query = query.where('name', 'ilike', `%${search}%`).orWhere('phone', 'ilike', `%${search}%`);
    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('* as count').first();
    const customers = await query.limit(Number(limit)).offset(offset).orderBy('created_at', 'desc');
    res.json({ customers, total: Number(total?.count || 0) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await db('customers').where({ id: req.params.id }).first();
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    await db('customers').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const customer = await db('customers').where({ id }).first();
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    await db('customers').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const customer = await db('customers').where({ id: req.params.id }).first();
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await db('customers').where({ id: req.params.id }).delete();
    res.json({ message: 'Customer deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await db('invoices').where({ customer_id: req.params.id }).orderBy('created_at', 'desc');
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerRepairs = async (req: Request, res: Response) => {
  try {
    const repairs = await db('repairs').where({ customer_id: req.params.id }).orderBy('created_at', 'desc');
    res.json(repairs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUpcomingBirthdays = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const in30 = new Date(today);
    in30.setDate(today.getDate() + 30);
    const customers = await db('customers')
      .whereNotNull('birthday')
      .whereRaw(`EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday) 
        BETWEEN ? AND ?`,
        [today.getMonth() * 100 + today.getDate(), in30.getMonth() * 100 + in30.getDate()])
      .select('*');
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
