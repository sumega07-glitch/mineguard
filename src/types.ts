export type ZoneId = 'mining' | 'crushing' | 'transportation' | 'storage';

export type AlertSeverity = 'normal' | 'warning' | 'critical';

export interface ZoneData {
  id: ZoneId;
  name: string;
  code: string;
  description: string;
  pm25: number;
  pm10: number;
  status: AlertSeverity;
  statusCause?: 'pm25' | 'pm10' | 'both' | 'none';
  lastUpdated: string;
  equipment: string;
  dustSuppressionActive: boolean;
  windSpeedMps: number;
  temperatureC: number;
  humidityPct: number;
}

export interface ThresholdSettings {
  pm25Warning: number;
  pm25Critical: number;
  pm10Warning: number;
  pm10Critical: number;
}

export interface AlertRecord {
  id: string;
  zoneId: ZoneId;
  zoneName: string;
  parameter: 'PM2.5' | 'PM10' | 'PM2.5 & PM10';
  reading: number;
  thresholdCrossed: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  recommendation: string;
}

export interface HistoricalReading {
  id: string;
  timestamp: string;
  timeLabel: string;
  zoneId: ZoneId;
  pm25: number;
  pm10: number;
}

export interface FilterState {
  zone: 'all' | ZoneId;
  severity: 'all' | 'warning' | 'critical' | 'normal';
  timeRange: '1h' | '6h' | '24h' | 'all';
}
