import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ComplaintForm } from './components/ComplaintForm';
import { PredictionDashboard } from './components/PredictionDashboard';
import { MapModule } from './components/MapModule';
import { IntelligenceReportsSection } from './components/IntelligenceReportsSection';
import { IntelligenceReportModal } from './components/IntelligenceReportModal';
import { HistoricalDatasetSection } from './components/HistoricalDatasetSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SihPredictiveDashboard } from './components/sih/SihPredictiveDashboard';
import { VictimPortalView } from './components/victim/VictimPortalView';
import { api } from './services/api';
import {
  Complaint,
  Prediction,
  PredictedZone,
  HistoricalCase,
  IntelligenceReport,
  AppNotification,
  DashboardStats,
  User
} from './types';
import {
  Shield,
  Lock,
  ArrowRight,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FilePlus,
  Compass,
  MapPin,
  FileText,
  Database,
  BarChart3
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme: Modern white theme default, with dark mode toggle
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mha_dark_mode') === 'true';
  });

  // Portal Mode: 'officer' (MHA Law Enforcement) or 'victim' (Citizen Grievance Redressal)
  const [portalMode, setPortalMode] = useState<'officer' | 'victim'>('officer');

  // Navigation tab for Officer Portal
  const [activeTab, setActiveTab] = useState<string>('predictions');

  // Core Intelligence Data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [historicalCases, setHistoricalCases] = useState<HistoricalCase[]>([]);
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Inter-module interaction states
  const [selectedMapZone, setSelectedMapZone] = useState<PredictedZone | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<IntelligenceReport | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  // Synchronize Dark Mode class on HTML root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mha_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mha_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load all platform datasets
  const loadData = useCallback(async () => {
    try {
      const [cList, pList, hcList, rList, st, notifs] = await Promise.all([
        api.getComplaints().catch(() => []),
        api.getPredictions().catch(() => []),
        api.getHistoricalCases().catch(() => []),
        api.getReports().catch(() => []),
        api.getAnalytics().catch(() => null),
        api.getNotifications().catch(() => [])
      ]);

      setComplaints(cList);
      setPredictions(pList);
      setHistoricalCases(hcList);
      setReports(rList);
      if (st) setStats(st);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed loading primary intelligence datasets:', err);
    }
  }, []);

  // Check auth session
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch (err) {
        // Not authenticated yet
        setCurrentUser(null);
      } finally {
        await loadData();
        setLoading(false);
      }
    };
    init();
  }, [loadData]);

  // Handlers
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('Signed out of MHA Intelligence Platform');
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    showToast(`Welcome, ${user.name} (${user.organization})`);
    await loadData();
  };

  // When a complaint is submitted from ComplaintForm
  const handleComplaintSubmitted = async (result: {
    complaint: Complaint;
    prediction: Prediction;
    report: IntelligenceReport;
  }) => {
    await loadData();
    showToast(`Prediction generated! High-risk zones forecasted for ${result.complaint.complaintId}`);
    setActiveTab('predictions');
  };

  // View on Map from Prediction Dashboard
  const handleViewOnMap = (zone?: PredictedZone, complaint?: Complaint) => {
    if (zone) setSelectedMapZone(zone);
    setActiveTab('map');
  };

  // View Dossier
  const handleViewDossier = (reportId?: string, complaintId?: string) => {
    let rep: IntelligenceReport | undefined;
    if (reportId) {
      rep = reports.find((r) => r.reportId === reportId);
    }
    if (!rep && complaintId) {
      rep = reports.find((r) => r.complaintId === complaintId);
    }
    if (!rep && reports.length > 0) {
      rep = reports[0];
    }
    if (rep) {
      setActiveReportModal(rep);
    } else {
      showToast('Intelligence dossier is being compiled...', 'alert');
    }
  };

  // Regenerate Prediction
  const handleRegeneratePrediction = async (complaintId: string) => {
    await api.regeneratePrediction(complaintId);
    await loadData();
    showToast(`Predictive model recalibrated for ${complaintId}`);
  };

  // Dispatch Tactical Alert
  const handleDispatchAlert = async (data: {
    complaintId: string;
    zoneName: string;
    atmName?: string;
    policeStation?: string;
    urgency?: string;
  }) => {
    const res = await api.dispatchAlert(data);
    await loadData();
    showToast(res.message);
  };

  // Mark notification read & inspect
  const handleNotificationClick = async (notif: AppNotification) => {
    await api.markNotificationAsRead(notif.id);
    if (notif.complaintId) {
      const rep = reports.find((r) => r.complaintId === notif.complaintId);
      if (rep) setActiveReportModal(rep);
      else setActiveTab('predictions');
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
        <div className="w-10 h-10 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-sm font-bold tracking-wider uppercase text-blue-900 dark:text-blue-400">
          MINISTRY OF HOME AFFAIRS (MHA)
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Loading Cybercrime Cash Withdrawal Predictive Platform...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <div
            className={`p-3.5 rounded-xl shadow-xl border text-xs flex items-center gap-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-blue-900 text-white border-blue-800'
                : 'bg-amber-900 text-white border-amber-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {portalMode === 'victim' ? (
          /* ========================================================================= */
          /* CITIZEN / VICTIM GRIEVANCE & FUND RESTITUTION PORTAL                      */
          /* ========================================================================= */
          <VictimPortalView
            onSwitchToOfficerPortal={() => setPortalMode('officer')}
            showToast={showToast}
          />
        ) : (
          /* ========================================================================= */
          /* LAW ENFORCEMENT & INVESTIGATING OFFICER INTELLIGENCE PORTAL               */
          /* ========================================================================= */
          !currentUser ? (
            /* Unauthenticated Officer Gateway */
            <div className="max-w-xl mx-auto my-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white mb-4 shadow-lg shadow-blue-700/25">
                  <Shield className="w-7 h-7 text-white" />
                </div>

                <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-1">
                  GOVERNMENT OF INDIA &bull; MINISTRY OF HOME AFFAIRS
                </div>

                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Cybercrime Cash Withdrawal Predictive Intelligence Platform
                </h1>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  A specialized analytical decision-support framework that evaluates cybercrime complaints and transaction trails to forecast likely cash withdrawal locations and high-risk ATM clusters in advance, enabling timely law enforcement interception.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Authorized Law Enforcement Access Only</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    This platform is restricted to Investigating Officers and Cyber Cell Administrators. Citizen victims should use the dedicated Citizen Redressal Portal.
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-700/20 cursor-pointer"
                  >
                    <span>Officer Sign In / Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPortalMode('victim')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Citizen / Victim Portal</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated Officer Workspace */
            <div>
              {activeTab === 'complaint' && (
                <ComplaintForm
                  onSubmitSuccess={handleComplaintSubmitted}
                  onCancel={() => setActiveTab('predictions')}
                />
              )}

              {activeTab === 'predictions' && (
                <PredictionDashboard
                  complaints={complaints}
                  predictions={predictions}
                  reports={reports}
                  onViewOnMap={handleViewOnMap}
                  onViewDossier={handleViewDossier}
                  onRegeneratePrediction={handleRegeneratePrediction}
                  onNavigateToSih={() => setActiveTab('sih')}
                  onCaseUpdated={async (updated) => {
                    await loadData();
                    showToast(`Case ${updated.complaintId} updated & synchronized across MHA platform`);
                  }}
                />
              )}

              {activeTab === 'sih' && (
                <SihPredictiveDashboard
                  onDispatchAlert={handleDispatchAlert}
                />
              )}

              {activeTab === 'map' && (
                <MapModule
                  complaints={complaints}
                  predictions={predictions}
                  historicalCases={historicalCases}
                  initialSelectedZone={selectedMapZone}
                  onDispatchAlert={handleDispatchAlert}
                />
              )}

              {activeTab === 'reports' && (
                <IntelligenceReportsSection
                  reports={reports}
                  complaints={complaints}
                  onOpenReport={(rep) => setActiveReportModal(rep)}
                />
              )}

              {activeTab === 'historical' && (
                <HistoricalDatasetSection
                  historicalCases={historicalCases}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsSection stats={stats} />
              )}
            </div>
          )
        )}
      </main>

      {/* Official Government Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {portalMode === 'victim'
                ? 'National Cybercrime Reporting Portal (NCRP)'
                : 'Ministry of Home Affairs (MHA)'}
            </span>
            <span>&bull;</span>
            <span>
              {portalMode === 'victim'
                ? 'Citizen Financial Fraud Redressal (1930)'
                : 'Indian Cybercrime Coordination Centre (I4C)'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            {portalMode === 'victim'
              ? 'Official Citizen Portal for Cyber Financial Fraud Reporting & Lien Tracking'
              : 'Predictive Analytics Framework for Proactive Cybercrime Cash-Out Interception • Strictly Official Use'}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {activeReportModal && (
        <IntelligenceReportModal
          report={activeReportModal}
          complaint={complaints.find((c) => c.complaintId === activeReportModal.complaintId)}
          prediction={predictions.find((p) => p.complaintId === activeReportModal.complaintId)}
          onClose={() => setActiveReportModal(null)}
        />
      )}
    </div>
  );
}
