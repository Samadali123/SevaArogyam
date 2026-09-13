import { Router } from 'express';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';
import { uploadMiddleware } from '@utilities/upload';

const router = Router();

// Protect all appointment routes
router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.PATIENT, USER_ROLES.ADMIN, USER_ROLES.STAFF)); // Allow patients to book, and admins/staff to manage

import { bookAppointment, verifyPayment } from '@controllers/v1/appointment.controller';

// Book Appointment (Patient uploads documents and voice notes)
router.post('/book', restrictTo(USER_ROLES.PATIENT), uploadMiddleware.fields([{ name: 'documents', maxCount: 5 }, { name: 'voiceNote', maxCount: 1 }]), bookAppointment);

// Verify Razorpay Payment
router.post('/verify-payment', restrictTo(USER_ROLES.PATIENT), verifyPayment);

export default router;
