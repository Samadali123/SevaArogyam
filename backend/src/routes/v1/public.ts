import { Router } from 'express';
import { publicController, articleController } from '@controllers/index';

const router = Router();

// Public catalog routes (Accessible to website visitors without login)
router.get('/branches', publicController.getBranches);
router.get('/doctors', publicController.getDoctors);
router.get('/care-services', publicController.getCareServices);
router.get('/articles', articleController.getPublicArticles);
router.post('/articles', articleController.createArticle);
router.put('/articles/:id', articleController.updateArticle);
router.delete('/articles/:id', articleController.deleteArticle);

export default router;
