import { Router } from 'express';
import {
  createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor,
  createStaff, getStaff, getStaffById, updateStaff, deleteStaff,
  getPatients,
  getDashboardStats, getRevenueAudit, getTransactionRecords, getEMRLogs,
  getSystemSettings, updateSystemSettings,
  createCareService, getAdminCareServices, updateCareService, deleteCareService
} from '@controllers/v1/admin.controller';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';
import { uploadMiddleware } from '@utilities/upload';

const router = Router();

// Protect all admin routes
router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.ADMIN));

// ─────────────────────────────────────────────
// Doctor Routes
// ─────────────────────────────────────────────
router.post('/doctors', uploadMiddleware.single('profilePhoto'), createDoctor);
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.put('/doctors/:id', uploadMiddleware.single('profilePhoto'), updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// ─────────────────────────────────────────────
// Staff Routes
// ─────────────────────────────────────────────
router.post('/staff', uploadMiddleware.single('profilePhoto'), createStaff);
router.get('/staff', getStaff);
router.get('/staff/:id', getStaffById);
router.put('/staff/:id', uploadMiddleware.single('profilePhoto'), updateStaff);
router.delete('/staff/:id', deleteStaff);

// ─────────────────────────────────────────────
// Patient Routes
// ─────────────────────────────────────────────
router.get('/patients', getPatients);


// Dashboards and Audit
router.get('/dashboard-stats', getDashboardStats);
router.get('/revenue-audit', getRevenueAudit);
router.get('/transactions', getTransactionRecords);
router.get('/emr-logs', getEMRLogs);

// System Settings (Commissions & Referrals)
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// ─────────────────────────────────────────────
// Care Services Routes
// ─────────────────────────────────────────────
router.post('/care-services', createCareService);
router.get('/care-services', getAdminCareServices);
router.put('/care-services/:id', updateCareService);
router.delete('/care-services/:id', deleteCareService);


export default router;
