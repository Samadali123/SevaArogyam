import { Router } from 'express';
import { getDashboardStats, getLiveQueue, bookWalkInAppointment, updateAppointmentStatus, getDoctorOfflineAppointments } from '@controllers/v1/staff.controller';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';

const router = Router();

router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.STAFF, USER_ROLES.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/queue', getLiveQueue);
router.get('/doctors/:doctorId/offline-appointments', getDoctorOfflineAppointments);
router.post('/appointments/walkin', bookWalkInAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);

export default router;
