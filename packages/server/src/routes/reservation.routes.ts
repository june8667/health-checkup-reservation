import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', reservationController.createReservation);
router.get('/my', reservationController.getMyReservations);
router.get('/number/:reservationNumber', reservationController.getReservationByNumber);
router.get('/:id', reservationController.getReservationById);
router.post('/:id/cancel', reservationController.cancelReservation);

export default router;
