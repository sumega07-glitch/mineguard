/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  Filter, 
  RotateCcw, 
  BarChart3, 
  Layers, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { AlertRecord, AlertSeverity, HistoricalReading, ThresholdSettings, ZoneData, ZoneId } from './types';
import { DEFAULT_THRESHOLDS, evaluateReadings } from './utils/thresholds';
import { 
  getInitialZones, 
  loadAlerts, 
  loadHistoricalReadings, 
  loadThresholds, 
  saveAlerts, 
  saveHistoricalReadings, 
  saveThresholds 
} from './utils/storage';

import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { SummaryCards } from './components/SummaryCards';
import { SimControls } from './components/SimControls';
import { ZoneCard } from './components/ZoneCard';
import { TrendLineChart } from './components/TrendLineChart';
import { ZoneComparisonChart } from './components/ZoneComparisonChart';
import { AlertHistory } from './components/AlertHistory';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { ZoneDetailModal } from './components/ZoneDetailModal';
import { DownloadReportModal } from './components/DownloadReportModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';

export default function App() {
  // --- Persistent State ---
  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => loadThresholds());
  const [zones, setZones] = useState<ZoneData[]>(() => getInitialZones(thresholds));
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => {
    const saved = loadAlerts();
    if (saved.length > 0) return saved;
    // Initial deterministic alerts for seed data
    return [
      {
        id: 'init-alert-1',
        zoneId: 'crushing',
        zoneName: 'Crushing Area',
        parameter: 'PM2.5 & PM10',
        reading: 215,
        thresholdCrossed: 200,
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        acknowledged: false,
        recommendation: 'CRITICAL ACTION: Investigate emission source immediately. Inspect primary extraction hoods, activate secondary high-pressure dust suppression cannons.',
      },
      {
        id: 'init-alert-2',
        zoneId: 'mining',
        zoneName: 'Mining Area',
        parameter: 'PM2.5',
        reading: 75,
        thresholdCrossed: 60,
        severity: 'warning',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        acknowledged: false,
        recommendation: 'ADVISORY: Elevated particulate detection. Inspect dust-control measures (misting cannons and water curtains).',
      },
    ];
  });

  const [history, setHistory] = useState<HistoricalReading[]>(() => {
    const saved = loadHistoricalReadings();
    if (saved.length > 0) return saved;
    // Initial history points for line chart
    const initialPoints: HistoricalReading[] = [];
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      const t = new Date(now - i * 30000);
      const timeLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const iso = t.toISOString();

      initialPoints.push(
        { id: `h-min-${i}`, timestamp: iso, timeLabel, zoneId: 'mining', pm25: 65 + Math.sin(i) * 10, pm10: 120 + Math.cos(i) * 15 },
        { id: `h-cru-${i}`, timestamp: iso, timeLabel, zoneId: 'crushing', pm25: 110 + Math.cos(i) * 10, pm10: 205 + Math.sin(i) * 12 },
        { id: `h-tra-${i}`, timestamp: iso, timeLabel, zoneId: 'transportation', pm25: 40 + Math.sin(i) * 6, pm10: 82 + Math.cos(i) * 8 },
        { id: `h-sto-${i}`, timestamp: iso, timeLabel, zoneId: 'storage', pm25: 25 + Math.cos(i) * 4, pm10: 55 + Math.sin(i) * 5 }
      );
    }
    return initialPoints;
  });

  // --- UI Controls & Filters ---
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [zoneFilter, setZoneFilter] = useState<'all' | ZoneId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');
  const [chartZone, setChartZone] = useState<'all' | ZoneId>('all');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'all' | 'warning' | 'critical'>('all');
  const [alertTimeFilter, setAlertTimeFilter] = useState<'1h' | '6h' | '24h' | 'all'>('all');

  // --- Modals State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isStandaloneOpen, setIsStandaloneOpen] = useState(false);
  const [selectedDetailZone, setSelectedDetailZone] = useState<ZoneData | null>(null);

  // Previous status tracker to avoid duplicate alerts when severity is unchanged
  const prevStatusesRef = useRef<Record<string, AlertSeverity>>({
    mining: 'warning',
    crushing: 'critical',
    transportation: 'normal',
    storage: 'normal',
  });

  // Persist changes
  useEffect(() => {
    saveThresholds(thresholds);
  }, [thresholds]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    saveHistoricalReadings(history);
  }, [history]);

  // --- Continuous Simulation (5-second interval) ---
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      generateSimulatedReadings(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoSimulate, thresholds, zones]);

  // --- Generator Function ---
  const generateSimulatedReadings = (manual = false) => {
    setIsGenerating(true);
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const iso = now.toISOString();

    const newHistoryBatch: HistoricalReading[] = [];
    const newAlerts: AlertRecord[] = [];

    const updatedZones = zones.map((zone) => {
      // Natural fluctuation with bias based on suppression state
      let pm25Delta = (Math.random() - 0.48) * 8;
      let pm10Delta = (Math.random() - 0.48) * 14;

      // If dust suppression active, damp down levels
      if (zone.dustSuppressionActive) {
        pm25Delta -= 3;
        pm10Delta -= 6;
      }

      // Keep within realistic mining bounds
      const newPm25 = Math.max(12, Math.min(220, Math.round(zone.pm25 + pm25Delta)));
      const newPm10 = Math.max(25, Math.min(380, Math.round(zone.pm10 + pm10Delta)));

      const evalResult = evaluateReadings(newPm25, newPm10, thresholds, zone.name);
      const prevStatus = prevStatusesRef.current[zone.id] || 'normal';

      // Alert policy: Record alert if status escalated OR if new threshold crossed
      const escalated =
        (evalResult.status === 'critical' && prevStatus !== 'critical') ||
        (evalResult.status === 'warning' && prevStatus === 'normal');

      if (escalated) {
        newAlerts.push({
          id: `alert-${Date.now()}-${zone.id}`,
          zoneId: zone.id,
          zoneName: zone.name,
          parameter: evalResult.parameterLabel === 'Normal' ? 'PM2.5' : evalResult.parameterLabel,
          reading: evalResult.exceededValue,
          thresholdCrossed: evalResult.thresholdCrossed,
          severity: evalResult.status === 'critical' ? 'critical' : 'warning',
          timestamp: timeLabel,
          acknowledged: false,
          recommendation: evalResult.recommendation,
        });
      }

      prevStatusesRef.current[zone.id] = evalResult.status;

      newHistoryBatch.push({
        id: `hist-${Date.now()}-${zone.id}`,
        timestamp: iso,
        timeLabel,
        zoneId: zone.id,
        pm25: newPm25,
        pm10: newPm10,
      });

      return {
        ...zone,
        pm25: newPm25,
        pm10: newPm10,
        status: evalResult.status,
        statusCause: evalResult.cause,
        lastUpdated: timeLabel,
      };
    });

    setZones(updatedZones);
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 100));
    }
    setHistory((prev) => [...prev, ...newHistoryBatch].slice(-150));

    setTimeout(() => {
      setIsGenerating(false);
    }, manual ? 300 : 100);
  };

  // --- Scenario Injector (From PRD Page 7) ---
  const handleApplyScenario = (
    preset: 'normal' | 'warning-pm25' | 'critical-pm25' | 'critical-pm10' | 'boundary',
    targetZoneId?: ZoneId
  ) => {
    setIsGenerating(true);
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const iso = now.toISOString();

    let targetPm25 = 25;
    let targetPm10 = 60;

    switch (preset) {
      case 'normal':
        targetPm25 = 25;
        targetPm10 = 60;
        break;
      case 'warning-pm25':
        targetPm25 = 75;
        targetPm10 = 85;
        break;
      case 'critical-pm25':
        targetPm25 = 125;
        targetPm10 = 145;
        break;
      case 'critical-pm10':
        targetPm25 = 85;
        targetPm10 = 230;
        break;
      case 'boundary':
        targetPm25 = thresholds.pm25Warning;
        targetPm10 = thresholds.pm10Warning;
        break;
    }

    const updatedAlerts: AlertRecord[] = [];
    const newHistory: HistoricalReading[] = [];

    const updatedZones = zones.map((zone) => {
      const isTarget = targetZoneId ? zone.id === targetZoneId : true;

      const newPm25 = isTarget ? targetPm25 : zone.pm25;
      const newPm10 = isTarget ? targetPm10 : zone.pm10;

      const evalResult = evaluateReadings(newPm25, newPm10, thresholds, zone.name);

      if (isTarget && (evalResult.status === 'warning' || evalResult.status === 'critical')) {
        updatedAlerts.push({
          id: `scenario-${Date.now()}-${zone.id}`,
          zoneId: zone.id,
          zoneName: zone.name,
          parameter: evalResult.parameterLabel === 'Normal' ? 'PM2.5' : evalResult.parameterLabel,
          reading: evalResult.exceededValue,
          thresholdCrossed: evalResult.thresholdCrossed,
          severity: evalResult.status === 'critical' ? 'critical' : 'warning',
          timestamp: timeLabel,
          acknowledged: false,
          recommendation: evalResult.recommendation,
        });
      }

      prevStatusesRef.current[zone.id] = evalResult.status;

      newHistory.push({
        id: `hist-${Date.now()}-${zone.id}`,
        timestamp: iso,
        timeLabel,
        zoneId: zone.id,
        pm25: newPm25,
        pm10: newPm10,
      });

      return {
        ...zone,
        pm25: newPm25,
        pm10: newPm10,
        status: evalResult.status,
        statusCause: evalResult.cause,
        lastUpdated: timeLabel,
      };
    });

    setZones(updatedZones);
    if (updatedAlerts.length > 0) {
      setAlerts((prev) => [...updatedAlerts, ...prev].slice(0, 100));
    }
    setHistory((prev) => [...prev, ...newHistory].slice(-150));

    setTimeout(() => {
      setIsGenerating(false);
    }, 250);
  };

  // --- Toggle Dust Suppression ---
  const handleToggleSuppression = (zoneId: ZoneId) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const nextActive = !z.dustSuppressionActive;
        // Immediate visual response
        const newPm25 = nextActive ? Math.max(15, Math.round(z.pm25 * 0.75)) : Math.round(z.pm25 * 1.2);
        const newPm10 = nextActive ? Math.max(25, Math.round(z.pm10 * 0.72)) : Math.round(z.pm10 * 1.25);
        const evalResult = evaluateReadings(newPm25, newPm10, thresholds, z.name);
        return {
          ...z,
          dustSuppressionActive: nextActive,
          pm25: newPm25,
          pm10: newPm10,
          status: evalResult.status,
          statusCause: evalResult.cause,
        };
      })
    );
  };

  // --- Save New Thresholds & Re-evaluate Zones ---
  const handleSaveThresholds = (newThresholds: ThresholdSettings) => {
    setThresholds(newThresholds);
    setZones((prev) =>
      prev.map((z) => {
        const evalResult = evaluateReadings(z.pm25, z.pm10, newThresholds, z.name);
        return {
          ...z,
          status: evalResult.status,
          statusCause: evalResult.cause,
        };
      })
    );
  };

  // --- Alert Actions ---
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleClearAlertHistory = () => {
    setAlerts([]);
  };

  // Filtered zones for display
  const displayedZones = zones.filter((z) => {
    if (zoneFilter !== 'all' && z.id !== zoneFilter) return false;
    if (statusFilter !== 'all' && z.status !== statusFilter) return false;
    return true;
  });

  const unackAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Disclaimer Notice */}
      <DisclaimerBanner />

      {/* Main Navigation Header */}
      <Header
        onGenerateReadings={() => generateSimulatedReadings(true)}
        isGenerating={isGenerating}
        autoSimulate={autoSimulate}
        onToggleAutoSimulate={() => setAutoSimulate(!autoSimulate)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenStandalone={() => setIsStandaloneOpen(true)}
        activeAlertCount={unackAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Simulator Controls & Scenario Presets Toolbar */}
        <SimControls
          onGenerateRandom={() => generateSimulatedReadings(true)}
          onApplyScenario={handleApplyScenario}
          selectedZone={zoneFilter}
          isGenerating={isGenerating}
        />

        {/* Site Overview Metrics */}
        <SummaryCards
          zones={zones}
          thresholds={thresholds}
          activeAlertCount={unackAlertCount}
          lastUpdated={zones[0]?.lastUpdated || 'Just now'}
          onFilterStatus={(s) => setStatusFilter(s)}
          onScrollToAlerts={() => {
            document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Zones Section Header & Filter Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-['Chakra_Petch',sans-serif] text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Mine Zones Monitoring</span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  4 Simulated Sectors
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time PM2.5 and PM10 particulate indicators across active coal extraction and storage facilities.
              </p>
            </div>

            {/* Zone & Status Filter Segmented Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Zone Selector */}
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setZoneFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoneFilter === 'all' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Zones
                </button>
                <button
                  onClick={() => setZoneFilter('mining')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoneFilter === 'mining' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mining
                </button>
                <button
                  onClick={() => setZoneFilter('crushing')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoneFilter === 'crushing' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crushing
                </button>
                <button
                  onClick={() => setZoneFilter('transportation')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoneFilter === 'transportation' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Haulage
                </button>
                <button
                  onClick={() => setZoneFilter('storage')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    zoneFilter === 'storage' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Storage
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-900 text-xs text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">Status: All Levels</option>
                <option value="normal">Normal Only</option>
                <option value="warning">Warning Only</option>
                <option value="critical">Critical Only</option>
              </select>

              {(zoneFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setZoneFilter('all');
                    setStatusFilter('all');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-xs flex items-center gap-1"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mine Zone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                thresholds={thresholds}
                onOpenDetails={(z) => setSelectedDetailZone(z)}
                onToggleSuppression={handleToggleSuppression}
                isSelected={selectedDetailZone?.id === zone.id}
              />
            ))}
          </div>

          {displayedZones.length === 0 && (
            <div className="py-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 text-sm">No zones match your current filters.</p>
              <button
                onClick={() => {
                  setZoneFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs text-amber-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Visual Analytics: Chart.js Line Trend & Cross-Zone Bar Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrendLineChart
            history={history}
            thresholds={thresholds}
            selectedZone={chartZone}
            onSelectZone={setChartZone}
          />
          <ZoneComparisonChart
            zones={zones}
            thresholds={thresholds}
            onSelectZone={(id) => setSelectedDetailZone(zones.find((z) => z.id === id) || null)}
          />
        </div>

        {/* Actionable Dust-Control Recommendations */}
        <RecommendationsPanel
          zones={zones}
          onTriggerSuppression={handleToggleSuppression}
        />

        {/* Real-time Alerts Feed & Historical Exceedances */}
        <AlertHistory
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
          onClearHistory={handleClearAlertHistory}
          onOpenReport={() => setIsReportOpen(true)}
          selectedZoneFilter={zoneFilter}
          onZoneFilterChange={setZoneFilter}
          selectedSeverityFilter={alertSeverityFilter}
          onSeverityFilterChange={setAlertSeverityFilter}
          timeFilter={alertTimeFilter}
          onTimeFilterChange={setAlertTimeFilter}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Chakra_Petch',sans-serif] font-bold text-white tracking-wider">MINEGUARD</span>
            <span>· Smart Coal Mine Pollution Alert System</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">College Hackathon Prototype</span>
          </div>

          <div className="text-slate-400 text-center md:text-right text-[11px] leading-relaxed">
            <p>
              ⚠️ Demonstrational Software Prototype. All particulate telemetry is simulated.
            </p>
            <p className="text-slate-400">
              Thresholds are demonstration values and not certified regulatory limits.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DownloadReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        zones={zones}
        alerts={alerts}
        thresholds={thresholds}
        history={history}
      />

      <ThresholdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentThresholds={thresholds}
        onSave={handleSaveThresholds}
      />

      <DemoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onApplyScenario={handleApplyScenario}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ZoneDetailModal
        zone={selectedDetailZone}
        thresholds={thresholds}
        onClose={() => setSelectedDetailZone(null)}
        onToggleSuppression={handleToggleSuppression}
        onSimulateSpike={(zoneId, type) => {
          if (type === 'normal') handleApplyScenario('normal', zoneId);
          else if (type === 'critical-pm25') handleApplyScenario('critical-pm25', zoneId);
          else if (type === 'critical-pm10') handleApplyScenario('critical-pm10', zoneId);
        }}
      />

      <StandaloneExportModal
        isOpen={isStandaloneOpen}
        onClose={() => setIsStandaloneOpen(false)}
      />
    </div>
  );
}
