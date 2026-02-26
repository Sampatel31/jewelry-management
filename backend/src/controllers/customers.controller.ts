import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = db('customers').whereNull('deleted_at').select('*');
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
    const customer = await db('customers').where({ id: req.params.id }).whereNull('deleted_at').first();
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const userId = (req as any).user?.id;
    await db('customers').insert({ id, ...req.body, created_at: new Date(), updated_at: new Date() });
    const customer = await db('customers').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'customers', recordId: id, newValues: customer, ipAddress: req.ip });
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const old = await db('customers').where({ id: req.params.id }).first();
    await db('customers').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const customer = await db('customers').where({ id: req.params.id }).first();
    await auditLog({ userId, action: 'UPDATE', tableName: 'customers', recordId: req.params.id, oldValues: old, newValues: customer, ipAddress: req.ip });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await db('customers').where({ id: req.params.id }).update({ deleted_at: new Date(), updated_at: new Date() });
    await auditLog({ userId, action: 'DELETE', tableName: 'customers', recordId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Customer deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await db('invoices').where({ customer_id: req.params.id }).whereNull('deleted_at').orderBy('created_at', 'desc');
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerRepairs = async (req: Request, res: Response) => {
  try {
    const repairs = await db('repairs').where({ customer_id: req.params.id }).whereNull('deleted_at').orderBy('created_at', 'desc');
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
    const todayMMDD = (today.getMonth() + 1) * 100 + today.getDate();
    const in30MMDD = (in30.getMonth() + 1) * 100 + in30.getDate();
    let customers;
    if (todayMMDD <= in30MMDD) {
      customers = await db('customers')
        .whereNotNull('birthday')
        .whereNull('deleted_at')
        .whereRaw(
          `EXTRACT(MONTH FROM birthday)::int * 100 + EXTRACT(DAY FROM birthday)::int BETWEEN ? AND ?`,
          [todayMMDD, in30MMDD]
        )
        .select('*');
    } else {
      customers = await db('customers')
        .whereNotNull('birthday')
        .whereNull('deleted_at')
        .whereRaw(
          `EXTRACT(MONTH FROM birthday)::int * 100 + EXTRACT(DAY FROM birthday)::int >= ? OR EXTRACT(MONTH FROM birthday)::int * 100 + EXTRACT(DAY FROM birthday)::int <= ?`,
          [todayMMDD, in30MMDD]
        )
        .select('*');
    }
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
