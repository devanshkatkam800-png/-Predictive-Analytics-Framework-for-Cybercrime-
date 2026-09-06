import React from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  FilePlus,
  Compass,
  Sparkles,
  UserCheck,
  Building2,
  Coins,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { VictimComplaint, VictimDashboardStats, VictimUser } from '../../types';

interface VictimDashboardProps {
  victim: VictimUser;
  stats: VictimDashboardStats | null;
  recentComplaints: VictimComplaint[];
  onFileNewComplaint: () => void;
  onTrackComplaint: (complaintId?: string) => void;
  onOpenEvidence: (complaintId?: string) => void;
  onOpenRecovery: (complaintId?: string) => void;
  onOpenAiAssistant: () => void;
  onSelectComplaintDossier: (complaint: VictimComplaint) => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  victim,
  stats,
  recentComplaints,
  onFileNewComplaint,
  onTrackComplaint,
  onOpenEvidence,
  onOpenRecovery,
  onOpenAiAssistant,
  onSelectComplaintDossier
}) => {
  const latestComplaint = stats?.latestComplaint || (recentComplaints.length > 0 ? recentComplaints[0] : null);

  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Case Closed':
      case 'Resolved':
      case 'Fully Recovered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'Bank Freeze Requested':
      case 'Bank Freeze Sent':
      case 'Recovery In Progress':
      case 'Recovery Processing':
      case 'Partially Recovered':
      case 'Account Under Surveillance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <Lock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'Officer Assigned':
      case 'Investigation Started':
      case 'Under Investigation':
      case 'Prediction Generated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Welcome Card & Emergency Helpline Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Subtle decorative emblem backdrop */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
                Citizen Portal &bull; National Cyber Crime Reporting Portal
              </span>
              <span className="text-slate-300 text-xs font-mono">
                ID: {victim.victimId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {victim.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your registered complaints are monitored 24x7 by the Ministry of Home Affairs (MHA) and Indian Cybercrime Coordination Centre (I4C). Inter-bank freeze requests and cash withdrawal predictions are actively synchronized with law enforcement field teams.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-200 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Emergency Helpline: <span className="font-bold text-white underline">1930 (Toll-Free 24x7)</span>
              </span>
              <span>&bull;</span>
              <span>National Cyber Crime Reporting System</span>
            </div>
          </div>

          {/* Action Quick Launchers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={onFileNewComplaint}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Report Cyber Fraud</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Ask AI Cyber Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Stat 1: Total Complaints */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalComplaints ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Filed via Citizen Portal
          </div>
        </div>

        {/* Stat 2: Active Complaints */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.activeComplaints ?? 0}
          </div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            Under Investigation
          </div>
        </div>

        {/* Stat 3: Closed Complaints */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Closed Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.closedComplaints ?? 0}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Resolved & Restituted
          </div>
        </div>

        {/* Stat 4: Amount Lost */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Stolen</span>
            <Coins className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 truncate">
            {formatINR(stats?.amountLost)}
          </div>
          <div className="text-[10px] text-rose-500/80 mt-1">
            Fraudulent Deductions
          </div>
        </div>

        {/* Stat 5: Amount Frozen in Mule Accounts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lien Frozen</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 truncate">
            {formatINR(stats?.amountFrozen)}
          </div>
          <div className="text-[10px] text-indigo-500/80 mt-1">
            Locked in Bank Accounts
          </div>
        </div>

        {/* Stat 6: Amount Recovered */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Restituted</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 truncate">
            {formatINR(stats?.amountRecovered)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            {stats?.recoveryPercentage || 0}% Restitution Rate
          </div>
        </div>
      </div>

      {/* 2b. RECOVERY STATUS VISUALIZATION (Inter-Bank Lien & Restitution Progress Bar) */}
      {stats && (stats.amountLost > 0 || (stats.amountFrozen ?? 0) > 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Financial Recovery & Inter-Bank Lien Tracking
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    1930 Direct Lien Switch
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time status of funds siphoned vs. secured under bank lien and restituted.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenRecovery(latestComplaint?.complaintId)}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>View Inter-Bank Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tri-Color Stacked Recovery Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Restituted: {formatINR(stats.amountRecovered)} ({stats.recoveryPercentage}%)
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Lien Frozen: {formatINR(stats.amountFrozen)} ({stats.amountLost > 0 ? Math.min(100, Math.round(((stats.amountFrozen || 0) / stats.amountLost) * 100)) : 0}%)
                </span>
              </div>
              <span className="text-slate-400">
                Total Siphoned: <strong className="text-slate-700 dark:text-slate-200">{formatINR(stats.amountLost)}</strong>
              </span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200 dark:border-slate-700">
              {/* Restituted segment */}
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full transition-all duration-500"
                style={{
                  width: `${stats.amountLost > 0 ? Math.min(100, (stats.amountRecovered / stats.amountLost) * 100) : 0}%`
                }}
                title={`Restituted: ${formatINR(stats.amountRecovered)}`}
              />
              {/* Lien Frozen segment */}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${stats.amountLost > 0 ? Math.min(100 - (stats.amountRecovered / stats.amountLost) * 100, ((stats.amountFrozen || 0) / stats.amountLost) * 100) : 0}%`
                }}
                title={`Lien Frozen: ${formatINR(stats.amountFrozen)}`}
              />
              {/* Remaining / In-Flight segment */}
              <div
                className="h-full bg-slate-200 dark:bg-slate-700 rounded-r-full transition-all duration-500"
                style={{
                  width: `${Math.max(0, 100 - (stats.amountLost > 0 ? ((stats.amountRecovered + (stats.amountFrozen || 0)) / stats.amountLost) * 100 : 0))}%`
                }}
                title="Under Active Investigation"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Section 91 CrPC Bank Liens Issued</span>
              </span>
              <span>
                {stats.amountLost > 0 && (stats.amountRecovered + (stats.amountFrozen || 0) >= stats.amountLost) ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% of siphoned capital secured or restituted</span>
                ) : (
                  <span>Law enforcement interdiction active</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Latest Complaint Status Card (Highlighted Interactive Card) */}
      {latestComplaint ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Latest Active Case
                </span>
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {latestComplaint.complaintId}
                </span>
                {getStatusBadge(latestComplaint.status)}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {latestComplaint.fraudType} &bull; {formatINR(latestComplaint.amountLost)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTrackComplaint(latestComplaint.complaintId)}
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Track 7-Stage Timeline</span>
              </button>
              <button
                onClick={() => onSelectComplaintDossier(latestComplaint)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Case Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {latestComplaint.bankName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Transaction UTR</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {latestComplaint.transactionId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Officer</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {latestComplaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Amount Frozen</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {formatINR(latestComplaint.amountFrozen)} (Lien Placed)
              </span>
            </div>
          </div>

          {/* 7-Stage Quick Progress Preview */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Investigation & Restitution Milestones
              </span>
              <span className="text-slate-500 font-medium">
                Stage {latestComplaint.timeline.findIndex((t) => t.status === 'current') + 1} of 7: {latestComplaint.timeline.find((t) => t.status === 'current')?.title || 'In Progress'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {latestComplaint.timeline.map((stage) => {
                const isCompleted = stage.status === 'completed';
                const isCurrent = stage.status === 'current';
                return (
                  <div key={stage.stage} className="text-center group">
                    <div
                      className={`h-2 rounded-full mb-1.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-amber-500 animate-pulse ring-2 ring-amber-300 dark:ring-amber-700'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <div
                      className={`text-[10px] font-semibold truncate ${
                        isCompleted
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isCurrent
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      S{stage.stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FilePlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No Cybercrime Complaints Registered
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            If you have suffered an unauthorized financial transaction or cyber fraud, lodge your complaint immediately to initiate the 1930 automated bank freeze protocol.
          </p>
          <button
            onClick={onFileNewComplaint}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>File New Cybercrime Complaint</span>
          </button>
        </div>
      )}

      {/* 4. Recent Complaints Table */}
      {recentComplaints.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Filed Cybercrime Complaints ({recentComplaints.length})
              </h3>
              <p className="text-xs text-slate-500">
                Track status updates, evidence submissions, and bank lien freezes.
              </p>
            </div>
            <button
              onClick={() => onTrackComplaint()}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Fraud Type</th>
                  <th className="py-2.5 px-3">Amount Lost</th>
                  <th className="py-2.5 px-3">Bank & UTR</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Officer</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentComplaints.map((c) => (
                  <tr
                    key={c.complaintId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {c.fraudType}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400">
                      {formatINR(c.amountLost)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div>{c.bankName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.transactionId}</div>
                    </td>
                    <td className="py-3 px-3">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {c.assignedOfficer?.name || 'Insp. Vikram Rathore'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onTrackComplaint(c.complaintId)}
                          className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-[11px] transition-colors"
                        >
                          Track
                        </button>
                        <button
                          onClick={() => onSelectComplaintDossier(c)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
