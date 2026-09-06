import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Lock,
  UserCheck,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Filter
} from 'lucide-react';
import { VictimNotification } from '../../types';
import { victimApi } from '../../services/api';

interface VictimNotificationsCenterProps {
  notifications: VictimNotification[];
  onNotificationClick: (notif: VictimNotification) => void;
  onRefresh: () => void;
}

export const VictimNotificationsCenter: React.FC<VictimNotificationsCenterProps> = ({
  notifications,
  onNotificationClick,
  onRefresh
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filterUnreadOnly ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = async () => {
    try {
      await victimApi.markAllNotificationsAsRead();
      onRefresh();
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Bank Freeze Sent':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
        );
      case 'Officer Assigned':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case 'Evidence Verified':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'Recovery Progress':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Live Case Milestone Dispatch
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Notification & Alert Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant alerts regarding bank lien freezes, officer assignments, forensic evidence review, and recovery status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterUnreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => onNotificationClick(n)}
                className={`py-4 px-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  n.read
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    : 'bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-900 dark:text-white border-l-4 border-blue-600 font-medium'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {getNotificationIcon(n.type)}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {n.type}
                      </span>
                      {n.complaintId && (
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {n.complaintId}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">&bull;</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-blue-600 font-bold">
                  <span>View Case</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center space-y-3">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No Notifications Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up. Any updates to your complaint or bank lien status will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
