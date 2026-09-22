import React, { useState } from 'react';
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
  BadgeAlert,
  Printer,
  Download,
  BadgeCheck
} from 'lucide-react';
import { VictimComplaint, VictimDashboardStats, VictimUser } from '../../types';
import { VictimReceiptModal } from './VictimReceiptModal';

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
  const [receiptComplaint, setReceiptComplaint] = useState<VictimComplaint | null>(null);
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#10b981] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#f59e0b] border border-amber-200">
            <Lock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'Officer Assigned':
      case 'Investigation Started':
      case 'Under Investigation':
      case 'Prediction Generated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  // 6 standard citizen milestone stages
  const getCitizenMilestones = (complaint: VictimComplaint) => {
    const isFrozen = (complaint.amountFrozen || 0) > 0 || complaint.status.includes('Freeze');
    const isInvestigating = ['Under Investigation', 'Investigation Started', 'Officer Assigned'].includes(complaint.status);
    const isResolved = ['Resolved', 'Case Closed', 'Fully Recovered'].includes(complaint.status);

    return [
      { id: 1, name: 'Complaint Filed', status: 'completed' },
      { id: 2, name: 'Police Assigned', status: complaint.assignedOfficer ? 'completed' : 'current' },
      { id: 3, name: 'Bank Alerted', status: 'completed' },
      { id: 4, name: 'Money Frozen / Lien Marked', status: isFrozen ? 'completed' : 'current' },
      { id: 5, name: 'Investigation in Progress', status: isResolved ? 'completed' : isInvestigating || isFrozen ? 'current' : 'pending' },
      { id: 6, name: 'Case Resolved', status: isResolved ? 'completed' : 'pending' }
    ];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Card & Emergency Helpline Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden border border-slate-200/80">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#10b981] text-[11px] font-black tracking-wider uppercase">
                GOVERNMENT OF INDIA &bull; CITIZEN PORTAL
              </span>
              <span className="text-slate-500 text-xs font-mono font-bold">
                Citizen ID: {victim.victimId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Namaste, {victim.name}
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Your registered cyber complaints are actively secured under 24x7 surveillance by the Ministry of Home Affairs (MHA) and Indian Cybercrime Coordination Centre (I4C).
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Emergency Helpline: <span className="text-[#1e3a8a] underline">1930 (Toll-Free 24x7)</span>
              </span>
              <span>&bull;</span>
              <span>Direct Bank Lien Fast-Track Active</span>
            </div>
          </div>

          {/* Action Quick Launchers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onFileNewComplaint}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/20 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Report Cyber Fraud</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-5 py-3 rounded-xl glass-card hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#2563eb]" />
              <span>Ask AI Cyber Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1: Total Complaints */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalComplaints ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Registered dockets
          </div>
        </div>

        {/* Stat 2: Active Complaints */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Active Cases</span>
            <Clock className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f59e0b]">
            {stats?.activeComplaints ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Under Investigation
          </div>
        </div>

        {/* Stat 3: Closed Complaints */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Closed Cases</span>
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-black text-[#10b981]">
            {stats?.closedComplaints ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Resolved & Restituted
          </div>
        </div>

        {/* Stat 4: Amount Lost */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Stolen</span>
            <Coins className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="text-xl font-black text-[#ef4444] truncate">
            {formatINR(stats?.amountLost)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Reported Loss
          </div>
        </div>

        {/* Stat 5: Amount Frozen */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Lien Frozen</span>
            <Lock className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div className="text-xl font-black text-[#2563eb] truncate">
            {formatINR(stats?.amountFrozen)}
          </div>
          <div className="text-[10px] text-[#2563eb] font-semibold mt-1">
            Locked under Lien
          </div>
        </div>

        {/* Stat 6: Amount Recovered */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-md shadow-slate-200/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Restituted</span>
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-xl font-black text-[#10b981] truncate">
            {formatINR(stats?.amountRecovered)}
          </div>
          <div className="text-[10px] text-[#10b981] font-bold mt-1">
            {stats?.recoveryPercentage || 0}% Restitution
          </div>
        </div>
      </div>

      {/* 3. Latest Complaint Status Card with Clear 6-Stage Progress Bar & Download Receipt */}
      {latestComplaint ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-6 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Active Case Status
                </span>
                <span className="font-mono font-black text-sm text-[#1e3a8a]">
                  {latestComplaint.complaintId}
                </span>
                {getStatusBadge(latestComplaint.status)}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1.5">
                {latestComplaint.fraudType} &bull; <span className="text-rose-600">{formatINR(latestComplaint.amountLost)}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Receipt Download Button */}
              <button
                onClick={() => setReceiptComplaint(latestComplaint)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Official Receipt</span>
              </button>

              <button
                onClick={() => onTrackComplaint(latestComplaint.complaintId)}
                className="px-4 py-2.5 rounded-xl glass-card hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#2563eb]" />
                <span>Case Tracker</span>
              </button>

              <button
                onClick={() => onSelectComplaintDossier(latestComplaint)}
                className="px-4 py-2.5 rounded-xl glass-card hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Full Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Case Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Banking Node</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {latestComplaint.bankName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction UTR</span>
              <span className="font-mono font-bold text-slate-800 mt-1 block truncate">
                {latestComplaint.transactionId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Officer</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {latestComplaint.assignedOfficer?.name || 'Insp. Vikram Rathore'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lien Frozen</span>
              <span className="font-black text-[#10b981] mt-1 block">
                {formatINR(latestComplaint.amountFrozen)} Secured
              </span>
            </div>
          </div>

          {/* 6-STAGE FRAUD TIMELINE (Prompt Requirement 6) */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-[#1e3a8a]" />
                <span>Statutory Investigation & Restitution Timeline</span>
              </span>
              <span className="text-slate-500 font-semibold text-[11px]">
                Active Investigation Pipeline
              </span>
            </div>

            {/* Visual 6-Stage Progress Bar & Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {getCitizenMilestones(latestComplaint).map((milestone) => {
                const isCompleted = milestone.status === 'completed';
                const isCurrent = milestone.status === 'current';

                return (
                  <div
                    key={milestone.id}
                    className={`p-3.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isCurrent
                        ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center animate-pulse ring-4 ring-blue-100">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center">
                          {milestone.id}
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-xs font-bold leading-tight ${
                        isCompleted
                          ? 'text-[#10b981]'
                          : isCurrent
                          ? 'text-[#1e3a8a]'
                          : 'text-slate-400'
                      }`}
                    >
                      {milestone.name}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                      {isCompleted ? 'Completed' : isCurrent ? 'Active Now' : 'Pending'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-2xl p-10 text-center space-y-4 shadow-md shadow-slate-200/40">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center mx-auto shadow-xs">
            <FilePlus className="w-7 h-7 text-[#1e3a8a]" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            No Cybercrime Complaints Registered
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            If you have suffered an unauthorized financial transaction or online fraud, lodge your complaint immediately to trigger the automated 1930 inter-bank freeze.
          </p>
          <button
            onClick={onFileNewComplaint}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Lodge Cybercrime Complaint</span>
          </button>
        </div>
      )}

      {/* 4. Recent Complaints Table */}
      {recentComplaints.length > 0 && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-md shadow-slate-200/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-900">
                Registered Complaints ({recentComplaints.length})
              </h3>
              <p className="text-xs text-slate-500">
                Track status updates, evidence submissions, and bank lien freezes.
              </p>
            </div>
            <button
              onClick={() => onTrackComplaint()}
              className="text-xs font-bold text-[#1e3a8a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Complaint ID</th>
                  <th className="py-3 px-3">Fraud Type</th>
                  <th className="py-3 px-3">Amount Lost</th>
                  <th className="py-3 px-3">Bank & UTR</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Officer</th>
                  <th className="py-3 px-3 text-right">Receipt / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((c) => (
                  <tr
                    key={c.complaintId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#1e3a8a]">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {c.fraudType}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600">
                      {formatINR(c.amountLost)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{c.bankName}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                        {c.transactionId}
                      </div>
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(c.status)}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.assignedOfficer?.name || 'Assigned'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReceiptComplaint(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1e3a8a] hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Download Official Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => onSelectComplaintDossier(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          View
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

      {/* Official Acknowledgment Receipt Modal */}
      {receiptComplaint && (
        <VictimReceiptModal
          complaint={receiptComplaint}
          onClose={() => setReceiptComplaint(null)}
        />
      )}
    </div>
  );
};
