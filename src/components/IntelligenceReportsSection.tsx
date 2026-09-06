import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  FileSpreadsheet,
  Shield,
  Eye,
  Calendar,
  AlertTriangle,
  Building,
  Target
} from 'lucide-react';
import { IntelligenceReport, Complaint } from '../types';

interface IntelligenceReportsSectionProps {
  reports: IntelligenceReport[];
  complaints: Complaint[];
  onOpenReport: (report: IntelligenceReport) => void;
}

export const IntelligenceReportsSection: React.FC<IntelligenceReportsSectionProps> = ({
  reports,
  complaints,
  onOpenReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const filteredReports = reports.filter((r) => {
    if (riskFilter !== 'All' && r.riskLevel !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.reportId.toLowerCase().includes(q) ||
        r.complaintId.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.topPredictedZones.some((z) => z.zoneName.toLowerCase().includes(q) || z.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                MHA LAW ENFORCEMENT DOSSIERS
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Actionable Intelligence Archives
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Intelligence Reports & Intercept Dossiers
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Official cybercrime intelligence briefs containing complaint summaries, forecasted withdrawal corridors, AI syndicate behavioral findings, and tactical intervention steps. Exportable as signed government PDFs and CSV datasets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Archived Dossiers</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {reports.length}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Report ID, Case Ref, or Zone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-semibold mr-1">Filter by Risk:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                  riskFilter === r
                    ? r === 'High'
                      ? 'bg-rose-600 text-white'
                      : r === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : r === 'Low'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No intelligence reports found matching your criteria.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const linkedComp = complaints.find((c) => c.complaintId === report.complaintId);
            return (
              <div
                key={report.reportId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                      {report.reportId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        report.riskLevel === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : report.riskLevel === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {report.riskScore}/100 &bull; {report.riskLevel} Risk
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {report.reportSummary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Case Reference:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{report.complaintId}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Loss Amount:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ₹{(linkedComp?.amountLost || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Top Predicted Corridor:</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {report.topPredictedZones[0]?.zoneName || 'Metropolitan Hub'} ({report.topPredictedZones[0]?.probability}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-400">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenReport(report)}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier & PDF</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
