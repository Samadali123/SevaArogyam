"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("@controllers/v1/staff.controller");
const auth_1 = require("@middlewares/auth");
const constants_1 = require("@utilities/constants");
const router = (0, express_1.Router)();
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.STAFF, constants_1.USER_ROLES.ADMIN));
router.get('/dashboard', staff_controller_1.getDashboardStats);
router.get('/queue', staff_controller_1.getLiveQueue);
router.get('/doctors/:doctorId/offline-appointments', staff_controller_1.getDoctorOfflineAppointments);
router.post('/appointments/walkin', staff_controller_1.bookWalkInAppointment);
router.put('/appointments/:id/status', staff_controller_1.updateAppointmentStatus);
exports.default = router;
//# sourceMappingURL=staff.js.map