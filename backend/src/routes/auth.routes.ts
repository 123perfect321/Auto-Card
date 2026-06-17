import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginValidation, changePasswordValidation } from '../middlewares/validation';
import { loginLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/login', loginLimiter, loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getAdminInfo);
router.put('/password', authMiddleware, changePasswordValidation, authController.changePassword);

export default router;
