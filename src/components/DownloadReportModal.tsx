import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Table, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Layers, 
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AlertRecord, HistoricalReading, ThresholdSettings, ZoneData } from '../types';
import { generateReportCSV, generateReportPDF, ReportOptions } from '../utils/reportGenerator';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ZoneData[];
  alerts: AlertRecord[];
  thresholds: ThresholdSettings;
  history: HistoricalReading[];
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  zones,
  alerts,
  thresholds,
  history,
}) => {
  const [includeResolved, setIncludeResolved] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = zones.filter((z) => z.status === 'critical').length;
  const warningCount = zones.filter((z) => z.status === 'warning').length;

  const handleDownloadPDF = () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      generateReportPDF(zones, alerts, thresholds, history, {
        includeResolvedAlerts: includeResolved,
        includeTrendData: includeTrends,
      });
      setExportSuccess('PDF Summary successfully generated and downloaded!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      generateReportCSV(zones, alerts, thresholds, history, {
        includeResolvedAlerts: includeResolved,
        includeTrendData: includeTrends,
      });
      setExportSuccess('CSV Aggregated Data successfully exported and downloaded!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (e) {
      console.error('Failed to export CSV', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
                Export Environmental Audit Report
              </h3>
              <p className="text-xs text-slate-400">
                Generate an aggregated summary file of current zones, active alerts, and trend readings.
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

        {/* Disclaimer Notice */}
        <div className="px-5 py-2.5 bg-amber-950/30 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Report embeds prototype simulated values and demonstration thresholds for compliance simulation.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}

          {/* Aggregated Payload Snapshot */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono text-slate-400">
              Report Data Aggregation Overview
            </h4>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Mine Zones</span>
                <span className="font-['Chakra_Petch',sans-serif] text-base font-bold text-white">4 Sectors</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {criticalCount > 0 ? `${criticalCount} crit` : warningCount > 0 ? `${warningCount} warn` : 'All normal'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Alert Records</span>
                <span className="font-['Chakra_Petch',sans-serif] text-base font-bold text-white">{alerts.length} Events</span>
                <span className="text-[10px] text-amber-400 block mt-0.5 font-mono">
                  {activeAlerts.length} active
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Trend Telemetry</span>
                <span className="font-['Chakra_Petch',sans-serif] text-base font-bold text-white">{history.length} Points</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">PM2.5 & PM10</span>
              </div>
            </div>

            {/* List of included zones */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap gap-2">
              <span className="font-semibold text-slate-300">Included Zones:</span>
              {zones.map((z) => (
                <span key={z.id} className="text-slate-300 font-mono">
                  {z.name} ({z.status.toUpperCase()})
                </span>
              ))}
            </div>
          </div>

          {/* Export Configurations */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-white text-xs">Report Options</h4>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeResolved}
                onChange={(e) => setIncludeResolved(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="font-medium text-white block">Include Historic Resolved Alerts</span>
                <span className="text-[11px] text-slate-400">
                  When checked, exports both unacknowledged active alerts and resolved audit logs.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeTrends}
                onChange={(e) => setIncludeTrends(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="font-medium text-white block">Include Time-Series Chronological Trend Telemetry</span>
                <span className="text-[11px] text-slate-400">
                  Embeds recent chronological particulate points for audit verification and graphing.
                </span>
              </div>
            </label>
          </div>

          {/* Format Selection Cards */}
          <div className="pt-2">
            <h4 className="font-semibold text-white text-xs mb-2.5">Select Export Format</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF Option */}
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-400/50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-rose-900/40 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      Printable PDF
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm group-hover:text-rose-200">
                    PDF Summary Audit Report
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Formatted document with tables, executive status card, active alert log, and official disclaimer.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Generate & Download PDF</span>
                  <span>→</span>
                </div>
              </button>

              {/* CSV Option */}
              <button
                onClick={handleDownloadCSV}
                disabled={isExporting}
                className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-400/50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Raw CSV Data
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm group-hover:text-emerald-200">
                    Aggregated CSV Spreadsheet
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Complete tabular data file formatted for Microsoft Excel, Google Sheets, or python analytics.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Generate & Download CSV</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            MineGuard Export Utility v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
