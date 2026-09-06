import React from 'react';
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
  Coins
} from 'lucide-react';
import { VictimComplaint, VictimEvidence } from '../../types';

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
  if (!complaint) return null;

  const caseEvidence = evidenceList.filter((e) => e.complaintId === complaint.complaintId);
  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* National Emblem Banner */}
        <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="uppercase tracking-wider text-[11px]">
              NATIONAL CYBERCRIME REPORTING PORTAL &bull; OFFICIAL CASE DOSSIER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-blue-700 dark:text-blue-400 text-base">
                {complaint.complaintId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {complaint.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {complaint.fraudType}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filed on: {new Date(complaint.createdAt).toLocaleString()} &bull; 1930 Reference Active
            </p>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Amount Reported Lost</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatINR(complaint.amountLost)}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
              Lien Frozen: {formatINR(complaint.amountFrozen)}
            </div>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Incident & Financial Route Grid */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Financial Routing & Incident Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Debited Bank</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {complaint.bankName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Account / Card</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {complaint.accountNumber || 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Suspect VPA (UPI)</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold mt-0.5 block truncate">
                  {complaint.upiId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Transaction UTR</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {complaint.transactionId}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold mb-1">
                Citizen Narrative Statement:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                "{complaint.complaintDescription}"
              </p>
            </div>
          </div>

          {/* 2. Assigned Officer & Law Enforcement Details */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Assigned Investigating Officer & Unit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Officer Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                  {complaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {complaint.assignedOfficer?.designation || 'Cyber Crime Police Station'}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Unit & Jurisdiction</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {complaint.assignedOfficer?.department || 'I4C Special Cyber Task Force'}
                </span>
                <span className="text-[11px] text-slate-500">MHA Cyber Command</span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Officer Contact</span>
                <div className="mt-1 space-y-1">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{complaint.assignedOfficer?.contact || '+91-11-2343-8000'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{complaint.assignedOfficer?.email || 'io.cybercell@mha.gov.in'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 7-Stage Investigation Milestones Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Investigation & Recovery Milestones</span>
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onTrackTimeline(complaint.complaintId);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
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
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                        : isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : isCur ? (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-400">
                        {stage.stage}
                      </span>
                    )}

                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
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
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Attached Digital Evidence ({caseEvidence.length})</span>
            </h3>

            {caseEvidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {caseEvidence.map((ev) => (
                  <div
                    key={ev.evidenceId || ev.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {ev.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ev.fileType.toUpperCase()} &bull; {ev.fileSize}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewRecovery(complaint.complaintId);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold transition-colors cursor-pointer"
            >
              Check Bank Recovery Lien (₹{complaint.amountFrozen.toLocaleString('en-IN')})
            </button>

            <button
              onClick={() => {
                onClose();
                onAskAi(complaint.complaintId);
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-800 dark:text-blue-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Advisor</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
