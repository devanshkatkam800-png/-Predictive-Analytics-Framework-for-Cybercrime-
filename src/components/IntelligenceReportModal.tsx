import React from 'react';
import { X, Shield, Download, FileText, CheckCircle2, AlertTriangle, Printer, FileSpreadsheet, Building } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { IntelligenceReport, Complaint, Prediction } from '../types';
import { ExplainableAiPanel } from './ExplainableAiPanel';

interface IntelligenceReportModalProps {
  report: IntelligenceReport | null;
  complaint?: Complaint;
  prediction?: Prediction;
  onClose: () => void;
}

export const IntelligenceReportModal: React.FC<IntelligenceReportModalProps> = ({
  report,
  complaint,
  prediction,
  onClose
}) => {
  if (!report) return null;

  // Export as Official PDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header styling
    doc.setFillColor(30, 58, 138); // Official MHA Blue #1e3a8a
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS (MHA)', 105, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(191, 219, 254);
    doc.text('INDIAN CYBERCRIME COORDINATION CENTRE (I4C) • TACTICAL PREDICTIVE INTELLIGENCE', 105, 19, { align: 'center' });
    doc.text(`REPORT REF: ${report.reportId} | CASE REF: ${report.complaintId} | DATE: ${new Date(report.generatedAt).toLocaleDateString()}`, 105, 26, { align: 'center' });

    // Section 1: Complaint & Financial Details
    let y = 42;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. CASE IDENTIFICATION & INCIDENT PARAMETERS', 14, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    doc.text(`Complaint Reference: ${report.complaintId}`, 14, y);
    doc.text(`Threat Risk Score: ${report.riskScore} / 100 (${report.riskLevel} Risk)`, 110, y);

    y += 5;
    doc.text(`Fraud Classification: ${complaint?.fraudType || 'Cyber Financial Crime'}`, 14, y);
    doc.text(`Financial Loss: INR ${(complaint?.amountLost || 0).toLocaleString('en-IN')}`, 110, y);

    y += 5;
    doc.text(`Victim Location: ${complaint?.victimCity || 'Unknown'}, ${complaint?.victimState || ''}`, 14, y);
    doc.text(`Bank / Channel: ${complaint?.bankName || 'State Bank of India'}`, 110, y);

    // Section 2: Operational Intelligence Summary
    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. OPERATIONAL INTELLIGENCE & SYNDICATE SUMMARY', 14, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(report.reportSummary, 182);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 4.5 + 4;

    // Section 3: Pattern Analysis
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. PATTERN ANALYSIS & MODUS OPERANDI', 14, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const patternLines = doc.splitTextToSize(report.patternAnalysis || report.scamClassification, 182);
    doc.text(patternLines, 14, y);
    y += patternLines.length * 4.5 + 4;

    // Section 4: Top Forecasted Withdrawal Zones Table
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. ADVANCE CASH WITHDRAWAL ZONES FORECAST', 14, y);

    y += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, 182, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('PREDICTED ZONE', 16, y);
    doc.text('CITY / REGION', 75, y);
    doc.text('PROBABILITY', 120, y);
    doc.text('EST. TIMEFRAME', 150, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const zones = report.topPredictedZones || [];
    zones.forEach((z) => {
      doc.text(z.zoneName.slice(0, 32), 16, y);
      doc.text(`${z.city}, ${z.state}`.slice(0, 24), 75, y);
      doc.text(`${z.probability}% (${z.riskLevel})`, 120, y);
      doc.text(z.estimatedTimeframe, 150, y);
      y += 5.5;
    });

    // Section 5: Recommendations
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('5. ACTIONABLE INTERVENTION DIRECTIVES FOR INVESTIGATING OFFICERS', 14, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const recs = report.investigationRecommendations || [];
    recs.forEach((rec, i) => {
      const bullet = `${i + 1}. ${rec}`;
      const recLines = doc.splitTextToSize(bullet, 182);
      doc.text(recLines, 14, y);
      y += recLines.length * 4 + 2;
    });

    // Officer Signature Seal Footer
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 272, 196, 272);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'ELECTRONICALLY GENERATED OFFICIAL INTELLIGENCE DOSSIER • STRICTLY LAW ENFORCEMENT SENSITIVE • I4C/MHA',
      105,
      277,
      { align: 'center' }
    );
    doc.text(`Generated By: ${report.generatedBy} (${report.officerOrganization})`, 105, 281, { align: 'center' });

    doc.save(`MHA_Intel_Dossier_${report.reportId}.pdf`);
  };

  // Export as CSV
  const handleDownloadCsv = () => {
    const headers = ['ReportId', 'ComplaintId', 'RiskScore', 'RiskLevel', 'Confidence', 'ZoneName', 'City', 'State', 'Probability', 'RepresentativeAtm', 'Timeframe'];
    const rows = (report.topPredictedZones || []).map((z) => [
      report.reportId,
      report.complaintId,
      report.riskScore,
      report.riskLevel,
      report.confidenceScore,
      `"${z.zoneName}"`,
      `"${z.city}"`,
      `"${z.state}"`,
      `${z.probability}%`,
      `"${z.representativeAtm}"`,
      `"${z.estimatedTimeframe}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MHA_Intel_${report.reportId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">
              MINISTRY OF HOME AFFAIRS (MHA) &bull; I4C
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {report.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Ref: <strong className="font-mono text-slate-700 dark:text-slate-300">{report.reportId}</strong></span>
            <span>&bull;</span>
            <span>Case: <strong className="font-mono text-slate-700 dark:text-slate-300">{report.complaintId}</strong></span>
            <span>&bull;</span>
            <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Incident Summary & Risk Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Incident Loss</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              ₹{(complaint?.amountLost || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{complaint?.fraudType}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Evaluation</div>
            <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {report.riskScore} / 100 ({report.riskLevel})
            </div>
            <div className="text-[11px] text-slate-500">Confidence: {report.confidenceScore}%</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Origin & Bank</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {complaint?.victimCity}, {complaint?.victimState}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{complaint?.bankName}</div>
          </div>
        </div>

        {/* Report Narrative Summary */}
        <div className="mb-5 space-y-3 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
              Operational Intelligence Summary
            </h3>
            <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.reportSummary}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
              Syndicate Modus Operandi & Pattern Analysis
            </h3>
            <p className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.patternAnalysis}
            </p>
          </div>
        </div>

        {/* Forecasted Zones Table */}
        <div className="mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
            Top Forecasted Withdrawal Locations & Corridors
          </h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Predicted Zone</th>
                  <th className="p-2.5">City / Region</th>
                  <th className="p-2.5">Probability</th>
                  <th className="p-2.5">Representative ATM</th>
                  <th className="p-2.5">Timeframe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {(report.topPredictedZones || []).map((zone, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{zone.zoneName}</td>
                    <td className="p-2.5">{zone.city}, {zone.state}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {zone.probability}%
                      </span>
                    </td>
                    <td className="p-2.5 truncate max-w-[160px]">{zone.representativeAtm}</td>
                    <td className="p-2.5 font-medium">{zone.estimatedTimeframe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable AI Forensic Grounding Panel */}
        {prediction && (
          <div className="mb-5">
            <ExplainableAiPanel prediction={prediction} />
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
            Actionable Intervention Directives
          </h3>
          <div className="space-y-1.5 text-xs">
            {(report.investigationRecommendations || []).map((rec, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">
            Officer Organization: <strong className="text-slate-700 dark:text-slate-300">{report.officerOrganization}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
