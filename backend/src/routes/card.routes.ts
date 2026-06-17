import { Router } from 'express';
import * as cardController from '../controllers/card.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/import', authMiddleware, cardController.importCards);
router.get('/', authMiddleware, cardController.getCardList);
router.post('/:id/invalidate', authMiddleware, cardController.invalidateCard);
router.get('/stats', authMiddleware, cardController.getCardStats);
router.delete('/spec/:specId', authMiddleware, cardController.clearSpecCards);
router.delete('/product/:productId', authMiddleware, cardController.clearProductCards);

export default router;
