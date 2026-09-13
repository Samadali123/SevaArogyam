"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../../controllers/v1/patient.controller.js");
const auth_1 = require("../../middlewares/auth.js");
const constants_1 = require("../../utilities/constants.js");
const router = (0, express_1.Router)();
// Protect all patient routes
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.PATIENT));
// View own appointments
router.get('/appointments', patient_controller_1.getMyAppointments);
router.put('/appointments/:id/reschedule', patient_controller_1.rescheduleAppointment);
router.put('/appointments/:id/cancel', patient_controller_1.cancelAppointment);
// Download PDF Passes/Prescriptions
router.get('/appointments/:id/token/download', patient_controller_1.downloadToken);
router.get('/appointments/:id/prescription/download', patient_controller_1.downloadPrescription);
// Video Consultations
router.get('/appointments/:id/join-video', patient_controller_1.joinVideoCall);
// Care Services Orders (Pharmacy, Diagnostics, Lab)
router.post('/care-services/checkout', patient_controller_1.createServiceOrder);
router.post('/care-services/verify-payment', patient_controller_1.verifyServicePayment);
router.get('/care-services/orders', patient_controller_1.getMyOrders);
// Staff/Public utility to get patient by ID (Requires auth but not necessarily patient role, though here we are in patient router so it will be accessed by patients too, or we can expose it via public/staff)
router.get('/id/:patientId', patient_controller_1.getPatientById);
exports.default = router;
//# sourceMappingURL=patient.js.map