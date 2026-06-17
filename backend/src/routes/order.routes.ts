import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createOrderValidation, queryOrderValidation, orderNoParamValidation } from '../middlewares/validation';
import { orderLimiter, queryLimiter, paymentSimLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/', orderLimiter, createOrderValidation, orderController.createOrder);
router.get('/status/:orderNo', orderNoParamValidation, orderController.getOrderStatus);
router.get('/status-by-token/:token', orderController.getOrderStatusByToken);
router.get('/query', queryLimiter, queryOrderValidation, orderController.queryOrder);
router.get('/query-by-token', queryLimiter, orderController.queryOrderByToken);
router.post('/simulate-pay', paymentSimLimiter, orderController.simulatePayment);
router.post('/simulate-pay-by-token', paymentSimLimiter, orderController.simulatePaymentByToken);
router.get('/admin/list', authMiddleware, orderController.getAdminOrderList);

export default router;
