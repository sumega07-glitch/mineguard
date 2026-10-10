import { AlertSeverity, ThresholdSettings, ZoneId } from '../types';

export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  pm25Warning: 60,
  pm25Critical: 100,
  pm10Warning: 120,
  pm10Critical: 200,
};

export interface EvaluationResult {
  status: AlertSeverity;
  cause: 'pm25' | 'pm10' | 'both' | 'none';
  parameterLabel: 'PM2.5' | 'PM10' | 'PM2.5 & PM10' | 'Normal';
  exceededValue: number;
  thresholdCrossed: number;
  recommendation: string;
}

/**
 * Evaluates PM2.5 and PM10 values against configurable demo thresholds.
 * Rule: Check Critical first, then Warning, otherwise Normal.
 * Comparison: >= threshold per PRD test cases.
 */
export function evaluateReadings(
  pm25: number,
  pm10: number,
  thresholds: ThresholdSettings,
  zoneName?: string
): EvaluationResult {
  const isPm25Critical = pm25 >= thresholds.pm25Critical;
  const isPm10Critical = pm10 >= thresholds.pm10Critical;

  // 1. Check Critical First
  if (isPm25Critical || isPm10Critical) {
    let cause: 'pm25' | 'pm10' | 'both' = 'both';
    let parameterLabel: 'PM2.5' | 'PM10' | 'PM2.5 & PM10' = 'PM2.5 & PM10';
    let exceededValue = Math.max(pm25, pm10);
    let thresholdCrossed = thresholds.pm25Critical;

    if (isPm25Critical && !isPm10Critical) {
      cause = 'pm25';
      parameterLabel = 'PM2.5';
      exceededValue = pm25;
      thresholdCrossed = thresholds.pm25Critical;
    } else if (!isPm25Critical && isPm10Critical) {
      cause = 'pm10';
      parameterLabel = 'PM10';
      exceededValue = pm10;
      thresholdCrossed = thresholds.pm10Critical;
    } else {
      cause = 'both';
      parameterLabel = 'PM2.5 & PM10';
      exceededValue = Math.max(pm25, pm10);
      thresholdCrossed = pm25 >= thresholds.pm25Critical ? thresholds.pm25Critical : thresholds.pm10Critical;
    }

    return {
      status: 'critical',
      cause,
      parameterLabel,
      exceededValue: Math.round(exceededValue),
      thresholdCrossed,
      recommendation: getRecommendationText('critical', zoneName),
    };
  }

  // 2. Check Warning Next
  const isPm25Warning = pm25 >= thresholds.pm25Warning;
  const isPm10Warning = pm10 >= thresholds.pm10Warning;

  if (isPm25Warning || isPm10Warning) {
    let cause: 'pm25' | 'pm10' | 'both' = 'both';
    let parameterLabel: 'PM2.5' | 'PM10' | 'PM2.5 & PM10' = 'PM2.5 & PM10';
    let exceededValue = Math.max(pm25, pm10);
    let thresholdCrossed = thresholds.pm25Warning;

    if (isPm25Warning && !isPm10Warning) {
      cause = 'pm25';
      parameterLabel = 'PM2.5';
      exceededValue = pm25;
      thresholdCrossed = thresholds.pm25Warning;
    } else if (!isPm25Warning && isPm10Warning) {
      cause = 'pm10';
      parameterLabel = 'PM10';
      exceededValue = pm10;
      thresholdCrossed = thresholds.pm10Warning;
    } else {
      cause = 'both';
      parameterLabel = 'PM2.5 & PM10';
      exceededValue = Math.max(pm25, pm10);
      thresholdCrossed = pm25 >= thresholds.pm25Warning ? thresholds.pm25Warning : thresholds.pm10Warning;
    }

    return {
      status: 'warning',
      cause,
      parameterLabel,
      exceededValue: Math.round(exceededValue),
      thresholdCrossed,
      recommendation: getRecommendationText('warning', zoneName),
    };
  }

  // 3. Otherwise Normal
  return {
    status: 'normal',
    cause: 'none',
    parameterLabel: 'Normal',
    exceededValue: Math.max(pm25, pm10),
    thresholdCrossed: 0,
    recommendation: getRecommendationText('normal', zoneName),
  };
}

export function getRecommendationText(status: AlertSeverity, zoneName?: string): string {
  const prefix = zoneName ? `[${zoneName}] ` : '';
  switch (status) {
    case 'critical':
      return `${prefix}CRITICAL ACTION: Investigate emission source immediately. Inspect primary extraction hoods, activate secondary high-pressure dust suppression cannons, notify area safety supervisor, and restrict non-essential transit in this zone.`;
    case 'warning':
      return `${prefix}ADVISORY: Elevated particulate detection. Inspect dust-control measures (misting cannons and water curtains), verify conveyor skirting seals, and increase monitoring frequency.`;
    case 'normal':
    default:
      return `${prefix}ROUTINE: Environmental particulate levels are within simulated baseline demonstration targets. Continue standard perimeter monitoring and scheduled water-tanker sweeps.`;
  }
}

export function validateThresholds(t: ThresholdSettings): { valid: boolean; error?: string } {
  if (isNaN(t.pm25Warning) || isNaN(t.pm25Critical) || isNaN(t.pm10Warning) || isNaN(t.pm10Critical)) {
    return { valid: false, error: 'Threshold values must be valid numeric entries.' };
  }
  if (t.pm25Warning <= 0 || t.pm25Critical <= 0 || t.pm10Warning <= 0 || t.pm10Critical <= 0) {
    return { valid: false, error: 'All threshold limits must be greater than zero.' };
  }
  if (t.pm25Warning >= t.pm25Critical) {
    return {
      valid: false,
      error: `PM2.5 Warning (${t.pm25Warning} µg/m³) must be strictly lower than Critical (${t.pm25Critical} µg/m³).`,
    };
  }
  if (t.pm10Warning >= t.pm10Critical) {
    return {
      valid: false,
      error: `PM10 Warning (${t.pm10Warning} µg/m³) must be strictly lower than Critical (${t.pm10Critical} µg/m³).`,
    };
  }
  return { valid: true };
}
