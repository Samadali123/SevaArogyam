import { Router } from 'express';
import {
  getMyAppointments,
  joinVideoCall,
  createServiceOrder,
  getMyOrders,
  rescheduleAppointment,
  cancelAppointment,
  getPatientById,
  downloadToken,
  downloadPrescription,
  verifyServicePayment
} from '@controllers/v1/patient.controller';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';

const router = Router();

// Protect all patient routes
router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.PATIENT));

// View own appointments
router.get('/appointments', getMyAppointments);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// Download PDF Passes/Prescriptions
router.get('/appointments/:id/token/download', downloadToken);
router.get('/appointments/:id/prescription/download', downloadPrescription);

// Video Consultations
router.get('/appointments/:id/join-video', joinVideoCall);

// Care Services Orders (Pharmacy, Diagnostics, Lab)
router.post('/care-services/checkout', createServiceOrder);
router.post('/care-services/verify-payment', verifyServicePayment);
router.get('/care-services/orders', getMyOrders);

// Staff/Public utility to get patient by ID (Requires auth but not necessarily patient role, though here we are in patient router so it will be accessed by patients too, or we can expose it via public/staff)
router.get('/id/:patientId', getPatientById);

export default router;
