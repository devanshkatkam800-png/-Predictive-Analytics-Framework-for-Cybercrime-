import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  Lock,
  Compass,
  ArrowRight,
  UserCheck,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
  FilePlus,
  TrendingUp,
  Sparkles,
  Printer,
  BadgeCheck
} from 'lucide-react';
import { VictimComplaint, ComplaintTimelineStage } from '../../types';
import { VictimReceiptModal } from './VictimReceiptModal';

interface VictimComplaintTrackerProps {
  complaints: VictimComplaint[];
  selectedComplaintId?: string;
  onSelectComplaint: (id: string) => void;
  onOpenEvidence: (complaintId: string) => void;
  onOpenRecovery: (complaintId: string) => void;
  onOpenAiAssistant: (complaintId: string) => void;
  onFileNewComplaint: () => void;
}

export const VictimComplaintTracker: React.FC<VictimComplaintTrackerProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onOpenEvidence,
  onOpenRecovery,
  onOpenAiAssistant,
  onFileNewComplaint
}) => {
  const [receiptComplaint, setReceiptComplaint] = useState<VictimComplaint | null>(null);

  const activeComplaint =
    complaints.find((c) => c.complaintId === selectedComplaintId) ||
    (complaints.length > 0 ? complaints[0] : null);

  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  if (!activeComplaint) {
    return (
      <div className="glass-card p-10 rounded-2xl text-center space-y-4 shadow-md shadow-slate-200/40 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-900">
          No Cybercrime Complaints to Track
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You have not filed any cybercrime complaints yet. Once submitted, you can track the real-time investigation and fund recovery milestones here.
        </p>
        <button
          onClick={onFileNewComplaint}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>File Cybercrime Complaint Now</span>
        </button>
      </div>
    );
  }

  const currentStageIndex = activeComplaint.timeline.findIndex((s) => s.status === 'current');
  const currentStage = activeComplaint.timeline[currentStageIndex] || activeComplaint.timeline[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Case Selector Strip */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-lg shadow-slate-200/40 border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#1e3a8a] font-bold text-[11px] uppercase tracking-wider">
                NCRP National Tracking System
              </span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-xs text-slate-500">
                1930 Real-Time Inter-Bank Synchronization
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Complaint Milestone Tracker
            </h1>
          </div>

          {/* Right side: Switcher & Receipt Download */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setReceiptComplaint(activeComplaint)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Official Receipt</span>
            </button>

            {complaints.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Case:
                </label>
                <select
                  value={activeComplaint.complaintId}
                  onChange={(e) => onSelectComplaint(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white/90 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {complaints.map((c) => (
                    <option key={c.complaintId} value={c.complaintId}>
                      {c.complaintId} - {c.fraudType} ({formatINR(c.amountLost)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Selected Complaint Overview Bar */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Complaint Number</span>
            <span className="font-mono font-black text-[#1e3a8a] text-sm mt-0.5 block">
              {activeComplaint.complaintId}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Fraud Category</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {activeComplaint.fraudType}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Amount Siphoned</span>
            <span className="font-black text-rose-600 mt-0.5 block">
              {formatINR(activeComplaint.amountLost)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Investigating Officer</span>
            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              {activeComplaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
            </span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/70">
          <button
            onClick={() => onOpenEvidence(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Upload Supporting Evidence</span>
          </button>

          <button
            onClick={() => onOpenRecovery(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
            <span>View Bank Lien Status</span>
          </button>

          <button
            onClick={() => onOpenAiAssistant(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Ask AI About This Stage</span>
          </button>
        </div>
      </div>

      {/* 2. Current Stage Highlight Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 tracking-wider uppercase">
              ACTIVE STAGE {currentStage.stage} OF 7
            </span>
            <span className="text-sm font-black text-slate-900">
              {currentStage.title}
            </span>
          </div>
          <p className="text-xs text-slate-700 max-w-2xl">
            {currentStage.description}
          </p>
          {currentStage.assignedOfficer && (
            <div className="text-[11px] text-slate-500 font-medium">
              Handled by: <span className="font-semibold text-slate-700">{currentStage.assignedOfficer}</span> &bull; Updated: {currentStage.date} {currentStage.time}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <button
            onClick={() => onOpenAiAssistant(activeComplaint.complaintId)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Next Steps Guidance</span>
          </button>
        </div>
      </div>

      {/* 3. Timeline Visualization */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-md shadow-slate-200/40 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1e3a8a]" />
            <span>Official Resolution & Law Enforcement Workflow</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Stage {Math.max(1, currentStageIndex + 1)} of {activeComplaint.timeline.length || 7} processed
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-7 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {activeComplaint.timeline.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isPending = stage.status === 'pending';

            return (
              <div key={stage.stage} className="relative group">
                {/* Node Icon on vertical timeline track */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#10b981] text-white shadow-md shadow-emerald-600/30'
                      : isCurrent
                      ? 'bg-[#f59e0b] text-white ring-4 ring-amber-100 animate-pulse shadow-md'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  ) : (
                    <span className="text-[10px] font-bold">{stage.stage}</span>
                  )}
                </div>

                {/* Stage Card */}
                <div
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : isCompleted
                      ? 'bg-white/80 border-slate-200 shadow-xs'
                      : 'bg-slate-50/50 border-dashed border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 text-[#10b981]'
                            : isCurrent
                            ? 'bg-amber-100 text-[#f59e0b] font-extrabold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        STAGE {stage.stage}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {stage.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {isCompleted && (
                        <span className="text-[#10b981] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[#f59e0b] font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="text-slate-400">
                          Pending Verification
                        </span>
                      )}

                      <span className="text-slate-300">&bull;</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {stage.date !== 'Pending' ? `${stage.date} ${stage.time}` : 'Awaiting previous step'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Stage-Specific Context Information */}
                  {stage.stage === 3 && activeComplaint.predictionId && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#2563eb]" />
                        <span className="text-[#1e3a8a] font-medium">
                          Predictive Model ID: <span className="font-mono font-bold">{activeComplaint.predictionId}</span> (ATM clusters mapped)
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#1e3a8a] font-bold">
                        AI Model Active
                      </span>
                    </div>
                  )}

                  {stage.stage === 4 && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-900 font-medium">
                          Bank Lien Action: <span className="font-bold">₹{activeComplaint.amountFrozen.toLocaleString('en-IN')}</span> locked under Section 91 CrPC notice
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenRecovery(activeComplaint.complaintId)}
                        className="text-[10px] font-bold text-indigo-700 underline cursor-pointer"
                      >
                        View Lien Details
                      </button>
                    </div>
                  )}

                  {stage.assignedOfficer && (
                    <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Action Officer / System: <strong className="text-slate-800">{stage.assignedOfficer}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {receiptComplaint && (
        <VictimReceiptModal
          complaint={receiptComplaint}
          onClose={() => setReceiptComplaint(null)}
        />
      )}
    </div>
  );
};
