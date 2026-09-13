"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const auth_1 = __importDefault(require("./auth"));
const admin_1 = __importDefault(require("./admin"));
const branch_1 = __importDefault(require("./branch"));
const public_1 = __importDefault(require("./public"));
const appointment_1 = __importDefault(require("./appointment"));
const doctor_1 = __importDefault(require("./doctor"));
const patient_1 = __importDefault(require("./patient"));
const referral_1 = __importDefault(require("./referral"));
const staff_1 = __importDefault(require("./staff"));
/**
 * @router v1Router
 * @base   /api/v1
 *
 * @description Combines all v1 route modules under a single router.
 *              Add new feature routes here as the application grows.
 */
const v1Router = (0, express_1.Router)();
// Mount feature routers
v1Router.use('/health', health_1.default);
v1Router.use('/auth', auth_1.default);
v1Router.use('/admin', admin_1.default);
v1Router.use('/branches', branch_1.default);
v1Router.use('/public', public_1.default);
v1Router.use('/appointments', appointment_1.default);
v1Router.use('/doctor', doctor_1.default);
v1Router.use('/patient', patient_1.default);
v1Router.use('/referral', referral_1.default);
v1Router.use('/staff', staff_1.default);
// Future routes to be implemented:
// v1Router.use('/doctors', doctorRouter);
// v1Router.use('/patients', patientRouter);
// v1Router.use('/appointments', appointmentRouter);
exports.default = v1Router;
//# sourceMappingURL=index.js.map