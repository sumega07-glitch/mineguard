import React from 'react';
import { 
  X, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { ZoneId } from '../types';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (preset: 'normal' | 'warning-pm25' | 'critical-pm25' | 'critical-pm10' | 'boundary', targetZone?: ZoneId) => void;
  onOpenSettings: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'normal',
      name: '1. Normal Baseline Demonstration',
      inputs: 'PM2.5 = 25 µg/m³, PM10 = 60 µg/m³',
      expected: 'Zone marked Normal; baseline routine-monitoring guidance shown; no new alerts generated.',
      action: () => {
        onApplyScenario('normal');
        onClose();
      },
    },
    {
      id: 'warning-pm25',
      name: '2. PM2.5 Warning Exceedance',
      inputs: 'PM2.5 = 75 µg/m³ (≥ 60), PM10 = 85 µg/m³',
      expected: 'Status escalates to Warning; yellow alert added to history; advisory misting guidance displayed.',
      action: () => {
        onApplyScenario('warning-pm25', 'crushing');
        onClose();
      },
    },
    {
      id: 'critical-pm25',
      name: '3. PM2.5 Critical Spike Alert',
      inputs: 'PM2.5 = 125 µg/m³ (≥ 100), PM10 = 145 µg/m³',
      expected: 'Status escalates to Critical; high-priority red alert created with zone & timestamp; immediate intervention checklist triggered.',
      action: () => {
        onApplyScenario('critical-pm25', 'mining');
        onClose();
      },
    },
    {
      id: 'critical-pm10',
      name: '4. PM10 Coarse Dust Surge',
      inputs: 'PM10 = 230 µg/m³ (≥ 200), PM2.5 = 85 µg/m³',
      expected: 'Status escalates to Critical due to PM10; cross-comparison chart shows highest spike; haul road chemical suppression recommended.',
      action: () => {
        onApplyScenario('critical-pm10', 'transportation');
        onClose();
      },
    },
    {
      id: 'boundary',
      name: '5. Boundary Condition Verification (≥ Threshold)',
      inputs: 'PM2.5 = 60 µg/m³ exactly, PM10 = 120 µg/m³ exactly',
      expected: 'Evaluates the >= threshold rule: transitions precisely into Warning status at 60 and 120.',
      action: () => {
        onApplyScenario('boundary', 'storage');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
                How to Use & Demo MineGuard
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation guide based on College Project Report & PRD test scenarios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Quick 3-Step Demo Pitch */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>3-Step Quick Demonstration Flow for Evaluators</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1">1. Live Data Stream</div>
                <p className="text-[11px] text-slate-400">
                  Click <strong>"Generate Readings"</strong> or toggle <strong>"Auto (5s)"</strong> to simulate real-time particulate fluctuations across the 4 mine zones.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1">2. Trigger Test Alert</div>
                <p className="text-[11px] text-slate-400">
                  Click any of the scenario buttons below (e.g. <em>PM2.5 Crit 125</em>) to instantly trigger a live alert with timestamp, zone, and advice.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1">3. Custom Thresholds</div>
                <p className="text-[11px] text-slate-400">
                  Open <strong>"Demo Thresholds"</strong> to customize demo limits and demonstrate that warning &lt; critical input validation works reliably.
                </p>
              </div>
            </div>
          </div>

          {/* Test Scenarios Checklist */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-2 flex items-center justify-between">
              <span>PRD Test Scenarios & Expected Outcomes</span>
              <span className="text-[11px] text-slate-500 font-normal">Click "Run Now" to test</span>
            </h4>

            <div className="space-y-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-white text-xs">{sc.name}</div>
                    <div className="text-[11px] font-mono text-amber-400/90">{sc.inputs}</div>
                    <div className="text-[11px] text-slate-400">{sc.expected}</div>
                  </div>

                  <button
                    onClick={sc.action}
                    className="self-end sm:self-center px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Now</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scope & Architecture Roadmap */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
            <h4 className="font-semibold text-white text-xs mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Project Roadmap & Scope Boundaries</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              This prototype delivers the complete <strong>Version 1 Browser MVP</strong>: pure client-side simulation, configurable demo threshold engine, live alerts, and Chart.js visuals with no sensor hardware or AWS account needed.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                ✓ V1: Browser MVP (Complete)
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                V2: AWS Cloud MVP (API Gateway / Lambda / DynamoDB)
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                V3: IoT Hardware (ESP32 & Sensors)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Demo Thresholds</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
