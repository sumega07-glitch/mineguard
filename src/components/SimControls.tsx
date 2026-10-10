import React from 'react';
import { 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Scale, 
  Dice5,
  SlidersHorizontal
} from 'lucide-react';
import { ZoneId } from '../types';

interface SimControlsProps {
  onGenerateRandom: () => void;
  onApplyScenario: (preset: 'normal' | 'warning-pm25' | 'critical-pm25' | 'critical-pm10' | 'boundary', targetZone?: ZoneId) => void;
  selectedZone: 'all' | ZoneId;
  isGenerating: boolean;
}

export const SimControls: React.FC<SimControlsProps> = ({
  onGenerateRandom,
  onApplyScenario,
  selectedZone,
  isGenerating,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Label & Description */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
              Live Demo Simulator Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inject test cases or generate new simulated particulate readings to demonstrate alerts in real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Random Live Update Button */}
          <button
            onClick={onGenerateRandom}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Add random fluctuation across all zones"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Step</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Quick Scenario Triggers from PRD Page 7 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Presets:</span>

            <button
              onClick={() => onApplyScenario('normal', selectedZone === 'all' ? undefined : selectedZone)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
              title="Scenario: PM2.5 = 25, PM10 = 60 (Normal baseline)"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Normal</span>
            </button>

            <button
              onClick={() => onApplyScenario('warning-pm25', selectedZone === 'all' ? undefined : selectedZone)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
              title="Scenario: PM2.5 = 75, PM10 = 85 (Warning state)"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>PM2.5 Warn (75)</span>
            </button>

            <button
              onClick={() => onApplyScenario('critical-pm25', selectedZone === 'all' ? undefined : selectedZone)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors"
              title="Scenario: PM2.5 = 125, PM10 = 145 (Critical PM2.5 alert)"
            >
              <AlertOctagon className="w-3 h-3 text-rose-400" />
              <span>PM2.5 Crit (125)</span>
            </button>

            <button
              onClick={() => onApplyScenario('critical-pm10', selectedZone === 'all' ? undefined : selectedZone)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 flex items-center gap-1 transition-colors"
              title="Scenario: PM10 = 230, PM2.5 = 85 (Critical PM10 dust alert)"
            >
              <Zap className="w-3 h-3 text-red-400" />
              <span>PM10 Crit (230)</span>
            </button>

            <button
              onClick={() => onApplyScenario('boundary', selectedZone === 'all' ? undefined : selectedZone)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 flex items-center gap-1 transition-colors"
              title="Scenario: PM2.5 = 60, PM10 = 120 (Exact Warning boundary)"
            >
              <Scale className="w-3 h-3 text-blue-400" />
              <span>Boundary (60/120)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
