import { Router } from 'express';
import { authController } from '@controllers/index';
import { isLoggedIn } from '@middlewares/auth';

const router = Router();

// Single Admin Creation (Developer / Setup API)
router.post('/create-admin', authController.createAdmin);

// Patient OTP Auth
router.post('/patient/send-otp', authController.sendPatientOTP);
router.post('/patient/verify-otp', authController.verifyPatientOTP);

// Password Authentication (Admin, Doctors & Desk Staff)
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.use(isLoggedIn);
router.post('/logout', authController.logout);

export default router;
