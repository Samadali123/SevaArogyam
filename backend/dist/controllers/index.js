"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleController = exports.patientController = exports.doctorController = exports.appointmentController = exports.publicController = exports.branchController = exports.adminController = exports.authController = exports.healthCheckController = void 0;
/**
 * @file controllers/index.ts
 * @description Barrel export for all controllers.
 *              Import controllers from here instead of their individual files.
 */
exports.healthCheckController = __importStar(require("./v1/health.controller"));
exports.authController = __importStar(require("./v1/auth.controller"));
exports.adminController = __importStar(require("./v1/admin.controller"));
exports.branchController = __importStar(require("./v1/branch.controller"));
exports.publicController = __importStar(require("./v1/public.controller"));
exports.appointmentController = __importStar(require("./v1/appointment.controller"));
exports.doctorController = __importStar(require("./v1/doctor.controller"));
exports.patientController = __importStar(require("./v1/patient.controller"));
exports.articleController = __importStar(require("./v1/article.controller"));
//# sourceMappingURL=index.js.map