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
  onNavigateToSih?: () => void;
}

type QueueType = 'all' | 'incoming' | 'high_risk' | 'assigned' | 'recent';

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  complaints,
  predictions,
  reports,
  onViewOnMap,
  onViewDossier,
  onRegeneratePrediction,
  onCaseUpdated,
  onNavigateToSih
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

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'High':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Medium':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Low':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                MHA TACTICAL PREDICTIVE FRAMEWORK
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Corridor Cluster Model & Explainable AI Grounding
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cash Withdrawal Prediction & Case Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Forecasting high-risk cash withdrawal zones, managing citizen complaints across the unified lifecycle, assigning field investigators, and auditing AI rationales.
            </p>
            {onNavigateToSih && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={onNavigateToSih}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Launch SIH Random Forest Cashout Forecaster</span>
                  <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
                    87.2% Acc
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Dockets</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{complaints.length}</div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
              <div className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Incoming Citizen</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-0.5">{incomingCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">High Risk / Critical</div>
              <div className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5">{highRiskCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Loss Monitored</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{(totalLossUnderSurveillance / 100000).toFixed(1)}L
              </div>
            </div>
          </div>
        </div>

        {/* 1. Officer Queues Filter Bar (Requested Queue System) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Queues:</span>
            </span>

            <button
              onClick={() => setSelectedQueue('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedQueue === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>All Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 font-extrabold">
                {casesWithPredictions.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('incoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedQueue === 'incoming'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming Victim Complaints</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-900 text-purple-200 font-extrabold">
                {incomingCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('high_risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedQueue === 'high_risk'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Risk Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-900 text-rose-200 font-extrabold">
                {highRiskCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedQueue === 'assigned'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-900 text-blue-200 font-extrabold">
                {assignedCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedQueue === 'recent'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Recently Updated Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900 text-emerald-200 font-extrabold">
                {recentCount}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Priority & Risk Filter Toolbar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Officer, Victim, Bank, City..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Priority:</span>
              {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    selectedPriorityFilter === p
                      ? p === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : p === 'High'
                        ? 'bg-amber-600 text-white'
                        : p === 'Medium'
                        ? 'bg-blue-600 text-white'
                        : p === 'Low'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Risk:</span>
              {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedRiskFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    selectedRiskFilter === lvl
                      ? lvl === 'High'
                        ? 'bg-rose-600 text-white'
                        : lvl === 'Medium'
                        ? 'bg-amber-600 text-white'
                        : lvl === 'Low'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Dockets List */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-blue-500/50 transition-all space-y-4"
              >
                {/* Header: ID, Priority, Status, Filer Info, Amounts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                        {complaint.complaintId}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black border uppercase tracking-wide ${getPriorityBadgeClass(
                          priorityLabel
                        )}`}
                      >
                        Priority: {priorityLabel}
                      </span>

                      {/* Status Tag */}
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {complaint.status}
                      </span>

                      {/* Citizen Portal Intake Badge */}
                      {complaint.victimId && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <Inbox className="w-3 h-3" />
                          <span>Citizen Filer: {complaint.victimName || 'Citizen'}</span>
                        </span>
                      )}

                      {/* Assigned Officer Tag */}
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>IO: {complaint.assignedOfficer?.name || complaint.officerName || 'Unassigned'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Reported: {complaint.victimCity}, {complaint.victimState} &bull; Channel:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.bankName}</span>{' '}
                      &bull; Ref UTR: <span className="font-mono">{complaint.transactionId}</span>
                      {complaint.victimMobile && <span> &bull; Mob: {complaint.victimMobile}</span>}
                    </p>
                  </div>

                  {/* Financial Metrics & Risk Score */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Loss / Frozen</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{complaint.amountLost.toLocaleString('en-IN')}
                      </div>
                      {complaint.amountFrozen ? (
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{complaint.amountFrozen.toLocaleString('en-IN')} Lien
                        </div>
                      ) : null}
                    </div>

                    {prediction && (
                      <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                        <div className="text-center">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Risk Score</div>
                          <div
                            className={`text-lg font-black ${
                              prediction.riskScore >= 75
                                ? 'text-rose-600 dark:text-rose-400'
                                : prediction.riskScore >= 55
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {prediction.riskScore}
                            <span className="text-[10px] text-slate-400 font-normal">/100</span>
                          </div>
                        </div>

                        <div className="text-center pl-2">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Confidence</div>
                          <div className="text-lg font-black text-blue-600 dark:text-blue-400">
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
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-rose-500" />
                          <span>Top Predicted Cash Withdrawal Zones</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Ranked by Probability</span>
                      </div>

                      <div className="space-y-2">
                        {prediction.topPredictedZones.map((zone, idx) => (
                          <div
                            key={zone.zoneId}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() => onViewOnMap(zone, complaint)}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {zone.zoneName}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  ({zone.city}, {zone.state})
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                                  zone.probability >= 80
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    : zone.probability >= 70
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {zone.probability}%
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
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

                            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                              <div className="flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[200px]">{zone.representativeAtm}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {zone.estimatedTimeframe}
                                </span>
                                <span>&bull;</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
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
                      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1">
                          <Cpu className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                          <span>AI Pattern Analysis & Modus Operandi</span>
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {prediction.scamClassification}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mb-2">
                          {prediction.patternAnalysis}
                        </p>
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-700 dark:text-slate-300 italic">
                          "{prediction.aiAnalysisText}"
                        </div>
                      </div>

                      {/* Actionable Steps */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Actionable Officer Interception Steps
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {prediction.investigationRecommendations.slice(0, 4).map((rec, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                            >
                              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                        className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
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
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
