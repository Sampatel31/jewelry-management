import { Router } from 'express';
import { createInvoice, getInvoices, getInvoice, updateInvoice, addPayment, downloadPDF } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id/pdf', downloadPDF);
router.get('/invoices/:id', getInvoice);
router.put('/invoices/:id', updateInvoice);
router.post('/invoices/:id/payment', addPayment);
export default router;
