import { Router } from 'express';
import { getJobs, createJob, getJob, updateJobStatus, getBOM, saveBOM } from '../controllers/production.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.get('/jobs/:id', getJob);
router.put('/jobs/:id/status', updateJobStatus);
router.get('/bom/:productId', getBOM);
router.post('/bom', saveBOM);
export default router;
