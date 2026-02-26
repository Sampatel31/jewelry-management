import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getByBarcode } from '../controllers/products.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/barcode/:barcode', getByBarcode);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
export default router;
