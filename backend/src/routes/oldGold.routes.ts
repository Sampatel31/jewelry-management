import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listOldGoldTransactions,
  getOldGoldTransaction,
  createOldGoldTransaction,
  updateOldGoldTransaction,
  calculateExchangeValue,
} from '../controllers/oldGold.controller';

const router = Router();

router.use(authenticate);

router.get('/', listOldGoldTransactions);
router.get('/:id', getOldGoldTransaction);
router.post('/', createOldGoldTransaction);
router.put('/:id', updateOldGoldTransaction);
router.post('/calculate', calculateExchangeValue);

export default router;
