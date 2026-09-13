"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../controllers/index.js");
const router = (0, express_1.Router)();
// Public catalog routes (Accessible to website visitors without login)
router.get('/branches', index_1.publicController.getBranches);
router.get('/doctors', index_1.publicController.getDoctors);
router.get('/specialties', index_1.publicController.getSpecialties);
router.get('/care-services', index_1.publicController.getCareServices);
router.get('/articles', index_1.articleController.getPublicArticles);
router.post('/articles', index_1.articleController.createArticle);
router.put('/articles/:id', index_1.articleController.updateArticle);
router.delete('/articles/:id', index_1.articleController.deleteArticle);
exports.default = router;
//# sourceMappingURL=public.js.map