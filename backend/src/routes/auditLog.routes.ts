import { Router, Request, Response } from 'express';
import db from '../config/db';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', authorize('admin', 'accountant'), async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id, user_id, from, to, page = 1, limit = 50 } = req.query;
    let query = db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select('audit_logs.*', 'users.name as user_name', 'users.email as user_email')
      .orderBy('audit_logs.created_at', 'desc');

    if (entity_type) query = query.where('audit_logs.table_name', entity_type as string);
    if (entity_id) query = query.where('audit_logs.record_id', entity_id as string);
    if (user_id) query = query.where('audit_logs.user_id', user_id as string);
    if (from) query = query.where('audit_logs.created_at', '>=', new Date(from as string));
    if (to) query = query.where('audit_logs.created_at', '<=', new Date(to as string));

    const offset = (Number(page) - 1) * Number(limit);
    const total = await query.clone().count('audit_logs.id as count').first();
    const logs = await query.limit(Number(limit)).offset(offset);
    res.json({ logs, total: Number(total?.count || 0) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
