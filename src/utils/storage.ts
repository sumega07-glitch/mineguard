import { AlertRecord, HistoricalReading, ThresholdSettings, ZoneData } from '../types';
import { DEFAULT_THRESHOLDS, evaluateReadings } from './thresholds';

const THRESHOLDS_KEY = 'mineguard_thresholds_v1';
const ALERTS_KEY = 'mineguard_alerts_v1';
const HISTORY_KEY = 'mineguard_history_v1';

export function loadThresholds(): ThresholdSettings {
  try {
    const raw = localStorage.getItem(THRESHOLDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.pm25Warning === 'number' &&
        typeof parsed.pm25Critical === 'number' &&
        typeof parsed.pm10Warning === 'number' &&
        typeof parsed.pm10Critical === 'number'
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved thresholds from localStorage', e);
  }
  return DEFAULT_THRESHOLDS;
}

export function saveThresholds(thresholds: ThresholdSettings): void {
  try {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
  } catch (e) {
    console.error('Failed to save thresholds to localStorage', e);
  }
}

export function loadAlerts(): AlertRecord[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse alerts from localStorage', e);
  }
  return [];
}

export function saveAlerts(alerts: AlertRecord[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save alerts to localStorage', e);
  }
}

export function loadHistoricalReadings(): HistoricalReading[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse history from localStorage', e);
  }
  return [];
}

export function saveHistoricalReadings(readings: HistoricalReading[]): void {
  try {
    // Keep last 150 points for trend clarity
    localStorage.setItem(HISTORY_KEY, JSON.stringify(readings.slice(-150)));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function getInitialZones(thresholds: ThresholdSettings): ZoneData[] {
  const now = new Date();
  const formatTime = (minutesAgo: number) => {
    const d = new Date(now.getTime() - minutesAgo * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const rawZones: Omit<ZoneData, 'status' | 'statusCause'>[] = [
    {
      id: 'mining',
      name: 'Mining Area',
      code: 'ZONE-01',
      description: 'Open-pit coal extraction face & excavator pit bench #3',
      pm25: 75,
      pm10: 135,
      lastUpdated: formatTime(1),
      equipment: 'Excavator EX-3400, Haul Truck CAT-789D',
      dustSuppressionActive: true,
      windSpeedMps: 4.2,
      temperatureC: 28,
      humidityPct: 38,
    },
    {
      id: 'crushing',
      name: 'Crushing Area',
      code: 'ZONE-02',
      description: 'Primary jaw crusher & vibratory screening circuit',
      pm25: 118,
      pm10: 215,
      lastUpdated: formatTime(0),
      equipment: 'Nordberg C160 Jaw Crusher, Feeder F-02',
      dustSuppressionActive: false,
      windSpeedMps: 2.1,
      temperatureC: 32,
      humidityPct: 30,
    },
    {
      id: 'transportation',
      name: 'Transportation Area',
      code: 'ZONE-03',
      description: 'Main arterial haulage corridor & truck weighbridge bypass',
      pm25: 42,
      pm10: 88,
      lastUpdated: formatTime(2),
      equipment: 'Haul Fleet Corridor, Komatsu HD785-7',
      dustSuppressionActive: true,
      windSpeedMps: 5.8,
      temperatureC: 27,
      humidityPct: 44,
    },
    {
      id: 'storage',
      name: 'Storage Area',
      code: 'ZONE-04',
      description: 'Run-of-Mine (ROM) coal stockyard & reclaimer reclaim belt',
      pm25: 26,
      pm10: 58,
      lastUpdated: formatTime(3),
      equipment: 'Stacker-Reclaimer SR-1, Conveyor Belt CV-104',
      dustSuppressionActive: false,
      windSpeedMps: 3.4,
      temperatureC: 26,
      humidityPct: 50,
    },
  ];

  return rawZones.map((z) => {
    const evaluation = evaluateReadings(z.pm25, z.pm10, thresholds, z.name);
    return {
      ...z,
      status: evaluation.status,
      statusCause: evaluation.cause,
    };
  });
}
