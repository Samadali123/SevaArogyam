"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("@controllers/index");
const auth_1 = require("@middlewares/auth");
const router = (0, express_1.Router)();
// Admin OTP Auth
router.post('/admin/send-otp', index_1.authController.sendAdminOTP);
router.post('/admin/verify-otp', index_1.authController.verifyAdminOTP);
// Patient OTP Auth
router.post('/patient/send-otp', index_1.authController.sendPatientOTP);
router.post('/patient/verify-otp', index_1.authController.verifyPatientOTP);
// Password Authentication (Doctors & Staff)
router.post('/login', index_1.authController.login);
router.post('/forgot-password', index_1.authController.forgotPassword);
router.post('/reset-password/:token', index_1.authController.resetPassword);
// Protected routes
router.use(auth_1.isLoggedIn);
router.post('/logout', index_1.authController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map