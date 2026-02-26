import db from '../config/db';
import logger from './logger';

interface AuditParams {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId: string;
  oldValues?: object | null;
  newValues?: object | null;
  ipAddress?: string;
}

export const auditLog = async (params: AuditParams): Promise<void> => {
  try {
    await db('audit_logs').insert({
      user_id: params.userId,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      old_values: params.oldValues ? JSON.stringify(params.oldValues) : null,
      new_values: params.newValues ? JSON.stringify(params.newValues) : null,
      ip_address: params.ipAddress || null,
      created_at: new Date(),
    });
  } catch (err) {
    logger.error('audit_log_error', { err, params });
  }
};
