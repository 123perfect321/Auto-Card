import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import cardRoutes from './card.routes';
import paymentRoutes from './payment.routes';
import settingRoutes from './setting.routes';
import * as dashboardController from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cards', cardRoutes);
router.use('/payments', paymentRoutes);
router.use('/settings', settingRoutes);
router.get('/dashboard', authMiddleware, dashboardController.getDashboardStats);

export default router;
