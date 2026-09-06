import React, { useState } from 'react';
import {
  Shield,
  FilePlus,
  Compass,
  MapPin,
  FileText,
  Database,
  BarChart3,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { User, AppNotification } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  portalMode: 'officer' | 'victim';
  setPortalMode: (mode: 'officer' | 'victim') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  notifications,
  onNotificationClick,
  darkMode,
  onToggleDarkMode,
  portalMode,
  setPortalMode
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Government Official Banner */}
      <div
        className={`${
          portalMode === 'victim' ? 'bg-slate-900' : 'bg-blue-900'
        } text-white px-4 py-1 flex items-center justify-between text-xs font-medium transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              portalMode === 'victim' ? 'bg-emerald-400' : 'bg-blue-400'
            } animate-pulse`}
          />
          <span className="font-semibold tracking-wider uppercase text-[11px]">
            {portalMode === 'victim'
              ? 'GOVERNMENT OF INDIA • NATIONAL CYBERCRIME REPORTING PORTAL (NCRP) • HELPLINE 1930'
              : 'MINISTRY OF HOME AFFAIRS (MHA) • INDIAN CYBERCRIME COORDINATION CENTRE (I4C)'}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300 text-[11px]">
            {portalMode === 'victim'
              ? 'CITIZEN FRAUD REDRESSAL & FUND RESTITUTION PORTAL'
              : 'CYBERCRIME CASH WITHDRAWAL PREDICTIVE ANALYTICS PLATFORM'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {portalMode === 'officer' ? (
            user ? (
              <span className="text-[11px] text-blue-200 hidden sm:inline">
                Officer: <span className="font-semibold text-white">{user.name}</span> ({user.role === 'admin' ? 'Administrator' : 'Investigating Officer'})
              </span>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-blue-100 hover:text-white underline underline-offset-2 cursor-pointer"
              >
                Officer Sign In Required
              </button>
            )
          ) : (
            <span className="text-[11px] text-emerald-300 font-semibold hidden sm:inline">
              Citizen Emergency Helpline: 1930
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & National Seal Motif */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => {
              if (portalMode === 'officer') setActiveTab('predictions');
            }}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md font-bold text-white transition-colors ${
                portalMode === 'victim'
                  ? 'bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-blue-700 shadow-blue-700/20'
              }`}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  {portalMode === 'victim' ? (
                    <>
                      NCRP <span className="text-emerald-600 dark:text-emerald-400">CITIZEN PORTAL</span>
                    </>
                  ) : (
                    <>
                      MHA <span className="text-blue-700 dark:text-blue-400">CYBER INTEL</span>
                    </>
                  )}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    portalMode === 'victim'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  {portalMode === 'victim' ? 'CITIZEN' : 'OFFICIAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {portalMode === 'victim'
                  ? 'Victim Complaint & Fund Recovery System'
                  : 'Withdrawal Prediction & Hotspot Interception'}
              </p>
            </div>
          </div>

          {/* Center Mode Switcher Pill */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setPortalMode('officer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                portalMode === 'officer'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer Intelligence Portal</span>
            </button>

            <button
              onClick={() => setPortalMode('victim')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                portalMode === 'victim'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Victim / Citizen Portal</span>
            </button>
          </div>

          {/* Officer Navigation Tabs (visible only when in Officer mode and user logged in) */}
          {portalMode === 'officer' && user && (
            <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setActiveTab('complaint')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'complaint'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FilePlus className="w-4 h-4" />
                <span>New Complaint</span>
              </button>

              <button
                onClick={() => setActiveTab('predictions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'predictions'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Predictions</span>
              </button>

              <button
                onClick={() => setActiveTab('sih')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'sih'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>SIH Forecaster</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                  ML
                </span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-rose-600 dark:text-rose-400">Intel Map</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('historical')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'historical'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Dataset</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Tactical Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tactical Interception Alerts</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {unreadCount} unread
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No active threat alerts</p>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              onNotificationClick(notif);
                              setShowNotifDropdown(false);
                            }}
                            className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              notif.read
                                ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                : 'bg-blue-50 dark:bg-blue-950/50 text-slate-900 dark:text-white border-l-2 border-blue-600 font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-[11px] truncate">{notif.title}</span>
                              <span className="text-[9px] text-slate-400 shrink-0">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Officer Profile or Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                    {user.organization}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Officer Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase">Active Portal:</span>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setPortalMode('officer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              portalMode === 'officer'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Officer Intel
          </button>
          <button
            onClick={() => setPortalMode('victim')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              portalMode === 'victim'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Citizen / Victim
          </button>
        </div>
      </div>

      {/* Mobile Officer Sub-Navigation Bar */}
      {portalMode === 'officer' && user && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('complaint')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'complaint' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            New Complaint
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'predictions' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setActiveTab('sih')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'sih' ? 'bg-indigo-600 text-white' : 'text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>SIH Forecaster</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'map' ? 'bg-rose-600 text-white' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            Intel Map
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'historical' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Dataset
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Analytics
          </button>
        </div>
      )}
    </header>
  );
};
