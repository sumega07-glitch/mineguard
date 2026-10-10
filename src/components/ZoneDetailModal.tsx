import React from 'react';
import { 
  X, 
  Clock, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  Check, 
  Sliders, 
  Pickaxe,
  Factory,
  Truck,
  Archive,
  Zap
} from 'lucide-react';
import { ThresholdSettings, ZoneData, ZoneId } from '../types';

interface ZoneDetailModalProps {
  zone: ZoneData | null;
  thresholds: ThresholdSettings;
  onClose: () => void;
  onToggleSuppression: (zoneId: ZoneId) => void;
  onSimulateSpike: (zoneId: ZoneId, type: 'critical-pm25' | 'critical-pm10' | 'normal') => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  thresholds,
  onClose,
  onToggleSuppression,
  onSimulateSpike,
}) => {
  if (!zone) return null;

  const isCritical = zone.status === 'critical';
  const isWarning = zone.status === 'warning';

  const zoneIcons: Record<string, any> = {
    mining: Pickaxe,
    crushing: Factory,
    transportation: Truck,
    storage: Archive,
  };
  const Icon = zoneIcons[zone.id] || Factory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isCritical
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : isWarning
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  {zone.code}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {zone.lastUpdated}
                </span>
              </div>
              <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
                {zone.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          <p className="text-slate-300 text-xs leading-relaxed">{zone.description}</p>

          {/* Current Readings Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* PM2.5 */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-medium">PM2.5 (Fine)</span>
                <span className="text-[10px] font-mono">
                  Limit: {thresholds.pm25Warning} / {thresholds.pm25Critical}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-['Chakra_Petch',sans-serif] text-2xl font-bold ${
                    zone.pm25 >= thresholds.pm25Critical
                      ? 'text-rose-400'
                      : zone.pm25 >= thresholds.pm25Warning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {zone.pm25}
                </span>
                <span className="text-slate-400 text-xs">µg/m³</span>
              </div>
              <div className="text-[10px] font-mono mt-1 text-slate-400">
                {zone.pm25 >= thresholds.pm25Critical
                  ? 'CRITICAL THRESHOLD EXCEEDED'
                  : zone.pm25 >= thresholds.pm25Warning
                  ? 'WARNING LEVEL DETECTED'
                  : 'WITHIN BASELINE TARGET'}
              </div>
            </div>

            {/* PM10 */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-medium">PM10 (Coarse)</span>
                <span className="text-[10px] font-mono">
                  Limit: {thresholds.pm10Warning} / {thresholds.pm10Critical}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-['Chakra_Petch',sans-serif] text-2xl font-bold ${
                    zone.pm10 >= thresholds.pm10Critical
                      ? 'text-rose-400'
                      : zone.pm10 >= thresholds.pm10Warning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {zone.pm10}
                </span>
                <span className="text-slate-400 text-xs">µg/m³</span>
              </div>
              <div className="text-[10px] font-mono mt-1 text-slate-400">
                {zone.pm10 >= thresholds.pm10Critical
                  ? 'CRITICAL THRESHOLD EXCEEDED'
                  : zone.pm10 >= thresholds.pm10Warning
                  ? 'WARNING LEVEL DETECTED'
                  : 'WITHIN BASELINE TARGET'}
              </div>
            </div>
          </div>

          {/* Environmental Telemetry */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-slate-400 text-[10px] block">Wind Velocity</span>
              <span className="text-white font-mono font-medium text-xs flex items-center justify-center gap-1 mt-0.5">
                <Wind className="w-3 h-3 text-sky-400" />
                {zone.windSpeedMps} m/s
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Temperature</span>
              <span className="text-white font-mono font-medium text-xs flex items-center justify-center gap-1 mt-0.5">
                <Thermometer className="w-3 h-3 text-amber-400" />
                {zone.temperatureC} °C
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Humidity</span>
              <span className="text-white font-mono font-medium text-xs flex items-center justify-center gap-1 mt-0.5">
                <Droplets className="w-3 h-3 text-cyan-400" />
                {zone.humidityPct} %
              </span>
            </div>
          </div>

          {/* Operational Equipment */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              Active Machinery & Equipment:
            </span>
            <span className="text-slate-200 font-mono text-xs">{zone.equipment}</span>
          </div>

          {/* Dust Suppression Controls */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">
                Automated Dust Suppression Sprayers
              </span>
              <span className="text-[11px] text-slate-400">
                {zone.dustSuppressionActive
                  ? 'High-pressure mist nozzles active'
                  : 'Sprayers currently on standby'}
              </span>
            </div>

            <button
              onClick={() => onToggleSuppression(zone.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                zone.dustSuppressionActive
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{zone.dustSuppressionActive ? 'Turn Off' : 'Engage Sprayers'}</span>
            </button>
          </div>

          {/* Quick Zone Test Injection */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Inject Test Scenario for this Zone:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onSimulateSpike(zone.id, 'normal');
                  onClose();
                }}
                className="p-2 rounded bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-300 border border-slate-700 text-slate-300 text-[11px] font-medium"
              >
                Reset Normal
              </button>
              <button
                onClick={() => {
                  onSimulateSpike(zone.id, 'critical-pm25');
                  onClose();
                }}
                className="p-2 rounded bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 border border-slate-700 text-slate-300 text-[11px] font-medium"
              >
                Trigger PM2.5 Spike
              </button>
              <button
                onClick={() => {
                  onSimulateSpike(zone.id, 'critical-pm10');
                  onClose();
                }}
                className="p-2 rounded bg-slate-800 hover:bg-red-950/50 hover:text-red-300 border border-slate-700 text-slate-300 text-[11px] font-medium"
              >
                Trigger PM10 Surge
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
