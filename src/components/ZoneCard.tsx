import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Droplets, 
  Clock, 
  Gauge, 
  Wind, 
  Thermometer, 
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ThresholdSettings, ZoneData } from '../types';

interface ZoneCardProps {
  zone: ZoneData;
  thresholds: ThresholdSettings;
  onOpenDetails: (zone: ZoneData) => void;
  onToggleSuppression: (zoneId: ZoneData['id']) => void;
  isSelected?: boolean;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  thresholds,
  onOpenDetails,
  onToggleSuppression,
  isSelected,
}) => {
  // Status styling
  const isCritical = zone.status === 'critical';
  const isWarning = zone.status === 'warning';

  const statusBg = isCritical
    ? 'border-rose-500/50 bg-rose-950/15 shadow-lg shadow-rose-950/20'
    : isWarning
    ? 'border-amber-500/50 bg-amber-950/15 shadow-lg shadow-amber-950/20'
    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

  const statusBadge = isCritical ? (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider font-mono">
      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      <span>CRITICAL</span>
    </div>
  ) : isWarning ? (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider font-mono">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>WARNING</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider font-mono">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>NORMAL</span>
    </div>
  );

  // Percentage for PM2.5 bar (scaled relative to critical threshold * 1.3)
  const pm25MaxScale = thresholds.pm25Critical * 1.4;
  const pm25Pct = Math.min(100, Math.round((zone.pm25 / pm25MaxScale) * 100));
  const pm25WarnPct = Math.round((thresholds.pm25Warning / pm25MaxScale) * 100);
  const pm25CritPct = Math.round((thresholds.pm25Critical / pm25MaxScale) * 100);

  // Percentage for PM10 bar
  const pm10MaxScale = thresholds.pm10Critical * 1.4;
  const pm10Pct = Math.min(100, Math.round((zone.pm10 / pm10MaxScale) * 100));
  const pm10WarnPct = Math.round((thresholds.pm10Warning / pm10MaxScale) * 100);
  const pm10CritPct = Math.round((thresholds.pm10Critical / pm10MaxScale) * 100);

  return (
    <div
      className={`rounded-xl border p-4 transition-all flex flex-col justify-between relative ${statusBg} ${
        isSelected ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                {zone.code}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {zone.lastUpdated}
              </span>
            </div>
            <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight mt-0.5">
              {zone.name}
            </h3>
          </div>
          <div>{statusBadge}</div>
        </div>

        <p className="text-xs text-slate-400 mb-4 line-clamp-1">{zone.description}</p>

        {/* Particulate Reading Gauges */}
        <div className="space-y-3.5 mb-4 bg-slate-950/50 rounded-lg p-3 border border-slate-800/80">
          {/* PM2.5 Gauge */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">PM2.5</span>
                <span className="text-[10px] text-slate-400">Fine Dust</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-['Chakra_Petch',sans-serif] text-xl font-bold ${
                    zone.pm25 >= thresholds.pm25Critical
                      ? 'text-rose-400'
                      : zone.pm25 >= thresholds.pm25Warning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {zone.pm25}
                </span>
                <span className="text-[11px] text-slate-400">µg/m³</span>
              </div>
            </div>

            {/* Progress Track with threshold ticks */}
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  zone.pm25 >= thresholds.pm25Critical
                    ? 'bg-rose-500'
                    : zone.pm25 >= thresholds.pm25Warning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${pm25Pct}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0</span>
              <span className="text-amber-400/90">Warn: {thresholds.pm25Warning}</span>
              <span className="text-rose-400/90">Crit: {thresholds.pm25Critical}</span>
            </div>
          </div>

          {/* PM10 Gauge */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">PM10</span>
                <span className="text-[10px] text-slate-400">Coarse Dust</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-['Chakra_Petch',sans-serif] text-xl font-bold ${
                    zone.pm10 >= thresholds.pm10Critical
                      ? 'text-rose-400'
                      : zone.pm10 >= thresholds.pm10Warning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {zone.pm10}
                </span>
                <span className="text-[11px] text-slate-400">µg/m³</span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  zone.pm10 >= thresholds.pm10Critical
                    ? 'bg-rose-500'
                    : zone.pm10 >= thresholds.pm10Warning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${pm10Pct}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0</span>
              <span className="text-amber-400/90">Warn: {thresholds.pm10Warning}</span>
              <span className="text-rose-400/90">Crit: {thresholds.pm10Critical}</span>
            </div>
          </div>
        </div>

        {/* Environmental context */}
        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-900/40 rounded-lg text-[11px] text-slate-400 mb-3 border border-slate-800/60">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            <span>{zone.windSpeedMps} m/s</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-slate-400" />
            <span>{zone.temperatureC}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-slate-400" />
            <span>{zone.humidityPct}% RH</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Dust Suppression & Detailed View button */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleSuppression(zone.id)}
          title="Toggle water cannon and misting suppression simulation"
          className={`text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border ${
            zone.dustSuppressionActive
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className={`w-3.5 h-3.5 ${zone.dustSuppressionActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{zone.dustSuppressionActive ? 'Misting: ON' : 'Misting: OFF'}</span>
        </button>

        <button
          onClick={() => onOpenDetails(zone)}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline transition-colors py-1 px-1.5"
        >
          <span>Zone Actions</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
