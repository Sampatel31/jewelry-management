import { Router } from 'express';
import { createDebitNote, getDebitNotes } from '../controllers/debitNote.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router({ mergeParams: true });
router.use(authenticate);
router.post('/', authorize('admin', 'manager', 'accountant'), createDebitNote);
router.get('/', getDebitNotes);
export default router;
