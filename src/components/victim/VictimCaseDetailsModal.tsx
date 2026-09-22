import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  FileText,
  TrendingUp,
  Compass,
  AlertTriangle,
  Printer,
  Sparkles,
  Phone,
  Mail,
  Coins,
  Download
} from 'lucide-react';
import { VictimComplaint, VictimEvidence } from '../../types';
import { VictimReceiptModal } from './VictimReceiptModal';

interface VictimCaseDetailsModalProps {
  complaint: VictimComplaint | null;
  evidenceList: VictimEvidence[];
  onClose: () => void;
  onTrackTimeline: (complaintId: string) => void;
  onViewRecovery: (complaintId: string) => void;
  onAskAi: (complaintId: string) => void;
}

export const VictimCaseDetailsModal: React.FC<VictimCaseDetailsModalProps> = ({
  complaint,
  evidenceList,
  onClose,
  onTrackTimeline,
  onViewRecovery,
  onAskAi
}) => {
  const [showReceipt, setShowReceipt] = useState(false);

  if (!complaint) return null;

  const caseEvidence = evidenceList.filter((e) => e.complaintId === complaint.complaintId);
  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
        <div className="relative w-full max-w-3xl glass-card rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-6 max-h-[90vh] flex flex-col">
          {/* National Emblem Banner */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white px-5 py-3 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2 font-bold tracking-wider">
              <Shield className="w-4 h-4 text-blue-200" />
              <span className="uppercase text-[11px]">
                MINISTRY OF HOME AFFAIRS &bull; NATIONAL CYBERCRIME DOSSIER
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="View & Download Official Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 bg-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#1e3a8a] text-base">
                  {complaint.complaintId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {complaint.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {complaint.fraudType}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filed on: {new Date(complaint.createdAt).toLocaleString()} &bull; 1930 Reference Active
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Amount Siphoned</div>
              <div className="text-2xl font-black text-rose-600">
                {formatINR(complaint.amountLost)}
              </div>
              <div className="text-[11px] text-indigo-600 font-bold">
                Lien Frozen: {formatINR(complaint.amountFrozen)}
              </div>
            </div>
          </div>

          {/* Scrollable Dossier Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* 1. Incident & Financial Route Grid */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#10b981]" />
                <span>Financial Routing & Incident Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Debited Bank</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {complaint.bankName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Account / Card</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">
                    {complaint.accountNumber || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Suspect VPA (UPI)</span>
                  <span className="font-mono text-rose-600 font-semibold mt-0.5 block truncate">
                    {complaint.upiId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Transaction UTR</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block truncate">
                    {complaint.transactionId}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-400 text-[10px] block uppercase font-bold mb-1">
                  Citizen Narrative Statement:
                </span>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  "{complaint.complaintDescription}"
                </p>
              </div>
            </div>

            {/* 2. Assigned Officer & Law Enforcement Details */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#2563eb]" />
                <span>Assigned Investigating Officer & Unit</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Officer Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {complaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {complaint.assignedOfficer?.designation || 'Cyber Crime Police Station'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Unit & Jurisdiction</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {complaint.assignedOfficer?.department || 'I4C Special Cyber Task Force'}
                  </span>
                  <span className="text-[11px] text-slate-500">MHA Cyber Command</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Officer Contact</span>
                  <div className="mt-1 space-y-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{complaint.assignedOfficer?.contact || '+91-11-2343-8000'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{complaint.assignedOfficer?.email || 'io.cybercell@mha.gov.in'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Investigation Milestones Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#f59e0b]" />
                  <span>Investigation & Recovery Milestones</span>
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    onTrackTimeline(complaint.complaintId);
                  }}
                  className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                >
                  Open Full Interactive Timeline →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {complaint.timeline.map((stage) => {
                  const isDone = stage.status === 'completed';
                  const isCur = stage.status === 'current';
                  return (
                    <div
                      key={stage.stage}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        isCur
                          ? 'bg-amber-50/60 border-amber-300'
                          : isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      ) : isCur ? (
                        <Clock className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 animate-pulse" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-400">
                          {stage.stage}
                        </span>
                      )}

                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          Stage {stage.stage}: {stage.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {stage.date} &bull; {stage.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Attached Evidence Files */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#2563eb]" />
                <span>Attached Digital Evidence ({caseEvidence.length})</span>
              </h3>

              {caseEvidence.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {caseEvidence.map((ev) => (
                    <div
                      key={ev.evidenceId || ev.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">
                          {ev.fileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ev.fileType.toUpperCase()} &bull; {ev.fileSize}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">
                  No supplemental evidence attached yet.
                </p>
              )}
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="p-4 border-t border-slate-200 bg-white/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onViewRecovery(complaint.complaintId);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#10b981] font-bold transition-colors cursor-pointer"
              >
                Check Bank Recovery Lien (₹{complaint.amountFrozen.toLocaleString('en-IN')})
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskAi(complaint.complaintId);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563eb] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Advisor</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Official Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && (
        <VictimReceiptModal
          complaint={complaint}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};
