"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("@controllers/index");
const patient_controller_1 = require("@controllers/v1/patient.controller");
const auth_1 = require("@middlewares/auth");
const constants_1 = require("@utilities/constants");
const router = (0, express_1.Router)();
// Protect all doctor routes
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.DOCTOR));
// Queue and Status
router.get('/appointments', index_1.doctorController.getPatientQueue);
router.put('/appointments/:id/status', index_1.doctorController.updateStatus);
router.put('/appointments/:id/reschedule', patient_controller_1.rescheduleAppointment);
router.put('/appointments/:id/cancel', patient_controller_1.cancelAppointment);
// Prescriptions
router.put('/appointments/:id/prescription', index_1.doctorController.writePrescription);
router.get('/appointments/:id/prescription/download', index_1.doctorController.downloadPrescription);
// Video Consultations
router.get('/appointments/:id/join-video', index_1.doctorController.joinVideoCall);
// Care Services Management (Pharmacy, Diagnostics, Lab)
router.post('/care-services', index_1.doctorController.createCareService);
router.get('/care-services', index_1.doctorController.getMyCareServices);
router.put('/care-services/:id', index_1.doctorController.updateCareService);
router.delete('/care-services/:id', index_1.doctorController.deleteCareService);
exports.default = router;
//# sourceMappingURL=doctor.js.map