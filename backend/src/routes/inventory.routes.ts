import { Router } from 'express';
import { adjustStock, getTransactions, getLowStock } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/adjust', adjustStock);
router.get('/transactions', getTransactions);
router.get('/low-stock', getLowStock);
export default router;
