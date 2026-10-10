import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ThresholdSettings, ZoneData } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ZoneComparisonChartProps {
  zones: ZoneData[];
  thresholds: ThresholdSettings;
  onSelectZone?: (zoneId: ZoneData['id']) => void;
}

export const ZoneComparisonChart: React.FC<ZoneComparisonChartProps> = ({
  zones,
  thresholds,
  onSelectZone,
}) => {
  const labels = zones.map((z) => z.name.replace(' Area', ''));
  const pm25Values = zones.map((z) => z.pm25);
  const pm10Values = zones.map((z) => z.pm10);

  // Dynamic bar colors based on thresholds
  const pm25Colors = zones.map((z) =>
    z.pm25 >= thresholds.pm25Critical
      ? '#f43f5e'
      : z.pm25 >= thresholds.pm25Warning
      ? '#f59e0b'
      : '#38bdf8'
  );

  const pm10Colors = zones.map((z) =>
    z.pm10 >= thresholds.pm10Critical
      ? '#e11d48'
      : z.pm10 >= thresholds.pm10Warning
      ? '#d97706'
      : '#fbbf24'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'PM2.5 (Fine)',
        data: pm25Values,
        backgroundColor: pm25Colors,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      },
      {
        label: 'PM10 (Coarse)',
        data: pm10Values,
        backgroundColor: pm10Colors,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11, weight: 'bold' },
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-['Chakra_Petch',sans-serif] text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Zone Cross-Comparison</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              4 Zones
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative particulate loading across all active mine sectors.
          </p>
        </div>
      </div>

      <div className="h-64 w-full relative">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
