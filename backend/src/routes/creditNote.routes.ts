import { Router } from 'express';
import { createCreditNote, getCreditNotes } from '../controllers/creditNote.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router({ mergeParams: true });
router.use(authenticate);
router.post('/', authorize('admin', 'manager', 'accountant'), createCreditNote);
router.get('/', getCreditNotes);
export default router;
