import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', productController.getProductList);
router.get('/:id', productController.getProductDetail);
router.get('/admin/list', authMiddleware, productController.getAdminProductList);
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.patch('/:id/status', authMiddleware, productController.toggleProductStatus);

export default router;
