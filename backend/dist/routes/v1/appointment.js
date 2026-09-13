"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth.js");
const constants_1 = require("../../utilities/constants.js");
const upload_1 = require("../../utilities/upload.js");
const router = (0, express_1.Router)();
// Protect all appointment routes
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.PATIENT, constants_1.USER_ROLES.ADMIN, constants_1.USER_ROLES.STAFF)); // Allow patients to book, and admins/staff to manage
const appointment_controller_1 = require("../../controllers/v1/appointment.controller.js");
// Book Appointment (Patient uploads documents and voice notes)
router.post('/book', (0, auth_1.restrictTo)(constants_1.USER_ROLES.PATIENT), upload_1.uploadMiddleware.fields([{ name: 'documents', maxCount: 5 }, { name: 'voiceNote', maxCount: 1 }]), appointment_controller_1.bookAppointment);
// Verify Razorpay Payment
router.post('/verify-payment', (0, auth_1.restrictTo)(constants_1.USER_ROLES.PATIENT), appointment_controller_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=appointment.js.map