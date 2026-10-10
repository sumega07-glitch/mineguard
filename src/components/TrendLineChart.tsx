import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HistoricalReading, ThresholdSettings, ZoneId } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendLineChartProps {
  history: HistoricalReading[];
  thresholds: ThresholdSettings;
  selectedZone: 'all' | ZoneId;
  onSelectZone: (zone: 'all' | ZoneId) => void;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  history,
  thresholds,
  selectedZone,
  onSelectZone,
}) => {
  const [metricFilter, setMetricFilter] = useState<'both' | 'pm25' | 'pm10'>('both');

  // Filter history points according to selected zone
  // If 'all', compute average per timestamp slice
  let filteredHistory: { timeLabel: string; pm25: number; pm10: number }[] = [];

  if (selectedZone !== 'all') {
    filteredHistory = history
      .filter((h) => h.zoneId === selectedZone)
      .slice(-15);
  } else {
    // Group by timestamp slice or take last 15 ticks averaged
    const grouped = new Map<string, { pm25Sum: number; pm10Sum: number; count: number; timeLabel: string }>();
    history.forEach((h) => {
      const existing = grouped.get(h.timestamp) || {
        pm25Sum: 0,
        pm10Sum: 0,
        count: 0,
        timeLabel: h.timeLabel,
      };
      existing.pm25Sum += h.pm25;
      existing.pm10Sum += h.pm10;
      existing.count += 1;
      grouped.set(h.timestamp, existing);
    });

    filteredHistory = Array.from(grouped.values())
      .slice(-15)
      .map((g) => ({
        timeLabel: g.timeLabel,
        pm25: Math.round(g.pm25Sum / (g.count || 1)),
        pm10: Math.round(g.pm10Sum / (g.count || 1)),
      }));
  }

  // Fallback if empty history
  if (filteredHistory.length === 0) {
    filteredHistory = [
      { timeLabel: 'Now', pm25: 45, pm10: 95 },
    ];
  }

  const labels = filteredHistory.map((d) => d.timeLabel);
  const pm25Data = filteredHistory.map((d) => d.pm25);
  const pm10Data = filteredHistory.map((d) => d.pm10);

  // Threshold baseline lines for visual context
  const pm25WarnLine = filteredHistory.map(() => thresholds.pm25Warning);
  const pm25CritLine = filteredHistory.map(() => thresholds.pm25Critical);

  const datasets: any[] = [];

  if (metricFilter === 'both' || metricFilter === 'pm25') {
    datasets.push({
      label: 'PM2.5 (Fine Dust)',
      data: pm25Data,
      borderColor: '#38bdf8', // sky-400
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 3.5,
      pointBackgroundColor: '#38bdf8',
      fill: true,
    });
  }

  if (metricFilter === 'both' || metricFilter === 'pm10') {
    datasets.push({
      label: 'PM10 (Coarse Dust)',
      data: pm10Data,
      borderColor: '#fbbf24', // amber-400
      backgroundColor: 'rgba(251, 191, 36, 0.08)',
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 3.5,
      pointBackgroundColor: '#fbbf24',
      fill: true,
    });
  }

  // Threshold guideline dashed datasets
  if (metricFilter === 'pm25' || metricFilter === 'both') {
    datasets.push({
      label: `PM2.5 Warn Limit (${thresholds.pm25Warning})`,
      data: pm25WarnLine,
      borderColor: 'rgba(245, 158, 11, 0.6)',
      borderWidth: 1.5,
      borderDash: [5, 4],
      pointRadius: 0,
      fill: false,
    });
    datasets.push({
      label: `PM2.5 Crit Limit (${thresholds.pm25Critical})`,
      data: pm25CritLine,
      borderColor: 'rgba(239, 68, 68, 0.7)',
      borderWidth: 1.5,
      borderDash: [3, 3],
      pointRadius: 0,
      fill: false,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} µg/m³`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10 },
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (value) => `${value} µg`,
        },
      },
    },
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div>
          <h3 className="font-['Chakra_Petch',sans-serif] text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pollution Trend Over Time</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              Live Stream
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulated chronological particulate concentrations with demo threshold thresholds.
          </p>
        </div>

        {/* View / Filter Segmented buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => onSelectZone(e.target.value as any)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">Site Average (All Zones)</option>
            <option value="mining">Mining Area</option>
            <option value="crushing">Crushing Area</option>
            <option value="transportation">Transportation Area</option>
            <option value="storage">Storage Area</option>
          </select>

          {/* Metric toggle */}
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-[11px]">
            <button
              onClick={() => setMetricFilter('both')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                metricFilter === 'both' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setMetricFilter('pm25')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                metricFilter === 'pm25' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              PM2.5
            </button>
            <button
              onClick={() => setMetricFilter('pm10')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                metricFilter === 'pm10' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              PM10
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full relative">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
