import React, { useState, useRef } from 'react';
import {
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  Shield,
  Layers,
  Radio,
  ExternalLink,
  Target,
  AlertTriangle,
  Info
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
  historicalCases,
  initialSelectedZone,
  onDispatchAlert
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Map Hero Container */}
      <div
        ref={containerRef}
        className={`relative w-full glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none min-h-screen' : 'min-h-[820px] h-[85vh]'
        }`}
      >
        {/* Floating Top Header Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Brand and Status Pill */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center shadow-sm">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-slate-900">
                  GEOSPATIAL CASH-OUT INTEL MAP
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Live ATM Hotspot Clusters & Interception Corridors
              </p>
            </div>
          </div>

          {/* Floating Controls */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reload Stream"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <a
              href="https://sih-cybercrime-intelligence-4ksdkp6csqjnfaduenfrbx.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-900/20 hover:from-blue-900 hover:to-blue-700 transition-all cursor-pointer"
            >
              <span>External GIS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live GIS Map Iframe */}
        <iframe
          key={iframeKey}
          src="https://sih-cybercrime-intelligence-4ksdkp6csqjnfaduenfrbx.streamlit.app/?embed=true"
          width="100%"
          height="100%"
          onLoad={() => setIsLoading(false)}
          style={{ border: 'none', width: '100%', height: '100%', minHeight: '820px' }}
          title="Live Cyber Intel Map"
          className="w-full h-full bg-slate-900"
        />

        {/* Floating Bottom Telemetry Pill */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/80 text-xs flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-slate-800 text-[11px]">
                High-Confidence Cash Corridors:
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1e3a8a] font-bold">
                Mumbai Suburban
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1e3a8a] font-bold">
                Delhi-NCR
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1e3a8a] font-bold">
                Bengaluru Central
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

