import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerInvoices, getCustomerRepairs, getUpcomingBirthdays } from '../controllers/customers.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/upcoming/birthdays', getUpcomingBirthdays);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.get('/:id/invoices', getCustomerInvoices);
router.get('/:id/repairs', getCustomerRepairs);
export default router;
