import { Router, Request, Response } from 'express';
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
// Invoices must not be hard-deleted; return 405 Method Not Allowed
router.delete('/invoices/:id', (_req: Request, res: Response) => {
  res.status(405).json({ message: 'Invoice deletion is not allowed. Use void/cancel status instead.' });
});
export default router;
