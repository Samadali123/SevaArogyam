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
  doc.fontSize(20).text('Jansevaarogyam Clinic', { align: 'center' });
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
  const docName = (appointment.doctor?.name || 'Doctor').replace(/^dr\.?\s*/i, '');
  doc.text(`Consulting Doctor: Dr. ${docName}`);
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

  const docName = (appointment.doctor?.name || 'Doctor').replace(/^dr\.?\s*/i, '');

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('Jansevaarogyam Clinic', { align: 'center' });
  doc.fontSize(12).font('Helvetica-Bold').text(`Prescribed by Dr. ${docName}`, { align: 'center' });
  doc.moveDown(1.5);

  // Patient Details
  doc.fontSize(11).font('Helvetica-Bold').text(`Patient Name: ${appointment.patient?.name || 'N/A'}`);
  doc.font('Helvetica').text(`Patient Age: ${appointment.patient?.age || 'N/A'}`);
  doc.text(`Consultation Date: ${appointment.appointmentDate ? new Date(appointment.appointmentDate).toDateString() : new Date().toDateString()}`);
  doc.moveDown(1.5);

  const rx = appointment.prescription as any;

  if (rx) {
    if (rx.diagnosis) {
      doc.fontSize(12).font('Helvetica-Bold').text('Diagnosis / Clinical Summary:');
      doc.fontSize(11).font('Helvetica').text(rx.diagnosis);
      doc.moveDown();
    }

    if (rx.medicines && Array.isArray(rx.medicines) && rx.medicines.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Prescribed Medicines (Rx):');
      doc.moveDown(0.5);
      
      rx.medicines.forEach((med: any, index: number) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${med.name || med.medicineName} — Dose: ${med.dosage || med.dose || 'As advised'}`);
        if (med.frequency || med.duration || med.timing) {
          doc.fontSize(10).font('Helvetica').text(`   Frequency: ${med.frequency || 'N/A'} | Duration: ${med.duration || 'N/A'}`);
        }
        doc.moveDown(0.4);
      });
      doc.moveDown();
    }

    if (rx.recommendedTests || rx.investigations) {
      doc.fontSize(12).font('Helvetica-Bold').text('Recommended Tests:');
      doc.fontSize(11).font('Helvetica').text(rx.recommendedTests || rx.investigations);
      doc.moveDown();
    }

    if (rx.followUpDate) {
      doc.fontSize(12).font('Helvetica-Bold').text('Follow-up Date:');
      doc.fontSize(11).font('Helvetica').text(rx.followUpDate);
      doc.moveDown();
    }

    if (rx.advice) {
      doc.fontSize(12).font('Helvetica-Bold').text('Doctor Advice:');
      doc.fontSize(11).font('Helvetica').text(rx.advice);
      doc.moveDown();
    }
  } else {
    doc.fontSize(11).text('No prescription details recorded.');
  }

  doc.moveDown(2);
  doc.font('Helvetica-Oblique').fontSize(9).text('Jansevaarogyam Verified Digital Prescription', { align: 'center' });

  doc.end();
};
