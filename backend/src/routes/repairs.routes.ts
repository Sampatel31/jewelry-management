import { Router } from 'express';
import { getRepairs, createRepair, getRepair, updateRepair, updateRepairStatus } from '../controllers/repairs.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getRepairs);
router.post('/', createRepair);
router.get('/:id', getRepair);
router.put('/:id', updateRepair);
router.put('/:id/status', updateRepairStatus);
export default router;
