import { Router } from 'express';
import { doctorController, articleController } from '@controllers/index';
import { rescheduleAppointment, cancelAppointment } from '@controllers/v1/patient.controller';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';

const router = Router();

// Protect all doctor routes
router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.DOCTOR));

// Queue and Status
router.get('/appointments', doctorController.getPatientQueue);
router.put('/appointments/:id/status', doctorController.updateStatus);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// Prescriptions
router.put('/appointments/:id/prescription', doctorController.writePrescription);
router.get('/appointments/:id/prescription/download', doctorController.downloadPrescription);

// Video Consultations
router.get('/appointments/:id/join-video', doctorController.joinVideoCall);

// Care Services Management (Pharmacy, Diagnostics, Lab)
router.post('/care-services', doctorController.createCareService);
router.get('/care-services', doctorController.getMyCareServices);
router.put('/care-services/:id', doctorController.updateCareService);
router.delete('/care-services/:id', doctorController.deleteCareService);

// Health Articles Management (Doctor Publications)
router.get('/articles', articleController.getDoctorArticles);
router.post('/articles', articleController.createArticle);
router.put('/articles/:id', articleController.updateArticle);
router.delete('/articles/:id', articleController.deleteArticle);

export default router;
