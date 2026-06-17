import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create', paymentController.createPayment);
router.post('/callback/:method', paymentController.handleCallback);
router.post('/test', authMiddleware, paymentController.testPayment);

export default router;
