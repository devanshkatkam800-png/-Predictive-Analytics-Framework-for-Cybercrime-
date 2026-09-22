import React from 'react';
import {
  Printer,
  Download,
  X,
  Shield,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  FileText,
  BadgeCheck,
  QrCode
} from 'lucide-react';
import { VictimComplaint } from '../../types';

interface VictimReceiptModalProps {
  complaint: VictimComplaint;
  onClose: () => void;
}

export const VictimReceiptModal: React.FC<VictimReceiptModalProps> = ({
  complaint,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(complaint.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-black text-slate-800">
              Official NCRP Acknowledgment Receipt
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Document */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 print:p-0 print:text-black">
          {/* Government Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] font-bold mb-2 shadow-xs">
              <Shield className="w-7 h-7 text-[#1e3a8a]" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              GOVERNMENT OF INDIA &bull; MINISTRY OF HOME AFFAIRS
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              Indian Cyber Crime Coordination Centre (I4C)
            </h1>
            <div className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
              National Cyber Crime Reporting Portal (NCRP) &bull; 1930 Citizen Intake
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              FORM NCRP-ACK-V3 &bull; STATUTORY FILING CONFIRMATION
            </div>
          </div>

          {/* Reference Stamp Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Official Acknowledgment Number
              </div>
              <div className="font-mono text-base sm:text-lg font-black text-[#1e3a8a]">
                ACK/{complaint.complaintId}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Date & Time of Registration
              </div>
              <div className="text-xs font-bold text-slate-800">
                {formattedDate} at {formattedTime} IST
              </div>
            </div>
          </div>

          {/* Complainant Details Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              1. Complainant (Citizen) Particulars
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Full Name</span>
                <span className="font-bold text-slate-800">
                  {complaint.victimName || 'Registered Citizen'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Citizen ID</span>
                <span className="font-mono font-semibold text-slate-800">
                  {complaint.victimId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Contact Mobile</span>
                <span className="font-semibold text-slate-800">
                  {complaint.victimMobile || '+91-XXXXX-XXXXX'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Registered City</span>
                <span className="font-semibold text-slate-800">
                  {complaint.victimCity || 'Mumbai'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">State Jurisdiction</span>
                <span className="font-semibold text-slate-800">
                  {complaint.victimState || 'Maharashtra'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Assigned Police Station</span>
                <span className="font-semibold text-slate-800">
                  {complaint.assignedStation || 'Cyber Crime Police Station, BKC'}
                </span>
              </div>
            </div>
          </div>

          {/* Incident & Transaction Financial Particulars */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              2. Disputed Incident & Banking Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Crime Category</span>
                <span className="font-bold text-slate-800">
                  {complaint.fraudType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Amount Defrauded</span>
                <span className="font-black text-rose-600 text-sm">
                  ₹{complaint.amountLost.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Disputed Bank</span>
                <span className="font-semibold text-slate-800">
                  {complaint.bankName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Reference UTR / Txn ID</span>
                <span className="font-mono text-slate-800 truncate block">
                  {complaint.transactionId}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Enforcement Action Taken */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <h5 className="text-xs font-bold text-emerald-900">
                Automated 1930 Bank Freeze & Interdiction Notice
              </h5>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Upon receipt of this complaint, an immediate Section 91 CrPC advisory was auto-dispatched via the 1930 Citizen Financial Cyber Fraud Reporting System to the nodal officer of <strong>{complaint.bankName}</strong>. 
              {complaint.amountFrozen ? (
                <span> A lien freeze of <strong>₹{complaint.amountFrozen.toLocaleString('en-IN')}</strong> has been successfully placed on beneficiary accounts.</span>
              ) : (
                <span> Inter-bank telemetry is actively monitoring suspected beneficiary accounts and ATM withdrawal corridors.</span>
              )}
            </p>
          </div>

          {/* Footer Verification & QR code */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Verified by National Cybercrime Registry</span>
              </div>
              <p className="text-[10px] text-slate-400">
                This document is a computer-generated acknowledgment valid under the Information Technology Act, 2000.
              </p>
            </div>

            <div className="w-14 h-14 rounded-xl border border-slate-300 bg-white p-1 flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
