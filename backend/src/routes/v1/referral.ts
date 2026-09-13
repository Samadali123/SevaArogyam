import { Router } from 'express';
import { getReferralDashboard } from '@controllers/v1/referral.controller';
import { isLoggedIn } from '@middlewares/auth';

const router = Router();

router.use(isLoggedIn);

router.get('/dashboard', getReferralDashboard);

export default router;
