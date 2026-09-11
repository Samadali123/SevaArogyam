"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrescriptionPDF = exports.generateTokenPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Generates a Booking Token / Receipt PDF and pipes it to the Express Response
 */
const generateTokenPDF = (appointment, res) => {
    const doc = new pdfkit_1.default({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Token-${appointment.id}.pdf"`);
    doc.pipe(res);
    // Header
    doc.fontSize(20).text('Sevasadan Hospital', { align: 'center' });
    doc.moveDown();
    if (appointment.bookingMode === 'PHYSICAL') {
        doc.fontSize(16).text('OPD Token Pass', { align: 'center' });
        doc.moveDown();
        doc.fontSize(30).text(`Token: ${appointment.tokenNumber}`, { align: 'center' });
    }
    else {
        doc.fontSize(16).text('Virtual Consultation Pass', { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).text(`Booking ID: ${appointment.id.substring(0, 8)}`, { align: 'center' });
    }
    doc.moveDown(2);
    // Patient Details
    doc.fontSize(12).text(`Patient Name: ${appointment.patient.name}`);
    doc.text(`Age: ${appointment.patient.age || 'N/A'}`);
    doc.text(`Phone: ${appointment.patient.phone || 'N/A'}`);
    doc.moveDown();
    // Doctor Details
    doc.text(`Consulting Doctor: Dr. ${appointment.doctor.name}`);
    if (appointment.branch) {
        doc.text(`Branch: ${appointment.branch.name}`);
    }
    doc.text(`Date: ${appointment.appointmentDate.toDateString()}`);
    doc.text(`Time Slot: ${appointment.timeSlot}`);
    doc.text(`Status: ${appointment.status}`);
    doc.text(`Payment Status: ${appointment.paymentStatus}`);
    doc.end();
};
exports.generateTokenPDF = generateTokenPDF;
/**
 * Generates a Prescription PDF and pipes it to the Express Response
 */
const generatePrescriptionPDF = (appointment, res) => {
    const doc = new pdfkit_1.default({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Prescription-${appointment.id}.pdf"`);
    doc.pipe(res);
    // Header
    doc.fontSize(20).text('Sevasadan Hospital - Digital Prescription', { align: 'center' });
    doc.moveDown(2);
    // Patient Details
    doc.fontSize(12).text(`Patient Name: ${appointment.patient.name}`);
    doc.text(`Age: ${appointment.patient.age || 'N/A'}`);
    doc.moveDown();
    // Doctor Details
    doc.text(`Doctor: Dr. ${appointment.doctor.name}`);
    doc.text(`Specialization: ${appointment.doctor.specialization || 'N/A'}`);
    doc.text(`Date: ${appointment.appointmentDate.toDateString()}`);
    doc.moveDown(2);
    const rx = appointment.prescription;
    if (rx) {
        if (rx.diagnosis) {
            doc.fontSize(14).text('Clinical Diagnosis:', { underline: true });
            doc.fontSize(12).text(rx.diagnosis);
            doc.moveDown();
        }
        if (rx.medicines && Array.isArray(rx.medicines) && rx.medicines.length > 0) {
            doc.fontSize(14).text('Prescribed Medicines (Rx):', { underline: true });
            doc.moveDown(0.5);
            rx.medicines.forEach((med, index) => {
                doc.fontSize(12).text(`${index + 1}. ${med.name} - ${med.dosage}`);
                doc.fontSize(10).text(`   Frequency: ${med.frequency} | Duration: ${med.duration} | Timing: ${med.timing}`);
                doc.moveDown(0.5);
            });
            doc.moveDown();
        }
        if (rx.investigations) {
            doc.fontSize(14).text('Investigations Ordered:', { underline: true });
            doc.fontSize(12).text(rx.investigations);
            doc.moveDown();
        }
        if (rx.examinationNotes) {
            doc.fontSize(14).text('Clinical Examination Notes:', { underline: true });
            doc.fontSize(12).text(rx.examinationNotes);
            doc.moveDown();
        }
        if (rx.advice) {
            doc.fontSize(14).text('Advice & Lifestyle:', { underline: true });
            doc.fontSize(12).text(rx.advice);
            doc.moveDown();
        }
    }
    else {
        doc.fontSize(12).text('No prescription details have been recorded yet.');
    }
    doc.moveDown(4);
    doc.font('Helvetica-Oblique').fontSize(10).text('This is a digitally generated prescription.', { align: 'center' });
    doc.end();
};
exports.generatePrescriptionPDF = generatePrescriptionPDF;
//# sourceMappingURL=pdf.js.map