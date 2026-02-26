import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await db('users').join('roles', 'users.role_id', 'roles.id')
      .where('users.email', email).where('users.is_active', true)
      .select('users.*', 'roles.name as role_name').first();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user.id, email: user.email, role: user.role_name, name: user.name };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    res.json({ token, refreshToken, user: payload });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const payload = { id: user.id, email: user.email, role: decoded.role, name: user.name };
    const token = generateToken(payload);
    res.json({ token });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dbUser = await db('users').join('roles', 'users.role_id', 'roles.id')
      .where('users.id', user.id)
      .select('users.id', 'users.name', 'users.email', 'users.phone', 'roles.name as role').first();
    res.json(dbUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;
    const user = await db('users').where({ id: userId }).first();
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db('users').where({ id: userId }).update({ password_hash: hash });
    res.json({ message: 'Password updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
