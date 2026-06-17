import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/admin/all', authMiddleware, categoryController.getAllCategories);
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

export default router;
