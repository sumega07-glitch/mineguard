import React, { useState } from 'react';
import { X, Sliders, AlertCircle, RotateCcw, Check, ShieldAlert } from 'lucide-react';
import { ThresholdSettings } from '../types';
import { DEFAULT_THRESHOLDS, validateThresholds } from '../utils/thresholds';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThresholds: ThresholdSettings;
  onSave: (thresholds: ThresholdSettings) => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  currentThresholds,
  onSave,
}) => {
  const [pm25Warning, setPm25Warning] = useState<string>(currentThresholds.pm25Warning.toString());
  const [pm25Critical, setPm25Critical] = useState<string>(currentThresholds.pm25Critical.toString());
  const [pm10Warning, setPm10Warning] = useState<string>(currentThresholds.pm10Warning.toString());
  const [pm10Critical, setPm10Critical] = useState<string>(currentThresholds.pm10Critical.toString());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const parsed: ThresholdSettings = {
      pm25Warning: parseFloat(pm25Warning),
      pm25Critical: parseFloat(pm25Critical),
      pm10Warning: parseFloat(pm10Warning),
      pm10Critical: parseFloat(pm10Critical),
    };

    const validation = validateThresholds(parsed);
    if (!validation.valid) {
      setError(validation.error || 'Invalid threshold input values.');
      return;
    }

    onSave(parsed);
    setSuccessMsg('Threshold parameters successfully updated and saved!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setPm25Warning(DEFAULT_THRESHOLDS.pm25Warning.toString());
    setPm25Critical(DEFAULT_THRESHOLDS.pm25Critical.toString());
    setPm10Warning(DEFAULT_THRESHOLDS.pm10Warning.toString());
    setPm10Critical(DEFAULT_THRESHOLDS.pm10Critical.toString());
    setError(null);
    setSuccessMsg('Reset to PRD demonstration defaults.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
                Demonstration Threshold Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure cut-off values for Warning and Critical alerts.
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

        {/* Regulatory Disclaimer Notice */}
        <div className="px-5 py-2.5 bg-amber-950/30 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Reminder:</strong> Thresholds are demonstration test values for software evaluation, not certified regulatory or occupational health standards.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PM2.5 Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">PM2.5 (Fine Particulates)</span>
              <span className="text-[11px] font-mono text-slate-400">Unit: µg/m³</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-amber-300 font-medium mb-1">
                  Warning Threshold (≥)
                </label>
                <input
                  type="number"
                  step="1"
                  value={pm25Warning}
                  onChange={(e) => setPm25Warning(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 60 µg/m³</span>
              </div>

              <div>
                <label className="block text-xs text-rose-300 font-medium mb-1">
                  Critical Threshold (≥)
                </label>
                <input
                  type="number"
                  step="1"
                  value={pm25Critical}
                  onChange={(e) => setPm25Critical(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 100 µg/m³</span>
              </div>
            </div>
          </div>

          {/* PM10 Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">PM10 (Coarse Dust)</span>
              <span className="text-[11px] font-mono text-slate-400">Unit: µg/m³</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-amber-300 font-medium mb-1">
                  Warning Threshold (≥)
                </label>
                <input
                  type="number"
                  step="1"
                  value={pm10Warning}
                  onChange={(e) => setPm10Warning(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 120 µg/m³</span>
              </div>

              <div>
                <label className="block text-xs text-rose-300 font-medium mb-1">
                  Critical Threshold (≥)
                </label>
                <input
                  type="number"
                  step="1"
                  value={pm10Critical}
                  onChange={(e) => setPm10Critical(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 200 µg/m³</span>
              </div>
            </div>
          </div>

          {/* Validation Rule Helper Note */}
          <p className="text-[11px] text-slate-400 font-sans italic">
            * Note: System enforces that Warning thresholds must remain strictly below Critical thresholds for both particulate indicators.
          </p>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-md shadow-amber-950/30 flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Thresholds</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
