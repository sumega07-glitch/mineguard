import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Download, 
  Trash2, 
  Filter, 
  Search,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AlertRecord, AlertSeverity, ZoneId } from '../types';

interface AlertHistoryProps {
  alerts: AlertRecord[];
  onAcknowledge: (id: string) => void;
  onClearHistory: () => void;
  onOpenReport?: () => void;
  selectedZoneFilter: 'all' | ZoneId;
  onZoneFilterChange: (zone: 'all' | ZoneId) => void;
  selectedSeverityFilter: 'all' | 'warning' | 'critical';
  onSeverityFilterChange: (severity: 'all' | 'warning' | 'critical') => void;
  timeFilter: '1h' | '6h' | '24h' | 'all';
  onTimeFilterChange: (time: '1h' | '6h' | '24h' | 'all') => void;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({
  alerts,
  onAcknowledge,
  onClearHistory,
  onOpenReport,
  selectedZoneFilter,
  onZoneFilterChange,
  selectedSeverityFilter,
  onSeverityFilterChange,
  timeFilter,
  onTimeFilterChange,
}) => {
  const [search, setSearch] = useState('');

  // Filtering alerts
  const filteredAlerts = alerts.filter((alert) => {
    // Zone filter
    if (selectedZoneFilter !== 'all' && alert.zoneId !== selectedZoneFilter) {
      return false;
    }
    // Severity filter
    if (selectedSeverityFilter !== 'all' && alert.severity !== selectedSeverityFilter) {
      return false;
    }
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        alert.zoneName.toLowerCase().includes(q) ||
        alert.parameter.toLowerCase().includes(q) ||
        alert.recommendation.toLowerCase().includes(q) ||
        alert.severity.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeAlerts = filteredAlerts.filter((a) => !a.acknowledged);

  // CSV export function
  const handleExportCSV = () => {
    if (alerts.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Zone', 'Parameter', 'Reading (ug/m3)', 'Threshold Crossed', 'Severity', 'Acknowledged', 'Recommendation'];
    const rows = alerts.map((a) => [
      a.id,
      `"${a.timestamp}"`,
      `"${a.zoneName}"`,
      `"${a.parameter}"`,
      a.reading,
      a.thresholdCrossed,
      a.severity.toUpperCase(),
      a.acknowledged ? 'YES' : 'NO',
      `"${a.recommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MineGuard_Alert_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="alerts-section" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
              Alerts & Incident History
            </h3>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {alerts.length} total recorded
            </span>
            {activeAlerts.length > 0 && (
              <span className="text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded animate-pulse">
                {activeAlerts.length} unacknowledged
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time threshold exceedance logs with actionable event history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
              title="Download comprehensive PDF or CSV summary report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Full Report</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={alerts.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Download alert events table as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Alerts CSV</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={alerts.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts or advice..."
            className="w-full bg-slate-800/80 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Zone Filter */}
        <select
          value={selectedZoneFilter}
          onChange={(e) => onZoneFilterChange(e.target.value as any)}
          className="bg-slate-800/80 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="all">Filter Zone: All Zones</option>
          <option value="mining">Mining Area</option>
          <option value="crushing">Crushing Area</option>
          <option value="transportation">Transportation Area</option>
          <option value="storage">Storage Area</option>
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverityFilter}
          onChange={(e) => onSeverityFilterChange(e.target.value as any)}
          className="bg-slate-800/80 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="all">Filter Severity: All</option>
          <option value="critical">Critical Only</option>
          <option value="warning">Warning Only</option>
        </select>

        {/* Time Filter */}
        <select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value as any)}
          className="bg-slate-800/80 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="all">Time Window: All Records</option>
          <option value="1h">Last 1 Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>

      {/* Alert Feed / Table */}
      {filteredAlerts.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-800 rounded-lg">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No alert events found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {alerts.length === 0
              ? 'No thresholds exceeded yet. Click "Generate Readings" or a preset scenario above to trigger a test alert.'
              : 'Try clearing or relaxing your current filters above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                } ${alert.acknowledged ? 'opacity-70' : ''}`}
              >
                {/* Left: Severity, Zone, Parameter */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span className="font-semibold text-white text-xs">{alert.zoneName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-mono text-slate-300">
                        {alert.parameter}: <strong className="text-white">{alert.reading} µg/m³</strong>
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        (limit was {alert.thresholdCrossed})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.recommendation}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{alert.timestamp}</span>
                      {alert.acknowledged && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          · <Check className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Acknowledge button */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono px-2 py-1">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
