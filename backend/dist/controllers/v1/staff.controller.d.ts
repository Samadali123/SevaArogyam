/**
 * Get Staff Dashboard Stats (Waiting, Inside, Completed, Active Doctors)
 */
export declare const getDashboardStats: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Get Live OPD Queue for the branch
 */
export declare const getLiveQueue: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Get all offline (PHYSICAL) appointments for a specific doctor with timings & token numbers
 */
export declare const getDoctorOfflineAppointments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Book an offline/walk-in appointment (generates token, auto-registers patient if new)
 */
export declare const bookWalkInAppointment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Update Appointment Status (e.g., Mark IN_PROGRESS or COMPLETED)
 */
export declare const updateAppointmentStatus: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=staff.controller.d.ts.map