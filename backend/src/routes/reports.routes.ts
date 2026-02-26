import { Router } from 'express';
import { getDashboard, getSalesReport, getInventoryValuation, getTopProducts, getGSTReport, getCustomersReport } from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/sales', getSalesReport);
router.get('/inventory-valuation', getInventoryValuation);
router.get('/top-products', getTopProducts);
router.get('/gst', getGSTReport);
router.get('/customers', getCustomersReport);
export default router;
