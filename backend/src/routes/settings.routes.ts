import { Router } from 'express';
import { getSettings, updateSettings, getMetalRates, addMetalRate, getUsers, createUser, updateUser } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/metal-rates', getMetalRates);
router.post('/metal-rates', addMetalRate);
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.put('/users/:id', authorize('admin'), updateUser);
export default router;
