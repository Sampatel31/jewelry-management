import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await db('settings').select('*');
    const map: any = {};
    settings.forEach((s: any) => map[s.key] = s.value);
    res.json(map);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db('settings').insert({ id: uuidv4(), key, value: String(value) })
        .onConflict('key').merge({ value: String(value) });
    }
    res.json({ message: 'Settings updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMetalRates = async (req: Request, res: Response) => {
  try {
    const rates = await db('metal_rates').orderBy('effective_date', 'desc').limit(30);
    res.json(rates);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const addMetalRate = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    await db('metal_rates').insert({ id, ...req.body, created_at: new Date() });
    const rate = await db('metal_rates').where({ id }).first();
    res.status(201).json(rate);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await db('users').join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'users.name', 'users.email', 'users.phone', 'users.is_active', 'roles.name as role')
      .orderBy('users.name');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, role_name, ...userData } = req.body;
    const role = await db('roles').where({ name: role_name || 'staff' }).first();
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db('users').insert({
      id, ...userData, password_hash: passwordHash,
      role_id: role.id, created_at: new Date(), updated_at: new Date(),
    });
    const user = await db('users').where({ id }).first();
    res.status(201).json({ ...user, password_hash: undefined });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, role_name, ...userData } = req.body;
    if (role_name) {
      const role = await db('roles').where({ name: role_name }).first();
      userData.role_id = role.id;
    }
    if (password) {
      userData.password_hash = await bcrypt.hash(password, 10);
    }
    await db('users').where({ id: req.params.id }).update({ ...userData, updated_at: new Date() });
    const user = await db('users').where({ id: req.params.id }).first();
    res.json({ ...user, password_hash: undefined });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
