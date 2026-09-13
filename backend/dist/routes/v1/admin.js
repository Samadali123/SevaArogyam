"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../../controllers/v1/admin.controller.js");
const auth_1 = require("../../middlewares/auth.js");
const constants_1 = require("../../utilities/constants.js");
const upload_1 = require("../../utilities/upload.js");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.ADMIN));
// ─────────────────────────────────────────────
// Doctor Routes
// ─────────────────────────────────────────────
router.post('/doctors', upload_1.uploadMiddleware.single('profilePhoto'), admin_controller_1.createDoctor);
router.get('/doctors', admin_controller_1.getDoctors);
router.get('/doctors/:id', admin_controller_1.getDoctorById);
router.put('/doctors/:id', upload_1.uploadMiddleware.single('profilePhoto'), admin_controller_1.updateDoctor);
router.delete('/doctors/:id', admin_controller_1.deleteDoctor);
// ─────────────────────────────────────────────
// Staff Routes
// ─────────────────────────────────────────────
router.post('/staff', upload_1.uploadMiddleware.single('profilePhoto'), admin_controller_1.createStaff);
router.get('/staff', admin_controller_1.getStaff);
router.get('/staff/:id', admin_controller_1.getStaffById);
router.put('/staff/:id', upload_1.uploadMiddleware.single('profilePhoto'), admin_controller_1.updateStaff);
router.delete('/staff/:id', admin_controller_1.deleteStaff);
// ─────────────────────────────────────────────
// Patient Routes
// ─────────────────────────────────────────────
router.get('/patients', admin_controller_1.getPatients);
// Dashboards and Audit
router.get('/dashboard-stats', admin_controller_1.getDashboardStats);
router.get('/revenue-audit', admin_controller_1.getRevenueAudit);
router.get('/transactions', admin_controller_1.getTransactionRecords);
router.get('/emr-logs', admin_controller_1.getEMRLogs);
// System Settings (Commissions & Referrals)
router.get('/settings', admin_controller_1.getSystemSettings);
router.put('/settings', admin_controller_1.updateSystemSettings);
// ─────────────────────────────────────────────
// Care Services Routes
// ─────────────────────────────────────────────
router.post('/care-services', admin_controller_1.createCareService);
router.get('/care-services', admin_controller_1.getAdminCareServices);
router.put('/care-services/:id', admin_controller_1.updateCareService);
router.delete('/care-services/:id', admin_controller_1.deleteCareService);
// ─────────────────────────────────────────────
// Specialty Routes
// ─────────────────────────────────────────────
router.post('/specialties', admin_controller_1.createSpecialty);
router.get('/specialties', admin_controller_1.getAdminSpecialties);
router.put('/specialties/:id', admin_controller_1.updateSpecialty);
router.delete('/specialties/:id', admin_controller_1.deleteSpecialty);
exports.default = router;
//# sourceMappingURL=admin.js.map