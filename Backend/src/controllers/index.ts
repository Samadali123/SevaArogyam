/**
 * @file controllers/index.ts
 * @description Barrel export for all controllers.
 *              Import controllers from here instead of their individual files.
 */
export * as healthCheckController from './v1/health.controller';
export * as authController from './v1/auth.controller';
export * as adminController from './v1/admin.controller';
export * as branchController from './v1/branch.controller';
export * as publicController from './v1/public.controller';
export * as appointmentController from './v1/appointment.controller';
export * as doctorController from './v1/doctor.controller';
export * as patientController from './v1/patient.controller';
export * as articleController from './v1/article.controller';
