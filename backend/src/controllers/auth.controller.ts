import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../config/db';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { auditLog } from '../utils/audit';
import logger from '../utils/logger';
import { PASSWORD_REGEX } from '../validators';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

    // Store hashed refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: new Date(),
    }).catch(() => {}); // graceful - table may not exist yet

    res.json({ token, refreshToken, user: payload });
  } catch (err: any) {
    logger.error('login_error', { err });
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    // Validate against DB (graceful - if table doesn't exist, fall back)
    try {
      const stored = await db('refresh_tokens')
        .where({ token_hash: tokenHash, revoked: false })
        .where('expires_at', '>', new Date())
        .first();
      if (!stored) return res.status(401).json({ message: 'Invalid or expired refresh token' });

      // Revoke old token (rotation)
      await db('refresh_tokens').where({ token_hash: tokenHash }).update({
        revoked: true,
        revoked_at: new Date(),
      });
    } catch {
      // table doesn't exist yet, skip DB check
    }

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    const payload = { id: user.id, email: user.email, role: decoded.role, name: user.name };
    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: hashToken(newRefreshToken),
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: new Date(),
    }).catch(() => {});

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db('refresh_tokens')
        .where({ token_hash: hashToken(refreshToken) })
        .update({ revoked: true, revoked_at: new Date() })
        .catch(() => {});
    }
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.json({ message: 'Logged out successfully' });
  }
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
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
      });
    }
    const userId = (req as any).user.id;
    const user = await db('users').where({ id: userId }).first();
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await db('users').where({ id: userId }).update({ password_hash: hash });
    await auditLog({
      userId,
      action: 'UPDATE',
      tableName: 'users',
      recordId: userId,
      newValues: { password_changed: true },
      ipAddress: req.ip,
    });
    res.json({ message: 'Password updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
