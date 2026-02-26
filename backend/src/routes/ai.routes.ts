import { Router } from 'express';
import { aiChat } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/chat', authenticate, aiChat);
export default router;
