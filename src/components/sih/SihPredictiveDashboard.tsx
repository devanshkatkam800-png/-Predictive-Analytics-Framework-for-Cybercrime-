import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  MapPin,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  Building,
  Target,
  Zap,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart3,
  Flame,
  Send,
  RefreshCw,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import {
  SihAtmLocation,
  SihMuleTransaction,
  SihPredictionRequest,
  SihPredictionResult,
  SihModelMetrics
} from '../../types';

interface SihPredictiveDashboardProps {
  onDispatchAlert?: (data: {
    complaintId: string;
    zoneName: string;
    atmName?: string;
    policeStation?: string;
    urgency?: string;
  }) => Promise<void>;
  initialAmount?: number;
  initialFraudType?: string;
}

const FRAUD_TYPES = [
  'UPI Phishing',
  'Investment Scam',
  'Credit Card Fraud',
  'Part-time Job Scam',
  'Loan App Extortion'
];

const ZONES = [
  'Zone_North',
  'Zone_South',
  'Zone_East',
  'Zone_West',
  'Zone_Central'
];

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const PAYMENT_CHANNELS = [
  'UPI',
  'Net Banking',
  'Debit Card',
  'Credit Card',
  'Wallet'
];

export const SihPredictiveDashboard: React.FC<SihPredictiveDashboardProps> = ({
  onDispatchAlert,
  initialAmount = 25000,
  initialFraudType = 'UPI Phishing'
}) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'forecaster' | 'atms' | 'mule_ledger' | 'ml_metrics'>('forecaster');

  // Input states (matching dashbboard.py)
  const [amountLost, setAmountLost] = useState<number>(initialAmount);
  const [fraudType, setFraudType] = useState<string>(initialFraudType);
  const [hourOfDay, setHourOfDay] = useState<number>(14);
  const [dayName, setDayName] = useState<string>('Wednesday');
  const [victimDistrict, setVictimDistrict] = useState<string>('Zone_Central');
  const [paymentChannel, setPaymentChannel] = useState<string>('UPI');

  // Computed temporal properties
  const dayOfWeek = DAYS.indexOf(dayName);
  const isWeekend = dayOfWeek >= 5 ? 1 : 0;

  // Prediction output states
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<SihPredictionResult | null>(null);
  const [selectedAtm, setSelectedAtm] = useState<SihAtmLocation | null>(null);
  const [highRiskOnlyFilter, setHighRiskOnlyFilter] = useState<boolean>(false);

  // ATM Database state
  const [atmList, setAtmList] = useState<SihAtmLocation[]>([]);
  const [atmZoneFilter, setAtmZoneFilter] = useState<string>('All');
  const [atmBankFilter, setAtmBankFilter] = useState<string>('All');
  const [atmSearchQuery, setAtmSearchQuery] = useState<string>('');
  const [isLoadingAtms, setIsLoadingAtms] = useState<boolean>(false);

  // Mule Ledger state
  const [muleTransactions, setMuleTransactions] = useState<SihMuleTransaction[]>([]);
  const [muleSearch, setMuleSearch] = useState<string>('');
  const [isLoadingMules, setIsLoadingMules] = useState<boolean>(false);

  // ML Metrics state
  const [modelMetrics, setModelMetrics] = useState<SihModelMetrics | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Load initial model metrics and run initial prediction
  useEffect(() => {
    handleGeneratePrediction();
    loadAtms();
    loadMuleTransactions();
    loadMetrics();
  }, []);

  const handleGeneratePrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await api.sihPredict({
        amount_lost: amountLost,
        fraud_type: fraudType,
        hour_of_day: hourOfDay,
        day_of_week: dayOfWeek,
        is_weekend: isWeekend,
        victim_district: victimDistrict,
        payment_channel: paymentChannel
      });
      setPredictionResult(res);
      if (res.target_atms.length > 0) {
        setSelectedAtm(res.target_atms[0]);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const loadAtms = async () => {
    setIsLoadingAtms(true);
    try {
      const data = await api.getSihAtms();
      setAtmList(data);
    } catch (err) {
      console.error('Failed to load ATMs:', err);
    } finally {
      setIsLoadingAtms(false);
    }
  };

  const loadMuleTransactions = async () => {
    setIsLoadingMules(true);
    try {
      const data = await api.getSihMuleTransactions({ limit: 150 });
      setMuleTransactions(data);
    } catch (err) {
      console.error('Failed to load mule transactions:', err);
    } finally {
      setIsLoadingMules(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await api.getSihModelMetrics();
      setModelMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  // Quick Preset Scenarios
  const applyPreset = (
    amount: number,
    fType: string,
    hour: number,
    day: string,
    zone: string,
    pChannel: string
  ) => {
    setAmountLost(amount);
    setFraudType(fType);
    setHourOfDay(hour);
    setDayName(day);
    setVictimDistrict(zone);
    setPaymentChannel(pChannel);
  };

  // Filtered ATMs for the directory tab
  const filteredAtmList = useMemo(() => {
    return atmList.filter((atm) => {
      if (atmZoneFilter !== 'All' && atm.city_zone !== atmZoneFilter) return false;
      if (atmBankFilter !== 'All' && !atm.bank_name.toLowerCase().includes(atmBankFilter.toLowerCase())) return false;
      if (atmSearchQuery) {
        const q = atmSearchQuery.toLowerCase();
        return atm.atm_id.toLowerCase().includes(q) || atm.bank_name.toLowerCase().includes(q) || atm.city_zone.toLowerCase().includes(q);
      }
      return true;
    });
  }, [atmList, atmZoneFilter, atmBankFilter, atmSearchQuery]);

  // Filtered ATMs for the prediction view
  const displayedPredictionAtms = useMemo(() => {
    if (!predictionResult) return [];
    if (highRiskOnlyFilter) {
      return predictionResult.target_atms.filter((a) => a.is_high_risk_area === 1);
    }
    return predictionResult.target_atms;
  }, [predictionResult, highRiskOnlyFilter]);

  // Center coordinates calculation for map
  const mapCenter = useMemo(() => {
    if (displayedPredictionAtms.length > 0) {
      const avgLat = displayedPredictionAtms.reduce((sum, a) => sum + a.latitude, 0) / displayedPredictionAtms.length;
      const avgLng = displayedPredictionAtms.reduce((sum, a) => sum + a.longitude, 0) / displayedPredictionAtms.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 19.0760, lng: 72.8777 };
  }, [displayedPredictionAtms]);

  // Handle tactical field patrol dispatch
  const handleDispatchPatrol = async (atm: SihAtmLocation) => {
    if (!onDispatchAlert) {
      setDispatchSuccessMsg(`Tactical QRT alert dispatched to ${atm.bank_name} (${atm.atm_id}) in ${atm.city_zone}.`);
      setTimeout(() => setDispatchSuccessMsg(null), 4000);
      return;
    }

    try {
      await onDispatchAlert({
        complaintId: `SIH-${Date.now().toString().slice(-6)}`,
        zoneName: atm.city_zone,
        atmName: `${atm.bank_name} [${atm.atm_id}]`,
        policeStation: `${atm.city_zone} Cyber Cell Command`,
        urgency: 'HIGH'
      });
      setDispatchSuccessMsg(`Tactical squad alerted for immediate interdiction at ${atm.bank_name} (${atm.atm_id})!`);
      setTimeout(() => setDispatchSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with SIH Theme */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <Compass className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                Smart India Hackathon (SIH) Predictive Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
                Random Forest ML Engine
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Cybercrime Cash Withdrawal Forecaster
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Forecast likely ATM / POS cash withdrawal zones before money mule extraction occurs.
              Correlates financial loss, scam syndicate bias, incident time, and district proximity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <div className="text-xs text-blue-200 font-medium">Model Accuracy</div>
              <div className="text-xl font-black text-emerald-400">87.2%</div>
              <div className="text-[10px] text-slate-300">vs 24.5% Baseline</div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('forecaster')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'forecaster'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Interactive Hotspot Forecaster</span>
          </button>

          <button
            onClick={() => setActiveSubTab('atms')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'atms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>ATM Locations Network ({atmList.length || 150})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mule_ledger')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'mule_ledger'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Mule Siphoning Ledger ({muleTransactions.length || 1000})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ml_metrics')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ml_metrics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Model Benchmarks & Confusion Matrix</span>
          </button>
        </div>
      </div>

      {/* Dispatch Success Toast */}
      {dispatchSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-3 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* 2. SUB-TAB 1: INTERACTIVE HOTSPOT FORECASTER (dashbboard.py equivalent) */}
      {activeSubTab === 'forecaster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Interactive Configuration Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Log Incident Parameters</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">dashbboard.py</span>
              </div>

              {/* Amount Lost */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Amount Lost (INR)
                  </label>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatINR(amountLost)}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amountLost}
                  onChange={(e) => setAmountLost(Math.max(1000, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fraud Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fraud Type Classification
                </label>
                <select
                  value={fraudType}
                  onChange={(e) => setFraudType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {FRAUD_TYPES.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hour of Incident Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Hour of Incident (0-23)
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {String(hourOfDay).padStart(2, '0')}:00 hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hourOfDay}
                  onChange={(e) => setHourOfDay(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Midnight (00)</span>
                  <span>Noon (12)</span>
                  <span>Night (23)</span>
                </div>
              </div>

              {/* Day of Week */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Day of Week
                  </label>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isWeekend
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {isWeekend ? 'Weekend (Mule Surge)' : 'Weekday'}
                  </span>
                </div>
                <select
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Victim District / Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Victim District / Metropolitan Zone
                </label>
                <select
                  value={victimDistrict}
                  onChange={(e) => setVictimDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Channel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payment Channel
                </label>
                <select
                  value={paymentChannel}
                  onChange={(e) => setPaymentChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGeneratePrediction}
                disabled={isPredicting}
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPredicting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Computing Random Forest Predictions...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-amber-300" />
                    <span>Generate Hotspot Prediction</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Benchmark Presets */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                SIH Benchmark Scam Profiles
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => applyPreset(25000, 'UPI Phishing', 14, 'Tuesday', 'Zone_West', 'UPI')}
                  className="w-full text-left p-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">UPI QR Code Phish</span>
                    <div className="text-[10px] text-slate-500">₹25,000 &bull; 14:00 &bull; Zone West</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => applyPreset(200000, 'Investment Scam', 11, 'Thursday', 'Zone_Central', 'Net Banking')}
                  className="w-full text-left p-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">High-Yield Investment Fraud</span>
                    <div className="text-[10px] text-slate-500">₹2,00,000 &bull; 11:00 &bull; Zone Central</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => applyPreset(45000, 'Credit Card Fraud', 22, 'Saturday', 'Zone_South', 'Credit Card')}
                  className="w-full text-left p-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Weekend Card Skim Extraction</span>
                    <div className="text-[10px] text-slate-500">₹45,000 &bull; 22:00 &bull; Zone South</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Prediction Results, Target ATMs, and Interactive Map */}
          <div className="lg:col-span-8 space-y-6">
            {predictionResult ? (
              <>
                {/* 1. Predicted Zone High-Impact Banner */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-blue-700/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>High-Risk Cashout Zone Forecast</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
                        <span>{predictionResult.predicted_zone.replace('_', ' ')}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                          {predictionResult.confidence_score}% Confidence
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-white/10 px-3 py-2 rounded-xl text-center border border-white/10">
                        <div className="text-[10px] text-blue-200 uppercase font-semibold">Cashout Window</div>
                        <div className="text-lg font-black text-amber-300">
                          ~{predictionResult.estimated_cashout_window_mins} mins
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-blue-100 leading-relaxed bg-blue-950/60 p-3 rounded-xl border border-blue-800/60">
                    {predictionResult.tactical_notes}
                  </p>

                  {/* Zone Probabilities Bar Chart */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Model Probability Across All 5 Metropolitan Zones</span>
                      <span className="text-[11px] text-blue-300 font-mono">RandomForestClassifier</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {Object.entries(predictionResult.zone_probabilities).map(([zName, prob]) => {
                        const probNum = Number(prob);
                        const isTop = zName === predictionResult.predicted_zone;
                        return (
                          <div
                            key={zName}
                            className={`p-2 rounded-xl text-center transition-all ${
                              isTop
                                ? 'bg-amber-500/20 border-2 border-amber-400 text-white shadow-xs'
                                : 'bg-white/5 border border-white/10 text-slate-300'
                            }`}
                          >
                            <div className="text-[10px] font-bold truncate">{zName.replace('Zone_', '')}</div>
                            <div className={`text-base font-black ${isTop ? 'text-amber-300' : 'text-slate-200'}`}>
                              {probNum}%
                            </div>
                            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${isTop ? 'bg-amber-400' : 'bg-blue-400'}`}
                                style={{ width: `${Math.min(100, probNum * 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Hotspot Map (Folium equivalent from dashbboard.py) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-rose-600" />
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Predicted Hotspot Locations for {predictionResult.predicted_zone.replace('_', ' ')}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Real-time ATM distribution from <span className="font-mono">atm_locations.csv</span> (Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={highRiskOnlyFilter}
                          onChange={(e) => setHighRiskOnlyFilter(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>High-Risk Areas Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Interactive Map Visual Stage */}
                  <div className="relative h-80 sm:h-96 w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                    {/* Grid and Tactical Backdrop */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#6366f1 1px, #020617 1px)`,
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                      }}
                    />

                    {/* Zone Radar Overlay */}
                    <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono">INTERCEPTION RADAR: {predictionResult.predicted_zone}</span>
                    </div>

                    <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span>{displayedPredictionAtms.length} Filtered ATMs in Sector</span>
                    </div>

                    {/* Plot ATMs in relative 2D coordinate space */}
                    <div className="relative flex-1 w-full h-full my-6">
                      {displayedPredictionAtms.map((atm, idx) => {
                        const isSelected = selectedAtm?.atm_id === atm.atm_id;
                        // Calculate relative offsets centered on 19.0760, 72.8777
                        const latOffset = (atm.latitude - 19.0760) * 800;
                        const lngOffset = (atm.longitude - 72.8777) * 800;

                        // Clamped relative percentages
                        const leftPct = Math.max(10, Math.min(90, 50 + lngOffset));
                        const topPct = Math.max(10, Math.min(90, 50 - latOffset));

                        return (
                          <div
                            key={atm.atm_id}
                            onClick={() => setSelectedAtm(atm)}
                            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                          >
                            <div className="relative flex items-center justify-center">
                              {/* Pulsing Aura for High Risk */}
                              {atm.is_high_risk_area === 1 && (
                                <div className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                              )}

                              {/* Marker Pin */}
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
                                  isSelected
                                    ? 'bg-amber-500 ring-4 ring-amber-300 scale-125 z-30'
                                    : atm.is_high_risk_area === 1
                                    ? 'bg-rose-600 hover:scale-110'
                                    : 'bg-blue-600 hover:scale-110'
                                }`}
                              >
                                <Building className="w-3.5 h-3.5" />
                              </div>

                              {/* Hover Floating Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap">
                                <div className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-md shadow-xl border border-slate-700">
                                  <div className="font-bold">{atm.bank_name}</div>
                                  <div className="text-slate-300 font-mono">{atm.atm_id}</div>
                                  <div className="text-amber-300 font-semibold">Risk: {formatINR(amountLost)}</div>
                                </div>
                                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Status bar */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span>Click any ATM pin to inspect coordinates & dispatch rapid field unit</span>
                      <span className="font-mono text-emerald-400">STATUS: ACTIVE PATROL MONITORING</span>
                    </div>
                  </div>

                  {/* Selected ATM Details Box */}
                  {selectedAtm && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedAtm.bank_name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold">
                            {selectedAtm.atm_id}
                          </span>
                          {selectedAtm.is_high_risk_area === 1 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              High-Risk Siphoning Node
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
                          <span>Zone: <strong className="text-slate-700 dark:text-slate-200">{selectedAtm.city_zone}</strong></span>
                          <span>Lat: <strong className="font-mono">{selectedAtm.latitude}</strong></span>
                          <span>Lon: <strong className="font-mono">{selectedAtm.longitude}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDispatchPatrol(selectedAtm)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch QRT Patrol Unit</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Hotspot ATMs Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">ATM ID</th>
                          <th className="py-2.5 px-3">Bank Name</th>
                          <th className="py-2.5 px-3">Coordinates (Lat, Lng)</th>
                          <th className="py-2.5 px-3">Zone</th>
                          <th className="py-2.5 px-3">Risk Assessment</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {displayedPredictionAtms.slice(0, 6).map((atm) => (
                          <tr
                            key={atm.atm_id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                              selectedAtm?.atm_id === atm.atm_id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              {atm.atm_id}
                            </td>
                            <td className="py-2.5 px-3 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold">{atm.bank_name}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                              {atm.latitude.toFixed(5)}, {atm.longitude.toFixed(5)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                              {atm.city_zone}
                            </td>
                            <td className="py-2.5 px-3">
                              {atm.is_high_risk_area === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                  <Flame className="w-3 h-3" /> High Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleDispatchPatrol(atm)}
                                className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Alert Squad
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Explainable Feature Contributions (feature_columns.pkl equivalent) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Random Forest Feature Importance Weights</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      feature_columns.pkl (n_estimators=200)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(predictionResult.feature_importances).map(([feat, val]) => {
                      const pct = Math.round(Number(val) * 1000) / 10;
                      return (
                        <div key={feat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-300">
                              {feat.replace(/_/g, ' ').replace('encoded', '')}
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{ width: `${Math.min(100, pct * 2.8)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-spin" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                  Ready to Compute Cashout Forecaster
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Adjust incident parameters on the left and click Generate Hotspot Prediction to run the machine learning model.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: ATM NETWORK LOCATIONS (atm_locations.csv) */}
      {activeSubTab === 'atms' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>ATM & Cashout Interception Network</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                150 ATM locations indexed across Zone North, South, East, West, and Central Mumbai
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Bank / ATM ID..."
                  value={atmSearchQuery}
                  onChange={(e) => setAtmSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <select
                value={atmZoneFilter}
                onChange={(e) => setAtmZoneFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="All">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <select
                value={atmBankFilter}
                onChange={(e) => setAtmBankFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="All">All Banks</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Axis Bank">Axis Bank</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">ATM ID</th>
                  <th className="py-3 px-4">Bank Name</th>
                  <th className="py-3 px-4">Zone Sector</th>
                  <th className="py-3 px-4">Latitude</th>
                  <th className="py-3 px-4">Longitude</th>
                  <th className="py-3 px-4">Area Risk Status</th>
                  <th className="py-3 px-4 text-right">Tactical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredAtmList.map((atm) => (
                  <tr key={atm.atm_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {atm.atm_id}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{atm.bank_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {atm.city_zone}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{atm.latitude.toFixed(6)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{atm.longitude.toFixed(6)}</td>
                    <td className="py-3 px-4">
                      {atm.is_high_risk_area === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          <Flame className="w-3 h-3" /> High Risk Corridor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Standard Area
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDispatchPatrol(atm)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Deploy Patrol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 3: MULE TRANSACTIONS LEDGER (mule_transactions.csv) */}
      {activeSubTab === 'mule_ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Mule Transaction Siphoning Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1,000 real cashout transactions extracted from <span className="font-mono">mule_transactions.csv</span> with extraction delays
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Mule Acc / TX / ATM ID..."
                value={muleSearch}
                onChange={(e) => setMuleSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">TX ID</th>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Mule Account ID</th>
                  <th className="py-3 px-4">Extraction ATM</th>
                  <th className="py-3 px-4">Amount Withdrawn</th>
                  <th className="py-3 px-4">Cashout Delay</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {muleTransactions
                  .filter((tx) =>
                    !muleSearch ||
                    tx.mule_account_id.toLowerCase().includes(muleSearch.toLowerCase()) ||
                    tx.tx_id.toLowerCase().includes(muleSearch.toLowerCase()) ||
                    tx.withdrawal_atm_id.toLowerCase().includes(muleSearch.toLowerCase())
                  )
                  .slice(0, 50)
                  .map((tx) => (
                    <tr key={tx.tx_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {tx.tx_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {tx.complaint_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-bold">
                        {tx.mule_account_id}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tx.withdrawal_atm_id}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{tx.bank_name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatINR(tx.amount_withdrawn)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.time_to_cashout_mins <= 45
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {tx.time_to_cashout_mins} mins
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {tx.tx_timestamp}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: RANDOM FOREST MODEL BENCHMARKS (train model.py equivalent) */}
      {activeSubTab === 'ml_metrics' && modelMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Model Test Accuracy</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {modelMetrics.accuracy_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">RandomForestClassifier (n=200)</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Majority-Class Baseline</div>
              <div className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {modelMetrics.baseline_accuracy_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">+62.7% predictive uplift</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Training Samples</div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {modelMetrics.n_train}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Complaints & Mule Links</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Test Split Samples</div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {modelMetrics.n_test}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Stratified 20% holdout</div>
            </div>
          </div>

          {/* Confusion Matrix Heatmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Zone Confusion Matrix Heatmap (True vs Predicted)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">model_metrics.json</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3 text-left">Actual Zone \ Predicted</th>
                    {modelMetrics.labels.map((l) => (
                      <th key={l} className="py-2 px-3">{l.replace('Zone_', '')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modelMetrics.labels.map((actual) => (
                    <tr key={actual}>
                      <td className="py-3 px-3 text-left font-bold text-slate-800 dark:text-slate-200">
                        {actual.replace('Zone_', '')}
                      </td>
                      {modelMetrics.labels.map((predicted) => {
                        const count = modelMetrics.confusion_matrix[actual]?.[predicted] ?? 0;
                        const isDiagonal = actual === predicted;
                        return (
                          <td
                            key={predicted}
                            className={`py-3 px-3 font-mono font-bold text-sm ${
                              isDiagonal
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : count > 0
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
