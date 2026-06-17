import { Router } from 'express';
import * as settingController from '../controllers/setting.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, settingController.getSettings);
router.put('/', authMiddleware, settingController.updateSettings);
router.get('/:key', authMiddleware, settingController.getSetting);

export default router;
