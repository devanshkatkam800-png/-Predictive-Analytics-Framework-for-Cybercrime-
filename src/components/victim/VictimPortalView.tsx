import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  FilePlus,
  Compass,
  FolderArchive,
  TrendingUp,
  Bell,
  Sparkles,
  BarChart3,
  User,
  LogOut,
  Lock,
  ArrowRight,
  Phone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  VictimUser,
  VictimComplaint,
  VictimEvidence,
  VictimNotification,
  VictimDashboardStats
} from '../../types';
import { victimApi } from '../../services/api';
import { VictimDashboard } from './VictimDashboard';
import { VictimComplaintTracker } from './VictimComplaintTracker';
import { VictimComplaintForm } from './VictimComplaintForm';
import { VictimEvidenceCenter } from './VictimEvidenceCenter';
import { VictimRecoveryStatus } from './VictimRecoveryStatus';
import { VictimNotificationsCenter } from './VictimNotificationsCenter';
import { VictimAiAssistant } from './VictimAiAssistant';
import { VictimCaseDetailsModal } from './VictimCaseDetailsModal';
import { VictimAuthModal } from './VictimAuthModal';

interface VictimPortalViewProps {
  onSwitchToOfficerPortal: () => void;
  showToast: (text: string, type?: 'success' | 'alert') => void;
}

export const VictimPortalView: React.FC<VictimPortalViewProps> = ({
  onSwitchToOfficerPortal,
  showToast
}) => {
  const [currentVictim, setCurrentVictim] = useState<VictimUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sub-Navigation Tabs inside Victim Module
  const [subTab, setSubTab] = useState<
    'dashboard' | 'tracker' | 'new-complaint' | 'evidence' | 'recovery' | 'notifications' | 'ai-assistant'
  >('dashboard');

  // State data
  const [stats, setStats] = useState<VictimDashboardStats | null>(null);
  const [complaints, setComplaints] = useState<VictimComplaint[]>([]);
  const [evidenceList, setEvidenceList] = useState<VictimEvidence[]>([]);
  const [notifications, setNotifications] = useState<VictimNotification[]>([]);

  // Selection & Modal states
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | undefined>();
  const [dossierComplaint, setDossierComplaint] = useState<VictimComplaint | null>(null);

  // Load victim data
  const loadVictimData = useCallback(async () => {
    if (!victimApi.getToken()) return;
    try {
      const [dashRes, cList, evList, nList] = await Promise.all([
        victimApi.getDashboard().catch(() => null),
        victimApi.getComplaints().catch(() => []),
        victimApi.getEvidence().catch(() => []),
        victimApi.getNotifications().catch(() => [])
      ]);

      if (dashRes?.stats) setStats(dashRes.stats);
      setComplaints(cList);
      setEvidenceList(evList);
      setNotifications(nList);
    } catch (err) {
      console.error('Failed loading victim data:', err);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (victimApi.getToken()) {
          const victim = await victimApi.getMe();
          setCurrentVictim(victim);
          await loadVictimData();
        } else {
          setCurrentVictim(null);
        }
      } catch (err) {
        setCurrentVictim(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadVictimData]);

  const handleLogout = () => {
    victimApi.logout();
    setCurrentVictim(null);
    setComplaints([]);
    setEvidenceList([]);
    setNotifications([]);
    setStats(null);
    showToast('Signed out of Citizen Portal');
  };

  const handleAuthSuccess = async (victim: VictimUser) => {
    setCurrentVictim(victim);
    setAuthModalOpen(false);
    showToast(`Welcome, ${victim.name} (Citizen ID: ${victim.victimId})`);
    await loadVictimData();
  };

  const handleComplaintSubmitted = async (newComplaint: VictimComplaint) => {
    await loadVictimData();
    setSelectedComplaintId(newComplaint.complaintId);
    showToast(`Complaint lodged! Bank lien protocol triggered for ${newComplaint.complaintId}`);
    setSubTab('tracker');
  };

  const handleNotificationClick = async (notif: VictimNotification) => {
    await victimApi.markNotificationAsRead(notif.id);
    await loadVictimData();
    if (notif.complaintId) {
      setSelectedComplaintId(notif.complaintId);
      const c = complaints.find((x) => x.complaintId === notif.complaintId);
      if (c) setDossierComplaint(c);
      else setSubTab('tracker');
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          Accessing Citizen Cybercrime Reporting Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Citizen Sub-Navbar & Tab Strip */}
      {currentVictim ? (
        <div className="glass-card rounded-2xl p-3 sm:p-4 shadow-md shadow-slate-200/40 border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Citizen Identifier Pill */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{currentVictim.name}</span>
                  <span className="font-mono text-[10px] text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                    {currentVictim.victimId}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Citizen Access &bull; Mobile: {currentVictim.mobile}
                </div>
              </div>
            </div>

            {/* Sub-Navigation Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-1">
              <button
                onClick={() => setSubTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setSubTab('tracker')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subTab === 'tracker'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Case Tracker</span>
              </button>

              <button
                onClick={() => setSubTab('new-complaint')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer font-bold ${
                  subTab === 'new-complaint'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-[#1e3a8a] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Report Fraud</span>
              </button>

              <button
                onClick={() => setSubTab('evidence')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subTab === 'evidence'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Evidence Center</span>
              </button>

              <button
                onClick={() => setSubTab('recovery')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subTab === 'recovery'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Recovery Status</span>
              </button>

              <button
                onClick={() => setSubTab('notifications')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap relative cursor-pointer ${
                  subTab === 'notifications'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSubTab('ai-assistant')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subTab === 'ai-assistant'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-900/20'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>AI Cyber Advisor</span>
              </button>

              {/* Citizen Sign Out */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                title="Citizen Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main View Body */}
      {!currentVictim ? (
        /* Unauthenticated Citizen Portal Hero / Landing */
        <div className="max-w-3xl mx-auto my-8 space-y-6">
          <div className="glass-card border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden bg-white/90">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white mb-4 shadow-lg shadow-blue-900/25">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-widest text-[#1e3a8a] mb-1">
              GOVERNMENT OF INDIA &bull; NATIONAL CYBERCRIME REPORTING PORTAL
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Citizen Cyber Fraud Redressal & Recovery Portal
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
              Official portal for victims of cyber financial fraud, UPI scams, fake loan apps, and identity theft. Log your incident to immediately trigger the 1930 automated inter-bank freeze and track fund restitution in real time.
            </p>

            <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Immediate Bank Freeze</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Direct API broadcast to victim and beneficiary banks to halt withdrawals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                  <span>6-Stage Case Tracking</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  End-to-end transparency from complaint verification to court restitution.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                  <span>Gemini AI Cyber Advisor</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  24x7 automated legal and banking guidance for cybercrime victims.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/25 cursor-pointer"
              >
                <span>Citizen Sign In / Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSwitchToOfficerPortal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Switch to Officer Intelligence Portal
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Citizen Workspace */
        <div>
          {subTab === 'dashboard' && (
            <VictimDashboard
              victim={currentVictim}
              stats={stats}
              recentComplaints={complaints}
              onFileNewComplaint={() => setSubTab('new-complaint')}
              onTrackComplaint={(cId) => {
                if (cId) setSelectedComplaintId(cId);
                setSubTab('tracker');
              }}
              onOpenEvidence={(cId) => {
                if (cId) setSelectedComplaintId(cId);
                setSubTab('evidence');
              }}
              onOpenRecovery={(cId) => {
                if (cId) setSelectedComplaintId(cId);
                setSubTab('recovery');
              }}
              onOpenAiAssistant={() => setSubTab('ai-assistant')}
              onSelectComplaintDossier={(c) => setDossierComplaint(c)}
            />
          )}

          {subTab === 'tracker' && (
            <VictimComplaintTracker
              complaints={complaints}
              selectedComplaintId={selectedComplaintId}
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              onOpenEvidence={(id) => {
                setSelectedComplaintId(id);
                setSubTab('evidence');
              }}
              onOpenRecovery={(id) => {
                setSelectedComplaintId(id);
                setSubTab('recovery');
              }}
              onOpenAiAssistant={(id) => {
                setSelectedComplaintId(id);
                setSubTab('ai-assistant');
              }}
              onFileNewComplaint={() => setSubTab('new-complaint')}
            />
          )}

          {subTab === 'new-complaint' && (
            <VictimComplaintForm
              onSuccess={handleComplaintSubmitted}
              onCancel={() => setSubTab('dashboard')}
            />
          )}

          {subTab === 'evidence' && (
            <VictimEvidenceCenter
              complaints={complaints}
              evidenceList={evidenceList}
              onEvidenceUpdated={loadVictimData}
            />
          )}

          {subTab === 'recovery' && (
            <VictimRecoveryStatus
              complaints={complaints}
              selectedComplaintId={selectedComplaintId}
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              onAskAi={(id) => {
                setSelectedComplaintId(id);
                setSubTab('ai-assistant');
              }}
            />
          )}

          {subTab === 'notifications' && (
            <VictimNotificationsCenter
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onRefresh={loadVictimData}
            />
          )}

          {subTab === 'ai-assistant' && (
            <VictimAiAssistant
              complaints={complaints}
              selectedComplaintId={selectedComplaintId}
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              onFileNewComplaint={() => setSubTab('new-complaint')}
            />
          )}
        </div>
      )}

      {/* Case Details Dossier Modal */}
      {dossierComplaint && (
        <VictimCaseDetailsModal
          complaint={dossierComplaint}
          evidenceList={evidenceList}
          onClose={() => setDossierComplaint(null)}
          onTrackTimeline={(id) => {
            setSelectedComplaintId(id);
            setSubTab('tracker');
          }}
          onViewRecovery={(id) => {
            setSelectedComplaintId(id);
            setSubTab('recovery');
          }}
          onAskAi={(id) => {
            setSelectedComplaintId(id);
            setSubTab('ai-assistant');
          }}
        />
      )}

      {/* Victim Auth Modal */}
      <VictimAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
