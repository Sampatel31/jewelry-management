import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { exportBackup, listBackups, createBackup, downloadBackup } from '../controllers/backup.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/export', exportBackup);
router.get('/list', listBackups);
router.post('/create', createBackup);
router.get('/download/:filename', downloadBackup);

export default router;
