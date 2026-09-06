import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { PieChart as PieIcon, MapPin, TrendingUp, Layers } from 'lucide-react';
import { DashboardStats } from '../types';

interface AnalyticsSectionProps {
  stats: DashboardStats | null;
}

const COLORS = ['#1d4ed8', '#0284c7', '#d97706', '#e11d48', '#059669', '#7c3aed', '#db2777'];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Compiling cybercrime predictive intelligence statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            MHA CYBER THREAT ANALYTICS
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Official Strategic Indicators
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Cybercrime Intelligence Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Empirical breakdown of scam typologies, geographic cash withdrawal hotspots, and historical complaint trends informing predictive model priors.
        </p>
      </div>

      {/* Section 1: Fraud Type Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <span>1. Fraud Type Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of registered cybercrime incidents across fraud categories
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Total Cases: {stats.totalComplaints}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.fraudTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {stats.fraudTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} incidents`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-6 space-y-2">
            {stats.fraudTypeDistribution.map((item, idx) => {
              const pct = Math.round((item.count / (stats.totalComplaints || 1)) * 100);
              return (
                <div
                  key={item.name}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count} cases
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Withdrawal Hotspots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>2. High-Risk Withdrawal Hotspots & ATM Corridors</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked geographic clusters by cash withdrawal volume and incident density
            </p>
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
            {stats.withdrawalHotspots.length} Identified Hotspots
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Bar Chart */}
          <div className="lg:col-span-7 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.withdrawalHotspots}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} />
                <YAxis dataKey="clusterName" type="category" width={110} fontSize={10} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cash Siphoned']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="totalAmountWithdrawn" fill="#e11d48" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Hotspots List */}
          <div className="lg:col-span-5 space-y-2">
            {stats.withdrawalHotspots.map((spot, idx) => (
              <div
                key={spot.clusterName}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{spot.clusterName}</span>
                  </div>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    ₹{(spot.totalAmountWithdrawn / 100000).toFixed(1)}L
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{spot.city}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {spot.incidentCount} Recorded Cash-Outs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Historical Fraud Trends */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>3. Historical Fraud Trends (Month-over-Month)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trajectory of incident volumes and cumulative financial loss
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.historicalFraudTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis yAxisId="left" fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} tickFormatter={(val) => `${val} cases`} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  name === 'amount' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} cases`,
                  name === 'amount' ? 'Financial Loss' : 'Incident Count'
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                name="amount"
                stroke="#1d4ed8"
                fillOpacity={1}
                fill="url(#colorLoss)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
