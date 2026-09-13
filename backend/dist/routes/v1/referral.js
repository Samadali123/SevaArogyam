"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referral_controller_1 = require("../../controllers/v1/referral.controller.js");
const auth_1 = require("../../middlewares/auth.js");
const router = (0, express_1.Router)();
router.use(auth_1.isLoggedIn);
router.get('/dashboard', referral_controller_1.getReferralDashboard);
exports.default = router;
//# sourceMappingURL=referral.js.map