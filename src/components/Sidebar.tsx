import React from 'react';
import {
  Compass,
  FilePlus,
  MapPin,
  FileText,
  Database,
  BarChart3,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  highRiskCount?: number;
  unassignedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  highRiskCount = 0,
  unassignedCount = 0
}) => {
  const menuGroups = [
    {
      group: 'TACTICAL INTELLIGENCE',
      items: [
        {
          id: 'predictions',
          label: 'Prediction Forecaster',
          shortLabel: 'Predictions',
          icon: Compass,
          description: 'AI Corridor & ATM Clusters',
          badge: 'Live AI',
          badgeColor: 'bg-blue-100 text-[#1e3a8a]'
        },
        {
          id: 'map',
          label: 'Intel Hotspot Map',
          shortLabel: 'Intel Map',
          icon: MapPin,
          description: 'Geospatial Withdrawal Nodes',
          badge: 'GIS',
          badgeColor: 'bg-rose-100 text-rose-700',
          highlightIcon: 'text-rose-500'
        },
        {
          id: 'complaint',
          label: 'Register New Docket',
          shortLabel: 'New Docket',
          icon: FilePlus,
          description: 'Case Intake & FIR Generation'
        }
      ]
    },
    {
      group: 'EVIDENCE & OPERATIONS',
      items: [
        {
          id: 'reports',
          label: 'Intelligence Reports',
          shortLabel: 'Reports',
          icon: FileText,
          description: 'Case Dossiers & Audit Trails'
        },
        {
          id: 'historical',
          label: 'Corpus & Historical Cases',
          shortLabel: 'Dataset',
          icon: Database,
          description: '10,000+ Case Training Logs'
        },
        {
          id: 'analytics',
          label: 'Surveillance Analytics',
          shortLabel: 'Analytics',
          icon: BarChart3,
          description: 'Financial Recovery & Yields'
        }
      ]
    }
  ];

  return (
    <aside className="w-68 shrink-0 hidden lg:block select-none">
      <div className="sticky top-22 glass-card p-4 shadow-xl shadow-slate-200/50 space-y-6 transition-all duration-300">
        {/* Officer Status Card */}
        {user && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-blue-900/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>On Duty &bull; Active</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Security Level:</span>
              <span className="font-extrabold text-slate-800 uppercase">
                Tier-1 Classified
              </span>
            </div>
          </div>
        )}

        {/* Menu Navigation Groups */}
        <div className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.group}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-blue-900/20 font-bold'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1e3a8a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:text-[#1e3a8a]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${item.highlightIcon && !isActive ? item.highlightIcon : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-tight truncate">
                            {item.shortLabel}
                          </div>
                          <div
                            className={`text-[10px] truncate leading-tight mt-0.5 ${
                              isActive
                                ? 'text-blue-100 font-medium'
                                : 'text-slate-400 group-hover:text-slate-500'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1 shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live Threat Corridor Telemetry Box */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>I4C Telemetry</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              Online
            </span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            AI Corridor prediction model active with continuous multi-bank lien synchronization.
          </p>

          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Latency: 24ms</span>
            <span>v3.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
