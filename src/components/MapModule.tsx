import React, { useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Send,
  Navigation,
  Search,
  Filter,
  Layers,
  Flame,
  CheckCircle2,
  Clock,
  Building,
  Target,
  Maximize2,
  Minimize2,
  Info,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { Complaint, Prediction, PredictedZone, HistoricalCase } from '../types';

interface MapModuleProps {
  complaints: Complaint[];
  predictions: Prediction[];
  historicalCases?: HistoricalCase[];
  initialSelectedZone?: PredictedZone | null;
  onDispatchAlert: (data: {
    complaintId: string;
    zoneName: string;
    atmName?: string;
    policeStation?: string;
    urgency?: string;
  }) => Promise<void>;
}

export const MapModule: React.FC<MapModuleProps> = ({
  complaints,
  predictions,
  historicalCases = [],
  initialSelectedZone = null,
  onDispatchAlert
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPredictedZones, setShowPredictedZones] = useState(true);
  const [showAtmMarkers, setShowAtmMarkers] = useState(true);

  // Selected Zone for Detail Card
  const [selectedZone, setSelectedZone] = useState<{
    zone: PredictedZone;
    complaintId: string;
    complaint?: Complaint;
  } | null>(
    initialSelectedZone
      ? {
          zone: initialSelectedZone,
          complaintId: predictions.find((p) =>
            p.topPredictedZones.some((z) => z.zoneId === initialSelectedZone.zoneId)
          )?.complaintId || 'CC-ACTIVE',
          complaint: complaints[0]
        }
      : null
  );

  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  // Flatten all predicted zones with parent complaint info
  const allZones = useMemo(() => {
    const list: Array<{
      zone: PredictedZone;
      complaintId: string;
      complaint?: Complaint;
      riskScore: number;
    }> = [];

    predictions.forEach((pred) => {
      const parentComp = complaints.find((c) => c.complaintId === pred.complaintId);
      pred.topPredictedZones.forEach((zone) => {
        list.push({
          zone,
          complaintId: pred.complaintId,
          complaint: parentComp,
          riskScore: pred.riskScore
        });
      });
    });

    return list;
  }, [predictions, complaints]);

  // Filtered Zones
  const filteredZones = useMemo(() => {
    return allZones.filter(({ zone, complaintId, complaint }) => {
      if (selectedRiskFilter !== 'All' && zone.riskLevel !== selectedRiskFilter) return false;
      if (selectedState !== 'All' && zone.state !== selectedState) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchZone =
          zone.zoneName.toLowerCase().includes(q) ||
          zone.city.toLowerCase().includes(q) ||
          zone.representativeAtm.toLowerCase().includes(q);
        const matchComp = complaintId.toLowerCase().includes(q);
        if (!matchZone && !matchComp) return false;
      }
      return true;
    });
  }, [allZones, selectedRiskFilter, selectedState, searchQuery]);

  // Unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    allZones.forEach(({ zone }) => states.add(zone.state));
    return Array.from(states);
  }, [allZones]);

  // Handle Dispatch Alert
  const handleDispatch = async () => {
    if (!selectedZone) return;
    setDispatching(true);
    setDispatchStatus(null);
    try {
      await onDispatchAlert({
        complaintId: selectedZone.complaintId,
        zoneName: selectedZone.zone.zoneName,
        atmName: selectedZone.zone.representativeAtm,
        policeStation: `${selectedZone.zone.zoneName} Police Station`,
        urgency: selectedZone.zone.riskLevel === 'High' ? 'CRITICAL_INTERCEPT' : 'MONITORING_ALERT'
      });
      setDispatchStatus('Tactical patrol units and branch surveillance alerted successfully.');
      setTimeout(() => setDispatchStatus(null), 6000);
    } catch (err: any) {
      setDispatchStatus('Failed to dispatch alert: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  // Color helper based on risk level
  const getRiskColor = (level: 'High' | 'Medium' | 'Low') => {
    if (level === 'High') return { bg: 'bg-rose-600', text: 'text-rose-600', stroke: '#e11d48', fill: 'rgba(225, 29, 72, 0.25)' };
    if (level === 'Medium') return { bg: 'bg-amber-500', text: 'text-amber-600', stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.25)' };
    return { bg: 'bg-emerald-600', text: 'text-emerald-600', stroke: '#059669', fill: 'rgba(5, 150, 105, 0.25)' };
  };

  // Default center (Mumbai/Maharashtra epicenter)
  const defaultCenter = { lat: 19.076, lng: 72.8777 };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[800px]'
      }`}
    >
      {/* Top Map Control Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Predictive Cybercrime Cash-Out Surveillance Map</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                LIVE INTEL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Corridor density & withdrawal probability forecasting
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Zone, ATM, or Ref..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1">
            {(['All', 'High', 'Medium', 'Low'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRiskFilter(risk)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedRiskFilter === risk
                    ? risk === 'High'
                      ? 'bg-rose-600 text-white'
                      : risk === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : risk === 'Low'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <button
              onClick={() => setShowPredictedZones(!showPredictedZones)}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                showPredictedZones
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                  : 'text-slate-400'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>Zones ({filteredZones.length})</span>
            </button>
            <button
              onClick={() => setShowAtmMarkers(!showAtmMarkers)}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                showAtmMarkers
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-400'
              }`}
            >
              <Building className="w-3 h-3" />
              <span>ATMs</span>
            </button>
          </div>

          {/* Full-screen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-slate-100 dark:bg-slate-950 overflow-hidden flex">
        {/* Left Interactive Zone List Sidebar */}
        <div className="hidden md:flex flex-col w-72 lg:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-r border-slate-200 dark:border-slate-800 z-10 p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Forecasted Intercept Zones
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">{filteredZones.length} Active</span>
          </div>

          <div className="space-y-2">
            {filteredZones.map(({ zone, complaintId }) => {
              const isSelected = selectedZone?.zone.zoneId === zone.zoneId;
              const colors = getRiskColor(zone.riskLevel);
              return (
                <div
                  key={`${complaintId}-${zone.zoneId}`}
                  onClick={() =>
                    setSelectedZone({
                      zone,
                      complaintId,
                      complaint: complaints.find((c) => c.complaintId === complaintId)
                    })
                  }
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {zone.zoneName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        zone.riskLevel === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : zone.riskLevel === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {zone.probability}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>
                      {zone.city}, {zone.state}
                    </span>
                    <span className="font-mono text-[10px]">{complaintId}</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span className="truncate max-w-[130px]">{zone.representativeAtm}</span>
                    </span>
                    <span>{zone.estimatedTimeframe}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center / Right Map Area */}
        <div className="relative flex-1 h-full w-full">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={
                  selectedZone
                    ? { lat: selectedZone.zone.lat, lng: selectedZone.zone.lng }
                    : defaultCenter
                }
                defaultZoom={11}
                mapId="DEMO_MAP_ID"
                className="w-full h-full"
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {/* Render Predicted Zone Markers & ATM Markers */}
                {filteredZones.map(({ zone, complaintId }) => {
                  const colors = getRiskColor(zone.riskLevel);
                  const isSelected = selectedZone?.zone.zoneId === zone.zoneId;

                  return (
                    <React.Fragment key={zone.zoneId}>
                      {/* Zone Cluster Center Marker */}
                      {showPredictedZones && (
                        <AdvancedMarker
                          position={{ lat: zone.lat, lng: zone.lng }}
                          onClick={() =>
                            setSelectedZone({
                              zone,
                              complaintId,
                              complaint: complaints.find((c) => c.complaintId === complaintId)
                            })
                          }
                          title={`${zone.zoneName} (${zone.probability}% Risk)`}
                        >
                          <div className="relative flex items-center justify-center cursor-pointer group">
                            {/* Visual Risk Circle Radar */}
                            <div
                              className="absolute rounded-full animate-ping opacity-40 pointer-events-none"
                              style={{
                                width: isSelected ? '64px' : '44px',
                                height: isSelected ? '64px' : '44px',
                                backgroundColor: colors.stroke
                              }}
                            />
                            <div
                              className="relative px-2 py-1 rounded-full text-white font-extrabold text-[11px] shadow-lg flex items-center gap-1 border-2 border-white dark:border-slate-900 select-none"
                              style={{ backgroundColor: colors.stroke }}
                            >
                              <Target className="w-3 h-3" />
                              <span>{zone.probability}%</span>
                            </div>
                          </div>
                        </AdvancedMarker>
                      )}

                      {/* Representative ATM Marker slightly offset */}
                      {showAtmMarkers && (
                        <AdvancedMarker
                          position={{ lat: zone.lat + 0.005, lng: zone.lng + 0.004 }}
                          onClick={() =>
                            setSelectedZone({
                              zone,
                              complaintId,
                              complaint: complaints.find((c) => c.complaintId === complaintId)
                            })
                          }
                          title={zone.representativeAtm}
                        >
                          <Pin
                            background="#1e40af"
                            borderColor="#ffffff"
                            glyphColor="#ffffff"
                            scale={0.85}
                          />
                        </AdvancedMarker>
                      )}
                    </React.Fragment>
                  );
                })}
              </Map>
            </APIProvider>
          ) : (
            /* High-Precision Interactive Vector GIS Map Fallback */
            <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              {/* GIS Grid Network Canvas Representation */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

              {/* Geographic Indian Regional Nodes Simulation */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="highRiskGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#e11d48" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="medRiskGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#d97706" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Corridor linking lines */}
                <line x1="32%" y1="42%" x2="48%" y2="56%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="48%" y1="56%" x2="62%" y2="38%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="48%" y1="56%" x2="52%" y2="72%" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.8" />
              </svg>

              {/* Interactive Zone Pins in GIS space */}
              <div className="absolute inset-0 pointer-events-auto">
                {filteredZones.map(({ zone, complaintId }, idx) => {
                  // Coordinate project into responsive percentages
                  const positions = [
                    { top: '38%', left: '46%' },
                    { top: '48%', left: '54%' },
                    { top: '62%', left: '50%' },
                    { top: '32%', left: '60%' },
                    { top: '56%', left: '36%' },
                    { top: '72%', left: '58%' }
                  ];
                  const pos = positions[idx % positions.length];
                  const isSelected = selectedZone?.zone.zoneId === zone.zoneId;
                  const colors = getRiskColor(zone.riskLevel);

                  return (
                    <div
                      key={zone.zoneId}
                      style={{ top: pos.top, left: pos.left }}
                      onClick={() =>
                        setSelectedZone({
                          zone,
                          complaintId,
                          complaint: complaints.find((c) => c.complaintId === complaintId)
                        })
                      }
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    >
                      {/* Risk Radius Circle */}
                      <div
                        className={`rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'scale-110 ring-2 ring-white' : ''
                        }`}
                        style={{
                          width: zone.riskLevel === 'High' ? '96px' : '76px',
                          height: zone.riskLevel === 'High' ? '96px' : '76px',
                          background:
                            zone.riskLevel === 'High'
                              ? 'radial-gradient(circle, rgba(225, 29, 72, 0.4) 0%, rgba(225, 29, 72, 0) 75%)'
                              : 'radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, rgba(217, 119, 6, 0) 75%)'
                        }}
                      >
                        <div
                          className="px-2.5 py-1 rounded-full text-white font-black text-xs shadow-xl flex items-center gap-1 border border-white"
                          style={{ backgroundColor: colors.stroke }}
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>{zone.zoneName}</span>
                          <span className="bg-black/30 px-1 rounded text-[10px]">
                            {zone.probability}%
                          </span>
                        </div>
                      </div>

                      {/* Floating Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md border border-slate-700 pointer-events-none">
                        {zone.representativeAtm} &bull; {zone.estimatedTimeframe}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vector Notice watermark */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MHA GIS Intercept Engine &bull; Indian Metropolitan Withdrawal Corridors</span>
              </div>
            </div>
          )}

          {/* Details Card for Selected Zone (Required by user specs) */}
          {selectedZone && (
            <div className="absolute top-4 right-4 max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-30 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {selectedZone.zone.zoneName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        selectedZone.zone.riskLevel === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : selectedZone.zone.riskLevel === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {selectedZone.zone.probability}% Probability
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedZone.zone.city}, {selectedZone.zone.state} &bull; Case Ref:{' '}
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {selectedZone.complaintId}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base font-bold p-1"
                >
                  &times;
                </button>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Representative ATM</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedZone.zone.representativeAtm}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Cash-Out Timeframe</div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{selectedZone.zone.estimatedTimeframe}</span>
                  </div>
                </div>
              </div>

              {/* AI Explanation (User requirement) */}
              <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs mb-3">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Cluster & Geolocation Rationale</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedZone.zone.aiExplanation}
                </p>
              </div>

              {/* Linked Historical Cases Table (User requirement) */}
              <div className="mb-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Linked Historical Cases ({selectedZone.zone.linkedHistoricalCases.length})</span>
                  <span className="text-[10px] text-slate-400">Past Syndicate Operations</span>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {selectedZone.zone.linkedHistoricalCases.map((hc) => (
                    <div
                      key={hc.caseId}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          <span className="font-mono">{hc.caseId}</span> &bull; {hc.fraudType}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {hc.withdrawalLocation} &bull; {hc.bank}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          ₹{hc.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[9px] text-slate-400">{hc.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patrol Dispatch Alert Result */}
              {dispatchStatus && (
                <div className="p-2 mb-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{dispatchStatus}</span>
                </div>
              )}

              {/* Action Button: Dispatch Patrol */}
              <button
                type="button"
                onClick={handleDispatch}
                disabled={dispatching}
                className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {dispatching
                    ? 'Transmitting Alert to Police Station...'
                    : `Dispatch Tactical Patrol: ${selectedZone.zone.zoneName}`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
