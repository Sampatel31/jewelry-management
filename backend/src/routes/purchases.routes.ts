import { Router } from 'express';
import { getOrders, createOrder, getOrder, receiveGoods } from '../controllers/purchases.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/receive', receiveGoods);
export default router;
