import React from 'react';
import { 
  Activity, 
  Sliders, 
  HelpCircle, 
  RefreshCw, 
  Play, 
  Pause, 
  Download,
  FileText
} from 'lucide-react';

interface HeaderProps {
  onGenerateReadings: () => void;
  isGenerating: boolean;
  autoSimulate: boolean;
  onToggleAutoSimulate: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenReport: () => void;
  onOpenStandalone: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onGenerateReadings,
  isGenerating,
  autoSimulate,
  onToggleAutoSimulate,
  onOpenSettings,
  onOpenGuide,
  onOpenReport,
  onOpenStandalone,
  activeAlertCount,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-400/40 shrink-0">
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Chakra_Petch',sans-serif] text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                MINE<span className="text-amber-400">GUARD</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded tracking-wide">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-sans">
              <span>Smart Coal Mine Pollution Alert System</span>
              <span className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoSimulate ? 'bg-emerald-400' : 'bg-slate-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSimulate ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
                {autoSimulate ? 'Live (5s Interval)' : 'Manual Mode'}
              </span>
            </p>
          </div>
        </div>

        {/* Top Control Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Auto Simulation Toggle */}
          <button
            onClick={onToggleAutoSimulate}
            title={autoSimulate ? 'Pause continuous 5s updates' : 'Start continuous 5s updates'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              autoSimulate
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            {autoSimulate ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto: Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto: Paused</span>
              </>
            )}
          </button>

          {/* Generate New Simulated Readings (Explicitly requested) */}
          <button
            onClick={onGenerateReadings}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950/40 border border-amber-400/50 flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Readings</span>
          </button>

          {/* Download Report Modal Trigger */}
          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
            title="Download aggregated PDF/CSV summary report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Report</span>
          </button>

          {/* Thresholds Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo</span> Thresholds
          </button>

          {/* 3-File Standalone Prototype Modal */}
          <button
            onClick={onOpenStandalone}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors"
            title="View and download index.html, style.css, and script.js"
          >
            <span className="font-mono text-amber-400 font-bold">&lt;/&gt;</span>
            <span>3-File Prototype</span>
          </button>

          {/* Guide & Test Scenarios Modal */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>How to Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
