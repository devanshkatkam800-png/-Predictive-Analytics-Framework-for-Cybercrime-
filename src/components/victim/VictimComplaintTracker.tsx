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
  Sparkles
} from 'lucide-react';
import { VictimComplaint, ComplaintTimelineStage } from '../../types';

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
  const activeComplaint =
    complaints.find((c) => c.complaintId === selectedComplaintId) ||
    (complaints.length > 0 ? complaints[0] : null);

  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  if (!activeComplaint) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          No Cybercrime Complaints to Track
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You have not filed any cybercrime complaints yet. Once submitted, you can track the real-time 8-stage investigation and fund recovery milestones here.
        </p>
        <button
          onClick={onFileNewComplaint}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-colors cursor-pointer"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px] uppercase tracking-wider">
                NCRP National Tracking System
              </span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                1930 Real-Time Inter-Bank Synchronization
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Complaint Milestone Tracker
            </h1>
          </div>

          {/* If multiple complaints, offer switcher */}
          {complaints.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Select Case:
              </label>
              <select
                value={activeComplaint.complaintId}
                onChange={(e) => onSelectComplaint(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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

        {/* Selected Complaint Overview Bar */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Complaint Number</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
              {activeComplaint.complaintId}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Fraud Category</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {activeComplaint.fraudType}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Amount Reported Lost</span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400">
              {formatINR(activeComplaint.amountLost)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Investigating Officer</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              {activeComplaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
            </span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onOpenEvidence(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Supporting Evidence</span>
          </button>

          <button
            onClick={() => onOpenRecovery(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Bank Lien Status</span>
          </button>

          <button
            onClick={() => onOpenAiAssistant(activeComplaint.complaintId)}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask AI About This Stage</span>
          </button>
        </div>
      </div>

      {/* 2. Current Stage Highlight Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
              ACTIVE STAGE {currentStage.stage} OF 7
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {currentStage.title}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {currentStage.description}
          </p>
          {currentStage.assignedOfficer && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Handled by: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentStage.assignedOfficer}</span> &bull; Updated: {currentStage.date} {currentStage.time}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <button
            onClick={() => onOpenAiAssistant(activeComplaint.complaintId)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Next Steps Guidance</span>
          </button>
        </div>
      </div>

      {/* 3. 8-Stage Timeline Visualization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Official 8-Stage Case Resolution Workflow</span>
          </h2>
          <span className="text-xs text-slate-400">
            Stage {Math.max(1, currentStageIndex + 1)} of {activeComplaint.timeline.length || 8} processed
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200 dark:ring-amber-900/60 animate-pulse shadow-md'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
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
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm'
                      : isCompleted
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : isCurrent
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-extrabold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        STAGE {stage.stage}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {stage.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {isCompleted && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="text-slate-400">
                          Pending Verification
                        </span>
                      )}

                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {stage.date !== 'Pending' ? `${stage.date} ${stage.time}` : 'Awaiting previous step'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Stage-Specific Context Information */}
                  {stage.stage === 3 && activeComplaint.predictionId && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-900 dark:text-blue-200 font-medium">
                          Predictive Model ID: <span className="font-mono font-bold">{activeComplaint.predictionId}</span> (ATM clusters mapped)
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold">
                        AI Model Active
                      </span>
                    </div>
                  )}

                  {stage.stage === 4 && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-900 dark:text-indigo-200 font-medium">
                          Bank Lien Action: <span className="font-bold">₹{activeComplaint.amountFrozen.toLocaleString('en-IN')}</span> locked under Section 91 CrPC notice
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenRecovery(activeComplaint.complaintId)}
                        className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 underline"
                      >
                        View Lien Details
                      </button>
                    </div>
                  )}

                  {stage.assignedOfficer && (
                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Action Officer / System: <strong className="text-slate-800 dark:text-slate-200">{stage.assignedOfficer}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
