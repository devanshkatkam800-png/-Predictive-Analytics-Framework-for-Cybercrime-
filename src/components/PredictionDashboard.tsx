import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  Shield,
  MapPin,
  FileText,
  RefreshCw,
  Clock,
  Building,
  Target,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  UserCheck,
  Inbox,
  Flame,
  Activity,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Coins
} from 'lucide-react';
import { Complaint, Prediction, PredictedZone, IntelligenceReport, PriorityLevel } from '../types';
import { ExplainableAiPanel } from './ExplainableAiPanel';
import { OfficerCaseActionModal } from './OfficerCaseActionModal';

interface PredictionDashboardProps {
  complaints: Complaint[];
  predictions: Prediction[];
  reports: IntelligenceReport[];
  onViewOnMap: (zone?: PredictedZone, complaint?: Complaint) => void;
  onViewDossier: (reportId?: string, complaintId?: string) => void;
  onRegeneratePrediction: (complaintId: string) => Promise<void>;
  onCaseUpdated?: (updatedComplaint: Complaint) => void;
}

type QueueType = 'all' | 'incoming' | 'high_risk' | 'assigned' | 'recent';

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  complaints,
  predictions,
  reports,
  onViewOnMap,
  onViewDossier,
  onRegeneratePrediction,
  onCaseUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<QueueType>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [reloadingComplaintId, setReloadingComplaintId] = useState<string | null>(null);

  // Toggle explainable AI expansion per complaint
  const [expandedExplainableId, setExpandedExplainableId] = useState<string | null>(null);

  // Officer Case Management modal
  const [managingComplaint, setManagingComplaint] = useState<Complaint | null>(null);

  // Group complaints with their predictions
  const casesWithPredictions = complaints.map((c) => {
    const pred = predictions.find((p) => p.complaintId === c.complaintId);
    const rep = reports.find((r) => r.complaintId === c.complaintId);
    return { complaint: c, prediction: pred, report: rep };
  });

  // Calculate Queue counts
  const incomingCount = casesWithPredictions.filter(
    ({ complaint }) =>
      complaint.victimId ||
      ['Submitted', 'Under Verification', 'New', 'Under Review'].includes(complaint.status)
  ).length;

  const highRiskCount = casesWithPredictions.filter(
    ({ complaint, prediction }) =>
      prediction?.riskLevel === 'High' ||
      complaint.priority === 'Critical' ||
      complaint.priority === 'High' ||
      (prediction?.riskScore || 0) >= 75
  ).length;

  const assignedCount = casesWithPredictions.filter(
    ({ complaint }) => complaint.assignedOfficer || complaint.officerName
  ).length;

  const recentCount = casesWithPredictions.filter(({ complaint }) => {
    const d = new Date(complaint.createdAt).getTime();
    const now = Date.now();
    return now - d < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Filter cases based on queue, priority, risk, and search
  const filteredCases = casesWithPredictions.filter(({ complaint, prediction }) => {
    // 1. Queue filter
    if (selectedQueue === 'incoming') {
      const isIncoming =
        complaint.victimId ||
        ['Submitted', 'Under Verification', 'New', 'Under Review'].includes(complaint.status);
      if (!isIncoming) return false;
    } else if (selectedQueue === 'high_risk') {
      const isHigh =
        prediction?.riskLevel === 'High' ||
        complaint.priority === 'Critical' ||
        complaint.priority === 'High' ||
        (prediction?.riskScore || 0) >= 75;
      if (!isHigh) return false;
    } else if (selectedQueue === 'assigned') {
      const isAssigned = !!(complaint.assignedOfficer || complaint.officerName);
      if (!isAssigned) return false;
    } else if (selectedQueue === 'recent') {
      // handled via sort later or check 7 days
    }

    // 2. Risk filter
    if (selectedRiskFilter !== 'All') {
      if (prediction?.riskLevel !== selectedRiskFilter) return false;
    }

    // 3. Priority filter
    if (selectedPriorityFilter !== 'All') {
      const effPriority =
        complaint.priority ||
        (prediction?.priorityLevel) ||
        ((prediction?.riskScore || 0) >= 90
          ? 'Critical'
          : (prediction?.riskScore || 0) >= 75
          ? 'High'
          : (prediction?.riskScore || 0) >= 60
          ? 'Medium'
          : 'Low');
      if (effPriority !== selectedPriorityFilter) return false;
    }

    // 4. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchComp =
        complaint.complaintId.toLowerCase().includes(q) ||
        complaint.fraudType.toLowerCase().includes(q) ||
        complaint.victimCity.toLowerCase().includes(q) ||
        complaint.bankName.toLowerCase().includes(q) ||
        (complaint.assignedOfficer?.name && complaint.assignedOfficer.name.toLowerCase().includes(q)) ||
        (complaint.victimName && complaint.victimName.toLowerCase().includes(q));
      const matchZone = prediction?.topPredictedZones.some(
        (z) => z.zoneName.toLowerCase().includes(q) || z.city.toLowerCase().includes(q)
      );
      if (!matchComp && !matchZone) return false;
    }

    return true;
  });

  const handleRegenerate = async (complaintId: string) => {
    setReloadingComplaintId(complaintId);
    try {
      await onRegeneratePrediction(complaintId);
    } catch (err: any) {
      alert('Error recalculating predictive model: ' + err.message);
    } finally {
      setReloadingComplaintId(null);
    }
  };

  const avgConfidence =
    predictions.length > 0
      ? Math.round(predictions.reduce((acc, p) => acc + p.confidenceScore, 0) / predictions.length)
      : 84;
  const totalLossUnderSurveillance = complaints.reduce((sum, c) => sum + (c.amountLost || 0), 0);

  // 4 Primary Statistics
  const totalComplaintsCount = complaints.length;
  const activeInvestigationsCount = complaints.filter(
    (c) => !['Case Closed', 'Resolved', 'Closed'].includes(c.status)
  ).length;
  const highRiskCasesCount = highRiskCount;
  const totalRecoveryAmount = complaints.reduce(
    (sum, c) => sum + (c.amountRecovered || c.amountFrozen || 0),
    0
  );

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-50 text-[#ef4444] border-rose-200';
      case 'High':
        return 'bg-amber-50 text-[#f59e0b] border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-[#2563eb] border-blue-200';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Hero Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-blue-50 text-[#1e3a8a] border border-blue-200/80 uppercase">
                NATIONAL CYBERCRIME INTELLIGENCE COMMAND
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-[#10b981]">
                Real-Time Surveillance Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Investigating Officer Command Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Predictive cash withdrawal corridor intelligence, ATM cluster mapping, and multi-agency interception workflow.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Predictive Accuracy
              </div>
              <div className="text-xl font-black text-[#1e3a8a] font-mono">
                {avgConfidence}% Conf.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 4 PRIMARY STATISTICS CARDS (LARGER, FLOATING, CLEAN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Complaints */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl shadow-lg shadow-slate-200/40 flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Total Complaints
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
              <Shield className="w-6 h-6 text-[#1e3a8a]" />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalComplaintsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1e3a8a]" />
              <span>National intake repository</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Investigations */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl shadow-lg shadow-slate-200/40 flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Active Investigations
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
              <Activity className="w-6 h-6 text-[#2563eb]" />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-3xl sm:text-4xl font-black text-[#2563eb] tracking-tight">
              {activeInvestigationsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#2563eb]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
              <span>Under field surveillance</span>
            </div>
          </div>
        </div>

        {/* Card 3: High Risk Cases */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl shadow-lg shadow-slate-200/40 flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              High Risk Cases
            </span>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#ef4444] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-3xl sm:text-4xl font-black text-[#ef4444] tracking-tight">
              {highRiskCasesCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#ef4444]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
              <span>Imminent cash-out threat</span>
            </div>
          </div>
        </div>

        {/* Card 4: Recovery Amount */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl shadow-lg shadow-slate-200/40 flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Recovery Amount
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10b981] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
              <Coins className="w-6 h-6 text-[#10b981]" />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-2xl sm:text-3xl lg:text-3xl font-black text-[#10b981] tracking-tight">
              {formatCurrency(totalRecoveryAmount)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#10b981]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Lien frozen & restituted</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Queue Selector */}
      <div className="glass-card p-5 rounded-2xl shadow-md shadow-slate-200/40 space-y-4">
        {/* Queue Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedQueue('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedQueue === 'all'
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>All Cases ({casesWithPredictions.length})</span>
          </button>

          <button
            onClick={() => setSelectedQueue('high_risk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedQueue === 'high_risk'
                ? 'bg-[#ef4444] text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk ({highRiskCount})</span>
          </button>

          <button
            onClick={() => setSelectedQueue('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedQueue === 'incoming'
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Victim Reports ({incomingCount})</span>
          </button>

          <button
            onClick={() => setSelectedQueue('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedQueue === 'assigned'
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assigned Cases ({assignedCount})</span>
          </button>

          <button
            onClick={() => setSelectedQueue('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedQueue === 'recent'
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Recently Updated ({recentCount})</span>
          </button>
        </div>

        {/* Search input & Priority filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-200/70">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Complaint ID, Fraud Type, City, Bank, UTR, or Assigned IO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] cursor-pointer"
            >
              <option value="All">All Risk Bands</option>
              <option value="High">High Risk (&ge;75%)</option>
              <option value="Medium">Medium Risk (50-74%)</option>
              <option value="Low">Low Risk (&lt;50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Dockets List */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No complaints or prediction models found matching selected queue.</p>
            <p className="text-xs text-slate-400 mt-1">
              Switch queue filters or search for another complaint identifier.
            </p>
          </div>
        ) : (
          filteredCases.map(({ complaint, prediction, report }) => {
            const isCritical =
              complaint.priority === 'Critical' || (prediction?.riskScore || 0) >= 90;
            const priorityLabel: PriorityLevel =
              complaint.priority ||
              prediction?.priorityLevel ||
              ((prediction?.riskScore || 0) >= 90
                ? 'Critical'
                : (prediction?.riskScore || 0) >= 75
                ? 'High'
                : (prediction?.riskScore || 0) >= 60
                ? 'Medium'
                : 'Low');

            const isExplainableOpen =
              expandedExplainableId === complaint.complaintId || isCritical;

            return (
              <div
                key={complaint.complaintId}
                className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 shadow-lg shadow-slate-200/40 space-y-5 transition-all duration-300 border border-slate-200/80"
              >
                {/* Header: ID, Priority, Status, Filer Info, Amounts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900 tracking-tight">
                        {complaint.complaintId}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getPriorityBadgeClass(
                          priorityLabel
                        )}`}
                      >
                        Priority: {priorityLabel}
                      </span>

                      {/* Status Tag */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#1e3a8a] border border-blue-200">
                        {complaint.status}
                      </span>

                      {/* Citizen Portal Intake Badge */}
                      {complaint.victimId && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Inbox className="w-3 h-3" />
                          <span>Citizen: {complaint.victimName || 'Citizen'}</span>
                        </span>
                      )}

                      {/* Assigned Officer Tag */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200/60">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>IO: {complaint.assignedOfficer?.name || complaint.officerName || 'Unassigned'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Reported: <span className="text-slate-700 font-semibold">{complaint.victimCity}, {complaint.victimState}</span> &bull; Banking Node:{' '}
                      <span className="font-bold text-slate-900">{complaint.bankName}</span>{' '}
                      &bull; Ref UTR: <span className="font-mono text-slate-600">{complaint.transactionId}</span>
                      {complaint.victimMobile && <span> &bull; Mobile: {complaint.victimMobile}</span>}
                    </p>
                  </div>

                  {/* Financial Metrics & Risk Score */}
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Loss / Lien</div>
                      <div className="text-lg sm:text-xl font-black text-slate-900">
                        ₹{complaint.amountLost.toLocaleString('en-IN')}
                      </div>
                      {complaint.amountFrozen ? (
                        <div className="text-xs font-black text-[#10b981]">
                          ₹{complaint.amountFrozen.toLocaleString('en-IN')} Frozen Lien
                        </div>
                      ) : null}
                    </div>

                    {prediction && (
                      <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score</div>
                          <div
                            className={`text-xl font-black ${
                              prediction.riskScore >= 75
                                ? 'text-[#ef4444]'
                                : prediction.riskScore >= 55
                                ? 'text-[#f59e0b]'
                                : 'text-[#10b981]'
                            }`}
                          >
                            {prediction.riskScore}
                            <span className="text-xs text-slate-400 font-normal">/100</span>
                          </div>
                        </div>

                        <div className="text-center pl-2">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Confidence</div>
                          <div className="text-xl font-black text-[#2563eb]">
                            {prediction.confidenceScore}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prediction Content: Top Zones & Modus Operandi */}
                {prediction && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Top Predicted Zones List */}
                    <div className="lg:col-span-6 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-rose-500" />
                          <span>Top Predicted Cash Withdrawal Zones</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Ranked by Probability</span>
                      </div>

                      <div className="space-y-2">
                        {prediction.topPredictedZones.map((zone, idx) => (
                          <div
                            key={`${zone.zoneId}-${idx}`}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() => onViewOnMap(zone, complaint)}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">
                                  {zone.zoneName}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  ({zone.city}, {zone.state})
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                                  zone.probability >= 80
                                    ? 'bg-rose-100 text-rose-700'
                                    : zone.probability >= 70
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {zone.probability}%
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                              <div
                                className={`h-full rounded-full ${
                                  zone.probability >= 80
                                    ? 'bg-rose-500'
                                    : zone.probability >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${zone.probability}%` }}
                              />
                            </div>

                            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                              <div className="flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[200px]">{zone.representativeAtm}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {zone.estimatedTimeframe}
                                </span>
                                <span>&bull;</span>
                                <span className="text-blue-600 font-semibold">
                                  {zone.linkedHistoricalCasesCount} Linked Cases
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: AI Modus Operandi & Actionable Officer Steps */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                          <Cpu className="w-3.5 h-3.5 text-blue-700" />
                          <span>AI Pattern Analysis & Modus Operandi</span>
                        </div>
                        <div className="font-semibold text-slate-800 mb-1">
                          {prediction.scamClassification}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                          {prediction.patternAnalysis}
                        </p>
                        <div className="p-2 rounded bg-white border border-blue-100 text-[11px] text-slate-700 italic">
                          "{prediction.aiAnalysisText}"
                        </div>
                      </div>

                      {/* Actionable Steps */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Actionable Officer Interception Steps
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {prediction.investigationRecommendations.slice(0, 4).map((rec, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-1.5"
                            >
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="line-clamp-2">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EXPLAINABLE AI PANEL SECTION (Requested Feature) */}
                {prediction && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between pb-2">
                      <button
                        onClick={() =>
                          setExpandedExplainableId(
                            expandedExplainableId === complaint.complaintId ? null : complaint.complaintId
                          )
                        }
                        className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {expandedExplainableId === complaint.complaintId
                            ? 'Hide Explainable AI Forensic Grounding'
                            : `View Explainable AI Rationale (${prediction.explainableFactors?.length || 3} Grounded Factors)`}
                        </span>
                        {expandedExplainableId === complaint.complaintId ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400">
                        Auditable Historical Grounding
                      </span>
                    </div>

                    {isExplainableOpen && (
                      <ExplainableAiPanel prediction={prediction} className="mt-1" />
                    )}
                  </div>
                )}

                {/* Action Bar for this Case */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Updated: {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}
                    </span>
                    {complaint.timeline && (
                      <span>&bull; Stage {complaint.timeline.filter(t => t.status === 'completed').length} of {complaint.timeline.length || 8}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Officer Action Button */}
                    <button
                      type="button"
                      onClick={() => setManagingComplaint(complaint)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Manage Case & Lifecycle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegenerate(complaint.complaintId)}
                      disabled={reloadingComplaintId === complaint.complaintId}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          reloadingComplaintId === complaint.complaintId ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Re-run Model</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewDossier(report?.reportId, complaint.complaintId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dossier</span>
                    </button>

                    {prediction && prediction.topPredictedZones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onViewOnMap(prediction.topPredictedZones[0], complaint)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Map View</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Officer Case Action Modal */}
      {managingComplaint && (
        <OfficerCaseActionModal
          complaint={managingComplaint}
          onClose={() => setManagingComplaint(null)}
          onCaseUpdated={(updated) => {
            if (onCaseUpdated) {
              onCaseUpdated(updated);
            }
          }}
        />
      )}
    </div>
  );
};
