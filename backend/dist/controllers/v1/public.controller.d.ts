/**
 * Fetch all available branches for patients to choose from during booking
 */
export declare const getBranches: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Fetch all available Specialties
 */
export declare const getSpecialties: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Fetch doctors available at a specific branch or globally
 */
export declare const getDoctors: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Fetch all available Care Services (Pharmacy, Diagnostics, Lab)
 */
export declare const getCareServices: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=public.controller.d.ts.map