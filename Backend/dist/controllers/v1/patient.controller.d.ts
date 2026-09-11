/**
 * Fetch all appointments for the logged-in patient
 */
export declare const getMyAppointments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Download Booking Token Pass as PDF
 */
export declare const downloadToken: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Download Prescription as PDF
 */
export declare const downloadPrescription: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Generate a LiveKit Token for the Patient to join the Video Room
 */
export declare const joinVideoCall: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Creates an order for a Care Service and initializes Razorpay
 */
export declare const createServiceOrder: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Verify Razorpay payment for the ServiceOrder
 */
export declare const verifyServicePayment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Fetch patient's order history
 */
export declare const getMyOrders: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Reschedule an Appointment (Patient / Doctor / Admin / Staff)
 */
export declare const rescheduleAppointment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Cancel an Appointment (Patient / Doctor / Admin / Staff)
 */
export declare const cancelAppointment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Fetch patient details quickly using their patientId (e.g., PT-10024)
 * (Often used by staff or public interfaces to link details rapidly)
 */
export declare const getPatientById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=patient.controller.d.ts.map