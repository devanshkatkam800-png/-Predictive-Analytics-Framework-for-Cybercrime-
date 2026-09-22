import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  FilePlus,
  Compass,
  MapPin,
  FileText,
  Database,
  BarChart3,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Lock,
  Building,
  BadgeCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, AppNotification } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
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
  portalMode,
  setPortalMode
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'predictions', label: 'Predictions', icon: Compass, badge: 'AI' },
    { id: 'complaint', label: 'New Docket', icon: FilePlus },
    { id: 'map', label: 'Intel Map', icon: MapPin, highlight: true },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'historical', label: 'Dataset', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/92 backdrop-blur-xl border-b border-slate-200/90 shadow-sm shadow-slate-200/50">
      {/* 1. Official Government Header Strip */}
      <div className="bg-[#1e3a8a] text-white px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] tracking-wide font-medium">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-widest text-[10px] text-white/95">
              GOVERNMENT OF INDIA
            </span>
          </div>
          <span className="text-white/40 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-blue-100 font-semibold tracking-wider uppercase text-[10px]">
            {portalMode === 'victim'
              ? 'National Cyber Crime Reporting Portal (NCRP) • Citizen Help: 1930'
              : 'Ministry of Home Affairs (MHA) • Indian Cybercrime Coordination Centre (I4C)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-blue-200">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Encrypted Inter-Agency Link (256-bit AES)</span>
          </div>

          {portalMode === 'officer' && !user && (
            <button
              onClick={onOpenAuth}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 cursor-pointer transition-colors"
            >
              Officer Portal Sign In &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo & Government Emblem */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
            onClick={() => {
              if (portalMode === 'officer') setActiveTab('predictions');
            }}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transition-all duration-300 ${
                portalMode === 'victim'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/25 group-hover:scale-105'
                  : 'bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] shadow-blue-900/25 group-hover:scale-105'
              }`}
            >
              <Shield className="w-6 h-6 text-white drop-shadow-sm" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  {portalMode === 'victim' ? (
                    <>
                      NCRP <span className="text-[#10b981]">CITIZEN PORTAL</span>
                    </>
                  ) : (
                    <>
                      MHA <span className="text-[#1e3a8a]">CYBER INTEL</span>
                    </>
                  )}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    portalMode === 'victim'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-[#1e3a8a] border-blue-200'
                  }`}
                >
                  {portalMode === 'victim' ? 'CITIZEN' : 'OFFICIAL'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                {portalMode === 'victim'
                  ? 'Citizen Fraud Redressal & Fund Recovery System'
                  : 'Predictive Cash-Out Interception & Investigation Platform'}
              </p>
            </div>
          </div>

          {/* Center Mode Switcher Pill */}
          <div className="hidden lg:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-xs shrink-0">
            <button
              onClick={() => setPortalMode('officer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                portalMode === 'officer'
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer Intelligence</span>
            </button>

            <button
              onClick={() => setPortalMode('victim')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                portalMode === 'victim'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Victim / Citizen</span>
            </button>
          </div>

          {/* Officer Navigation Tabs with Royal Blue Gradient Active Highlight */}
          {portalMode === 'officer' && user && (
            <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20 font-bold'
                        : 'text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-100/90'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-[#ef4444]'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-[#1e3a8a]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Tools: Notifications, User Profile, Sign In */}
          <div className="flex items-center gap-3">
            {/* Tactical Notifications Bell & Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    showNotifDropdown
                      ? 'bg-blue-50 text-[#1e3a8a] border-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 border-slate-200/90'
                  }`}
                  title="Tactical Interception Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ef4444] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-84 sm:w-96 glass-card p-4 z-50 shadow-2xl border border-slate-200/90 bg-white/95"
                    >
                      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-50 text-[#f59e0b] border border-amber-200">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              Tactical Intelligence Alerts
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Real-time cash withdrawal corridor alerts
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a8a] text-white">
                          {unreadCount} Unread
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No active threat alerts in queue
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                onNotificationClick(notif);
                                setShowNotifDropdown(false);
                              }}
                              className={`p-3 rounded-xl text-xs cursor-pointer transition-all border ${
                                notif.read
                                  ? 'bg-slate-50/70 text-slate-600 border-slate-100 hover:bg-slate-100'
                                  : 'bg-blue-50/80 text-slate-900 border-blue-200 font-medium hover:bg-blue-100/80 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs truncate text-[#1e3a8a]">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Officer Profile Dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100 transition-all cursor-pointer shadow-xs bg-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                      {user.badgeNumber || 'Officer in Charge'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-72 glass-card p-4 z-50 shadow-2xl border border-slate-200/90 bg-white/95"
                    >
                      {/* Officer Identity Card */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-sm shadow-md">
                            <BadgeCheck className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">
                              {user.role === 'admin' ? 'Command Administrator' : 'Investigating Officer'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Badge: {user.badgeNumber || 'MHA-CYB-8841'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                          {user.organization}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs font-medium">
                        <button
                          onClick={() => {
                            setPortalMode('victim');
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Switch to Citizen Portal</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <button
                          onClick={() => {
                            onLogout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg text-[#ef4444] hover:bg-rose-50 transition-colors font-bold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Secure Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-900/20 cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Officer Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mobile Responsive Navigation Pill Bar */}
      <div className="lg:hidden border-t border-slate-200/90 bg-slate-50/95 px-3 py-2 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setPortalMode('officer')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              portalMode === 'officer'
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Officer Intel
          </button>
          <button
            onClick={() => setPortalMode('victim')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              portalMode === 'victim'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Citizen Redressal
          </button>
        </div>

        {portalMode === 'officer' && user && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#1e3a8a] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
