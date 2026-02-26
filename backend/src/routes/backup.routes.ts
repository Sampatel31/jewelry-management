import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { exportBackup, listBackups } from '../controllers/backup.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/export', exportBackup);
router.get('/list', listBackups);

export default router;
