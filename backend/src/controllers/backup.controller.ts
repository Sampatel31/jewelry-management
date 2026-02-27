import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import db from '../config/db';
import { auditLog } from '../utils/audit';

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(os.homedir(), '.jewelry-manager', 'backups');
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '30', 10);

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export const exportBackup = async (req: Request, res: Response) => {
  try {
    ensureBackupDir();
    const dbType = process.env.DB_TYPE || 'postgres';
    const userId = (req as any).user?.id;

    if (dbType === 'sqlite') {
      const sqlitePath = process.env.SQLITE_PATH || path.join(os.homedir(), '.jewelry-manager', 'data.db');
      if (!fs.existsSync(sqlitePath)) {
        return res.status(404).json({ message: 'SQLite database file not found' });
      }
      const filename = `backup-${new Date().toISOString().split('T')[0]}.db`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      const stream = fs.createReadStream(sqlitePath);
      stream.pipe(res);
      await auditLog({ userId, action: 'EXPORT', tableName: 'backup', recordId: 'sqlite', ipAddress: req.ip });
    } else {
      // PostgreSQL dump via pg_dump
      const dbUrl = process.env.DATABASE_URL;
      const filename = `backup-${new Date().toISOString().split('T')[0]}.sql`;
      const outPath = path.join(BACKUP_DIR, filename);

      const args = dbUrl ? [dbUrl, '-f', outPath] : [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', process.env.DB_PORT || '5432',
        '-U', process.env.DB_USER || 'jewelry_user',
        '-d', process.env.DB_NAME || 'jewelry_db',
        '-f', outPath,
      ];

      await new Promise<void>((resolve, reject) => {
        const env = { ...process.env };
        if (process.env.DB_PASSWORD) env.PGPASSWORD = process.env.DB_PASSWORD;
        execFile('pg_dump', args, { env }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/sql');
      const stream = fs.createReadStream(outPath);
      stream.pipe(res);
      stream.on('end', () => {
        // Optionally keep the file for backup history
      });

      await auditLog({ userId, action: 'EXPORT', tableName: 'backup', recordId: 'postgres', ipAddress: req.ip });
    }
  } catch (err: any) {
    // Sanitize error message to avoid leaking credentials
    const safeMessage = (err.message || 'Unknown error')
      .replace(/postgresql:\/\/[^\s]+/gi, 'postgresql://[REDACTED]')
      .replace(/password=[^\s&]+/gi, 'password=[REDACTED]');
    res.status(500).json({ message: `Backup export failed: ${safeMessage}` });
  }
};

export const listBackups = async (req: Request, res: Response) => {
  try {
    ensureBackupDir();
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup-'))
      .map((f) => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return { filename: f, size: stat.size, created_at: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ backups: files });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createBackup = async (req: Request, res: Response) => {
  try {
    ensureBackupDir();
    const dbType = process.env.DB_TYPE || 'postgres';
    const userId = (req as any).user?.id;
    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (dbType === 'sqlite') {
      const sqlitePath = process.env.SQLITE_PATH || path.join(os.homedir(), '.jewelry-manager', 'data.db');
      if (!fs.existsSync(sqlitePath)) {
        return res.status(404).json({ message: 'SQLite database file not found' });
      }
      const filename = `backup-${date}.db`;
      const destPath = path.join(BACKUP_DIR, filename);
      fs.copyFileSync(sqlitePath, destPath);
      await auditLog({ userId, action: 'EXPORT', tableName: 'backup', recordId: 'sqlite', ipAddress: req.ip });
      res.json({ filename, message: 'Backup created successfully' });
    } else {
      const filename = `backup-${date}.sql`;
      const outPath = path.join(BACKUP_DIR, filename);
      const dbUrl = process.env.DATABASE_URL;
      const args = dbUrl ? [dbUrl, '-f', outPath] : [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', process.env.DB_PORT || '5432',
        '-U', process.env.DB_USER || 'jewelry_user',
        '-d', process.env.DB_NAME || 'jewelry_db',
        '-f', outPath,
      ];
      await new Promise<void>((resolve, reject) => {
        const env = { ...process.env };
        if (process.env.DB_PASSWORD) env.PGPASSWORD = process.env.DB_PASSWORD;
        execFile('pg_dump', args, { env }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await auditLog({ userId, action: 'EXPORT', tableName: 'backup', recordId: 'postgres', ipAddress: req.ip });
      res.json({ filename, message: 'Backup created successfully' });
    }
  } catch (err: any) {
    const safeMessage = (err.message || 'Unknown error')
      .replace(/postgresql:\/\/[^\s]+/gi, 'postgresql://[REDACTED]')
      .replace(/password=[^\s&]+/gi, 'password=[REDACTED]');
    res.status(500).json({ message: `Backup creation failed: ${safeMessage}` });
  }
};

export const downloadBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    // Prevent path traversal
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('\0') || !filename.startsWith('backup-')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    const contentType = filename.endsWith('.db') ? 'application/octet-stream' : 'application/sql';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const runAutoBackup = async () => {
  try {
    ensureBackupDir();
    const dbType = process.env.DB_TYPE || 'postgres';
    const date = new Date().toISOString().split('T')[0];

    if (dbType === 'sqlite') {
      const sqlitePath = process.env.SQLITE_PATH || path.join(os.homedir(), '.jewelry-manager', 'data.db');
      const destPath = path.join(BACKUP_DIR, `backup-${date}.db`);
      if (fs.existsSync(sqlitePath)) {
        fs.copyFileSync(sqlitePath, destPath);
      }
    } else {
      const outPath = path.join(BACKUP_DIR, `backup-${date}.sql`);
      const dbUrl = process.env.DATABASE_URL;
      const args = dbUrl ? [dbUrl, '-f', outPath] : [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', process.env.DB_PORT || '5432',
        '-U', process.env.DB_USER || 'jewelry_user',
        '-d', process.env.DB_NAME || 'jewelry_db',
        '-f', outPath,
      ];
      await new Promise<void>((resolve, reject) => {
        const env = { ...process.env };
        if (process.env.DB_PASSWORD) env.PGPASSWORD = process.env.DB_PASSWORD;
        execFile('pg_dump', args, { env }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Prune old backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup-'))
      .map((f) => ({ f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => a.mtime - b.mtime);

    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    for (const { f, mtime } of files) {
      if (mtime < cutoff) fs.unlinkSync(path.join(BACKUP_DIR, f));
    }
  } catch {
    // Auto-backup errors are non-fatal; logged separately
  }
};
