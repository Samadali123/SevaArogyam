import { Router } from 'express';
import { publicController, articleController } from '@controllers/index';

const router = Router();

// Public catalog routes (Accessible to website visitors without login)
router.get('/branches', publicController.getBranches);
router.get('/doctors', publicController.getDoctors);
router.get('/specialties', publicController.getSpecialties);
router.get('/care-services', publicController.getCareServices);
router.get('/articles', articleController.getPublicArticles);

export default router;
