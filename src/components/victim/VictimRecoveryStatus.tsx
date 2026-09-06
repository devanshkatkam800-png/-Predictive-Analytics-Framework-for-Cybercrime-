import React, { useState } from 'react';
import {
  TrendingUp,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck2,
  Scale,
  Shield,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VictimComplaint, RecoveryStatus } from '../../types';

interface VictimRecoveryStatusProps {
  complaints: VictimComplaint[];
  selectedComplaintId?: string;
  onSelectComplaint: (id: string) => void;
  onAskAi: (complaintId: string) => void;
}

export const VictimRecoveryStatus: React.FC<VictimRecoveryStatusProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onAskAi
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center space-y-3">
        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          No Recovery Records Available
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          File a cyber fraud complaint to initiate automated 1930 bank lien notices and track recovery restitution.
        </p>
      </div>
    );
  }

  const recovery: RecoveryStatus = activeComplaint.recoveryStatus || {
    recoveryId: 'REC-' + activeComplaint.complaintId,
    complaintId: activeComplaint.complaintId,
    victimId: activeComplaint.victimId,
    amountLost: activeComplaint.amountLost,
    amountFrozen: activeComplaint.amountFrozen || 0,
    amountRecovered: activeComplaint.amountRecovered || 0,
    recoveryPercentage: Math.round(
      (((activeComplaint.amountRecovered || 0) + (activeComplaint.amountFrozen || 0)) /
        (activeComplaint.amountLost || 1)) *
        100
    ),
    bankLienRef: `LIEN-2025-${activeComplaint.bankName.slice(0, 4).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,
    bankLienReference: `LIEN-2025-${activeComplaint.bankName.slice(0, 4).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,
    status: (activeComplaint.amountRecovered || 0) > 0 ? 'Partial' : 'Pending',
    timelineLogs: [],
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  const percentRecovered = Math.min(
    100,
    Math.round((recovery.amountRecovered / (recovery.amountLost || 1)) * 100)
  );
  const percentFrozen = Math.min(
    100 - percentRecovered,
    Math.round((recovery.amountFrozen / (recovery.amountLost || 1)) * 100)
  );
  const percentUnrecovered = Math.max(0, 100 - (percentRecovered + percentFrozen));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                1930 Financial Fraud Restitution Switch
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                Section 91 CrPC Lien Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Fund Recovery & Bank Lien Status
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking of frozen mule balances and judicial restitution back into your bank account.
            </p>
          </div>
        </div>

        {/* Case Switcher */}
        {complaints.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Select Case:
            </label>
            <select
              value={activeComplaint.complaintId}
              onChange={(e) => onSelectComplaint(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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

      {/* 2. Recovery Progress & Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">
              Complaint Reference
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-black text-lg text-blue-700 dark:text-blue-400">
                {activeComplaint.complaintId}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeComplaint.fraudType}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Official Bank Lien Reference
            </span>
            <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
              {recovery.bankLienRef}
            </span>
          </div>
        </div>

        {/* Triple Color Segmented Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Overall Protection & Recovery Rate:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                {percentRecovered + percentFrozen}%
              </span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Last updated: {new Date(recovery.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          {/* Progress Multi-Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {percentRecovered > 0 && (
              <div
                style={{ width: `${percentRecovered}%` }}
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                title={`Restituted: ${percentRecovered}%`}
              >
                {percentRecovered > 15 ? `${percentRecovered}% Restituted` : ''}
              </div>
            )}
            {percentFrozen > 0 && (
              <div
                style={{ width: `${percentFrozen}%` }}
                className="bg-indigo-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                title={`Frozen in Lien: ${percentFrozen}%`}
              >
                {percentFrozen > 15 ? `${percentFrozen}% Lien Frozen` : ''}
              </div>
            )}
            {percentUnrecovered > 0 && (
              <div
                style={{ width: `${percentUnrecovered}%` }}
                className="bg-slate-300 dark:bg-slate-700 h-full"
                title={`Unrecovered: ${percentUnrecovered}%`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Restituted to Account ({percentRecovered}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Frozen in Inter-Bank Lien ({percentFrozen}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Under ATM Interception ({percentUnrecovered}%)</span>
            </div>
          </div>
        </div>

        {/* Stat Cards 3-Column */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
            <span className="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-400 block">
              1. Total Stolen Amount
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatINR(recovery.amountLost)}
            </div>
            <p className="text-[11px] text-rose-600/80 mt-1">
              Unauthorized debit reported via {activeComplaint.bankName}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
            <span className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400 block">
              2. Amount Frozen in Mule Accounts
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatINR(recovery.amountFrozen)}
            </div>
            <p className="text-[11px] text-indigo-600/80 mt-1">
              Held under Section 91 CrPC notice with beneficiary bank
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
            <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
              3. Restituted to Your Bank
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatINR(recovery.amountRecovered)}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">
              Credited back via judicial order & inter-bank settlement
            </p>
          </div>
        </div>
      </div>

      {/* 3. Chronological Recovery Audit Trail */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Chronological Fund Recovery & Judicial Audit Trail</span>
        </h2>

        <div className="space-y-4 text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  1930 CFCFRMS Emergency Freeze Broadcast
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Executed</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Immediately upon complaint registration, an API alert was dispatched to the beneficiary bank nodal switch to restrict debit privileges on suspect account {activeComplaint.upiId || 'beneficiary'}.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Section 91 CrPC Bank Lien Notice Issued
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lien Placed ({recovery.bankLienRef})</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Investigating officer issued statutory lien requisition. The amount of <strong className="text-indigo-600 dark:text-indigo-400">{formatINR(recovery.amountFrozen)}</strong> has been segregated and locked against withdrawal in the recipient branch.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div className="flex-1 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Judicial Restitution under Section 457 CrPC
                </span>
                <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Court Verification Active</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Police verification certificate prepared for submission before the jurisdictional Chief Judicial Magistrate (CJM). Once the magistrate signs the release decree, banks are mandated by RBI guidelines to release funds back to your original debited account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Legal Guidance Card */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>How to claim your frozen funds under RBI 2017 circular?</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl">
            You do not need to hire private lawyers. The Cyber Crime Police Cell will furnish the Section 457 CrPC indemnity report to the bank on your behalf.
          </p>
        </div>

        <button
          onClick={() => onAskAi(activeComplaint.complaintId)}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI: Step-by-Step Restitution</span>
        </button>
      </div>
    </div>
  );
};
