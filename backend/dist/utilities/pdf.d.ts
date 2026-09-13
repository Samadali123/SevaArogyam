import { Response } from 'express';
import { Appointment, User, Branch } from '@prisma/client';
type PopulatedAppointment = Appointment & {
    patient: User;
    doctor: User;
    branch: Branch | null;
};
/**
 * Generates a Booking Token / Receipt PDF and pipes it to the Express Response
 */
export declare const generateTokenPDF: (appointment: PopulatedAppointment, res: Response) => void;
/**
 * Generates a Prescription PDF and pipes it to the Express Response
 */
export declare const generatePrescriptionPDF: (appointment: PopulatedAppointment, res: Response) => void;
export {};
//# sourceMappingURL=pdf.d.ts.map