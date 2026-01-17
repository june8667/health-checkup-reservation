import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Webhook (no auth)
router.post('/webhook/toss', paymentController.handleWebhook);

// Protected routes
router.use(authMiddleware);

router.post('/prepare', paymentController.preparePayment);
router.post('/confirm', paymentController.confirmPayment);
router.get('/my', paymentController.getMyPayments);
router.get('/:paymentKey', paymentController.getPaymentByKey);
router.post('/:paymentKey/cancel', paymentController.cancelPayment);

export default router;
