import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create', paymentController.createPayment);

// 易支付异步/同步回调：公网可达，不加 auth / rate-limit
router.get('/notify', paymentController.handleNotify);
router.post('/notify', paymentController.handleNotify);
router.get('/return', paymentController.handleReturn);

// 连接测试（仅管理员）
router.post('/test', authMiddleware, paymentController.testPayment);

export default router;
