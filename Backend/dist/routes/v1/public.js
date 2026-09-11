"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("@controllers/index");
const router = (0, express_1.Router)();
// Public catalog routes (Accessible to website visitors without login)
router.get('/branches', index_1.publicController.getBranches);
router.get('/doctors', index_1.publicController.getDoctors);
router.get('/specialties', index_1.publicController.getSpecialties);
router.get('/care-services', index_1.publicController.getCareServices);
exports.default = router;
//# sourceMappingURL=public.js.map