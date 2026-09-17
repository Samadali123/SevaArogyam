import React from 'react';
import { X, Download, Stethoscope, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import type { Prescription, Appointment } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  appointment?: Appointment | null;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription,
  appointment
}) => {
  if (!isOpen || (!prescription && !appointment)) return null;

  const doctorName = (prescription?.doctorName || appointment?.doctorName || 'Doctor').replace(/^dr\.?\s*/i, '');
  const displayName = `Dr. ${doctorName}`;
  const patientName = prescription?.patientName || appointment?.patientName || 'Patient';
  const patientAge = prescription?.patientAge || appointment?.patientAge;
  const patientGender = prescription?.patientGender || appointment?.patientGender;
  const clinicName = prescription?.clinicName || appointment?.clinicName || 'Jansevaarogyam Clinic';
  const dateStr = prescription?.createdAt ? new Date(prescription.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (appointment?.appointmentDate || new Date().toISOString().split('T')[0]);

  const medicines = prescription?.items || (prescription as any)?.medicines || [];
  const tests = prescription?.investigationsOrdered || (prescription as any)?.recommendedTests || [];
  const followUp = prescription?.nextFollowUpDate || (prescription as any)?.followUpDate || '';

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 76, 129);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Jansevaarogyam Clinic', 14, 15);

    doc.setFontSize(10);
    doc.text(`Prescribed by ${displayName}`, 130, 15);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${patientName} (${patientAge ? `${patientAge} Yrs` : ''}${patientGender ? `, ${patientGender}` : ''})`, 14, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr} | Center: ${clinicName}`, 14, 40);

    let currentY = 48;

    if (prescription?.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis / Clinical Summary:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.diagnosis, 14, currentY + 6);
      currentY += 14;
    }

    if (medicines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Prescribed Medicines (Rx):', 14, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Medicine Name', 'Dosage', 'Frequency', 'Duration']],
        body: medicines.map((m: any, idx: number) => [
          idx + 1,
          m.medicineName || m.name || '',
          m.dosage || m.dose || 'As advised',
          m.frequency || '1-0-1',
          m.durationDays ? `${m.durationDays} Days` : (m.duration || '5 Days')
        ]),
        headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (tests.length > 0 || (prescription as any)?.recommendedTests) {
      const testsText = Array.isArray(tests) ? tests.join(', ') : String(tests);
      if (testsText.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Diagnostic Tests:', 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(testsText, 14, currentY + 6);
        currentY += 14;
      }
    }

    if (followUp) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Follow-up Date: ${followUp}`, 14, currentY);
      currentY += 10;
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Jansevaarogyam Verified Digital Prescription Pass', 14, 280);

    doc.save(`Jansevaarogyam_Prescription_${patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A365C] text-white p-6 shrink-0 flex items-center justify-between">
          <div>
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              VERIFIED DIGITAL PRESCRIPTION
            </span>
            <h3 className="text-xl font-sora font-extrabold tracking-tight mt-1">
              Prescription by {displayName}
            </h3>
            <p className="text-xs text-sky-200 mt-0.5">
              Prescribed by {displayName} • {clinicName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto grow">
          
          {/* Header Card Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PATIENT DETAILS</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{patientName}</p>
              <p className="text-slate-500 font-medium">
                {patientAge ? `${patientAge} Yrs` : 'Age N/A'} {patientGender ? `• ${patientGender}` : ''}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PRESCRIBED BY</span>
              <p className="font-extrabold text-[#0F4C81] text-sm mt-0.5">{displayName}</p>
              <p className="text-slate-500 font-medium">Date: {dateStr}</p>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          {prescription?.diagnosis && (
            <div className="space-y-1 bg-teal-50/60 p-4 rounded-2xl border border-teal-100">
              <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clinical Diagnosis
              </span>
              <p className="text-xs font-extrabold text-slate-900">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medicines List */}
          {medicines.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-sora font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
                <span>Prescribed Medicines (Rx)</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Medicine</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 font-medium">
                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-900">{m.medicineName || m.name}</td>
                        <td className="p-3 text-slate-600">{m.dosage || m.dose || 'As advised'}</td>
                        <td className="p-3 text-[#0F4C81] font-mono font-bold">{m.frequency || '1-0-1'}</td>
                        <td className="p-3 text-slate-600">{m.durationDays ? `${m.durationDays} Days` : (m.duration || '5 Days')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommended Tests */}
          {(tests.length > 0 || (prescription as any)?.recommendedTests) && (
            <div className="space-y-1.5 bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <span className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-wider block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Recommended Diagnostic Tests
              </span>
              <p className="text-xs font-extrabold text-slate-900">
                {Array.isArray(tests) ? tests.join(', ') : (prescription as any)?.recommendedTests || 'None'}
              </p>
            </div>
          )}

          {/* Follow-up Date */}
          {followUp && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Recommended Follow-up Visit Date:</span>
              </span>
              <span className="font-mono text-sm font-black">{followUp}</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Download Button */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Prescribed by <strong className="text-slate-900">{displayName}</strong>
          </span>
          <button
            onClick={handleDownloadPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Prescription PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
