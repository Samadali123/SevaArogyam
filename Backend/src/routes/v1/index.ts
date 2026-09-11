import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import adminRouter from './admin';
import branchRouter from './branch';
import publicRouter from './public';
import appointmentRouter from './appointment';
import doctorRouter from './doctor';
import patientRouter from './patient';
import referralRouter from './referral';
import staffRouter from './staff';

/**
 * @router v1Router
 * @base   /api/v1
 *
 * @description Combines all v1 route modules under a single router.
 *              Add new feature routes here as the application grows.
 */
const v1Router = Router();

// Mount feature routers
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/branches', branchRouter);
v1Router.use('/public', publicRouter);
v1Router.use('/appointments', appointmentRouter);
v1Router.use('/doctor', doctorRouter);
v1Router.use('/patient', patientRouter);
v1Router.use('/referral', referralRouter);
v1Router.use('/staff', staffRouter);

// Future routes to be implemented:
// v1Router.use('/doctors', doctorRouter);
// v1Router.use('/patients', patientRouter);
// v1Router.use('/appointments', appointmentRouter);

export default v1Router;
