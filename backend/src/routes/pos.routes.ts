import { Router } from 'express';
import { completeSale, searchProducts } from '../controllers/pos.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/sale', completeSale);
router.get('/search', searchProducts);
export default router;
