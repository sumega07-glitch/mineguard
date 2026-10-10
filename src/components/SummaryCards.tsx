import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Wind, 
  Layers,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ThresholdSettings, ZoneData } from '../types';

interface SummaryCardsProps {
  zones: ZoneData[];
  thresholds: ThresholdSettings;
  activeAlertCount: number;
  lastUpdated: string;
  onFilterStatus?: (status: 'all' | 'normal' | 'warning' | 'critical') => void;
  onScrollToAlerts?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  zones,
  thresholds,
  activeAlertCount,
  lastUpdated,
  onFilterStatus,
  onScrollToAlerts,
}) => {
  // Determine site overall status: Critical if any zone critical, else Warning if any warning, else Normal
  const hasCritical = zones.some((z) => z.status === 'critical');
  const hasWarning = zones.some((z) => z.status === 'warning');

  const siteStatus = hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal';

  // Compute peaks and averages
  const avgPm25 = Math.round(zones.reduce((acc, z) => acc + z.pm25, 0) / (zones.length || 1));
  const avgPm10 = Math.round(zones.reduce((acc, z) => acc + z.pm10, 0) / (zones.length || 1));

  const maxPm25Zone = zones.reduce((prev, curr) => (curr.pm25 > prev.pm25 ? curr : prev), zones[0]);
  const maxPm10Zone = zones.reduce((prev, curr) => (curr.pm10 > prev.pm10 ? curr : prev), zones[0]);

  const criticalCount = zones.filter((z) => z.status === 'critical').length;
  const warningCount = zones.filter((z) => z.status === 'warning').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Overall Status Card */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus(siteStatus)}
        className={`rounded-xl p-4 border transition-all cursor-pointer ${
          siteStatus === 'critical'
            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400/60 shadow-lg shadow-rose-950/30'
            : siteStatus === 'warning'
            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60 shadow-lg shadow-amber-950/30'
            : 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/60'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Site Status</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  siteStatus === 'critical'
                    ? 'bg-rose-400'
                    : siteStatus === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  siteStatus === 'critical'
                    ? 'bg-rose-500'
                    : siteStatus === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                siteStatus === 'critical'
                  ? 'text-rose-400'
                  : siteStatus === 'warning'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {siteStatus}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="font-['Chakra_Petch',sans-serif] text-2xl font-bold text-white tracking-tight">
            {siteStatus === 'critical'
              ? 'ACTION REQUIRED'
              : siteStatus === 'warning'
              ? 'ATTENTION ADVISORY'
              : 'CONDITIONS NORMAL'}
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span>
            {criticalCount > 0 ? `${criticalCount} zone(s) critical` : warningCount > 0 ? `${warningCount} zone(s) warning` : 'All 4 zones compliant'}
          </span>
          <span className="text-[11px] text-slate-400">Click to filter</span>
        </div>
      </div>

      {/* 2. Active Alerts Card */}
      <div 
        onClick={onScrollToAlerts}
        className="rounded-xl p-4 bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Active Alerts</span>
          <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-['Chakra_Petch',sans-serif] text-2xl font-bold text-white tracking-tight">
            {activeAlertCount}
          </span>
          <span className="text-xs text-slate-400">events recorded</span>
        </div>

        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-slate-400">
            {activeAlertCount > 0 ? 'Requires attention' : 'No active alerts'}
          </span>
          <span className="text-[11px] text-amber-400/90 group-hover:underline">View Log →</span>
        </div>
      </div>

      {/* 3. Site PM2.5 Overview */}
      <div className="rounded-xl p-4 bg-slate-900/70 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">PM2.5 Fine Particulates</span>
          <span className="text-[11px] font-mono text-slate-400">
            Demo limit: {thresholds.pm25Warning}/{thresholds.pm25Critical}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-['Chakra_Petch',sans-serif] text-2xl font-bold text-white tracking-tight">
              {avgPm25}
            </span>
            <span className="text-xs text-slate-400 ml-1">µg/m³ avg</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-amber-400 font-medium">
              Peak: {maxPm25Zone?.pm25 ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="truncate max-w-[150px] text-slate-300">
            Highest: {maxPm25Zone?.name ?? '—'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {maxPm25Zone && maxPm25Zone.pm25 >= thresholds.pm25Critical ? '🔴 CRIT' : maxPm25Zone && maxPm25Zone.pm25 >= thresholds.pm25Warning ? '🟡 WARN' : '🟢 NORM'}
          </span>
        </div>
      </div>

      {/* 4. Site PM10 Overview */}
      <div className="rounded-xl p-4 bg-slate-900/70 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">PM10 Coarse Dust</span>
          <span className="text-[11px] font-mono text-slate-400">
            Demo limit: {thresholds.pm10Warning}/{thresholds.pm10Critical}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-['Chakra_Petch',sans-serif] text-2xl font-bold text-white tracking-tight">
              {avgPm10}
            </span>
            <span className="text-xs text-slate-400 ml-1">µg/m³ avg</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-amber-400 font-medium">
              Peak: {maxPm10Zone?.pm10 ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="truncate max-w-[150px] text-slate-300">
            Highest: {maxPm10Zone?.name ?? '—'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {maxPm10Zone && maxPm10Zone.pm10 >= thresholds.pm10Critical ? '🔴 CRIT' : maxPm10Zone && maxPm10Zone.pm10 >= thresholds.pm10Warning ? '🟡 WARN' : '🟢 NORM'}
          </span>
        </div>
      </div>
    </div>
  );
};
