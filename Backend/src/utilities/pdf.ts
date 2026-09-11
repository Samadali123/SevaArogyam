import PDFDocument from 'pdfkit';
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
export const generateTokenPDF = (appointment: PopulatedAppointment, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

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
  } else {
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

/**
 * Generates a Prescription PDF and pipes it to the Express Response
 */
export const generatePrescriptionPDF = (appointment: PopulatedAppointment, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

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

  const rx = appointment.prescription as any;

  if (rx) {
    if (rx.diagnosis) {
      doc.fontSize(14).text('Clinical Diagnosis:', { underline: true });
      doc.fontSize(12).text(rx.diagnosis);
      doc.moveDown();
    }

    if (rx.medicines && Array.isArray(rx.medicines) && rx.medicines.length > 0) {
      doc.fontSize(14).text('Prescribed Medicines (Rx):', { underline: true });
      doc.moveDown(0.5);
      
      rx.medicines.forEach((med: any, index: number) => {
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
  } else {
    doc.fontSize(12).text('No prescription details have been recorded yet.');
  }

  doc.moveDown(4);
  doc.font('Helvetica-Oblique').fontSize(10).text('This is a digitally generated prescription.', { align: 'center' });

  doc.end();
};
