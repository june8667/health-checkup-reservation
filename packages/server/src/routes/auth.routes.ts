import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/send-phone-code', authController.sendPhoneCode);
router.post('/verify-phone', authController.verifyPhone);
router.put('/password', authMiddleware, authController.changePassword);

export default router;
