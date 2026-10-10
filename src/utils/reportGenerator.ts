import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertRecord, HistoricalReading, ThresholdSettings, ZoneData } from '../types';

export interface ReportOptions {
  includeResolvedAlerts: boolean;
  includeTrendData: boolean;
  reportNotes?: string;
}

export function generateReportPDF(
  zones: ZoneData[],
  alerts: AlertRecord[],
  thresholds: ThresholdSettings,
  history: HistoricalReading[],
  options: ReportOptions = { includeResolvedAlerts: true, includeTrendData: true }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  const fileDateStr = now.toISOString().slice(0, 10);
  const fileTimeStr = now.toTimeString().slice(0, 5).replace(':', '');

  const hasCritical = zones.some((z) => z.status === 'critical');
  const hasWarning = zones.some((z) => z.status === 'warning');
  const siteStatus = hasCritical ? 'CRITICAL (ACTION REQUIRED)' : hasWarning ? 'WARNING (ADVISORY)' : 'NORMAL (BASELINE)';

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const alertsToInclude = options.includeResolvedAlerts ? alerts : activeAlerts;

  const avgPm25 = Math.round(zones.reduce((acc, z) => acc + z.pm25, 0) / (zones.length || 1));
  const avgPm10 = Math.round(zones.reduce((acc, z) => acc + z.pm10, 0) / (zones.length || 1));
  const peakPm25Zone = zones.reduce((prev, curr) => (curr.pm25 > prev.pm25 ? curr : prev), zones[0]);
  const peakPm10Zone = zones.reduce((prev, curr) => (curr.pm10 > prev.pm10 ? curr : prev), zones[0]);

  // --- Document Header ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('MINEGUARD', 14, 12);

  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text('SMART COAL MINE POLLUTION ALERT SYSTEM', 50, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`AUDIT REPORT GENERATED: ${dateStr} ${timeStr} | PROTOTYPE V1.0 MVP`, 14, 20);

  // --- Mandatory Demo Disclaimer Box ---
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 32, 182, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('DEMONSTRATION PROTOTYPE NOTICE:', 17, 36.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'All particulate metrics (PM2.5/PM10) are simulated. Thresholds are demonstration parameters, not certified regulatory limits.',
    17,
    41
  );

  let currentY = 48;

  // --- Executive Summary Box ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Site Status & Metric Summary', 14, currentY);
  currentY += 4;

  const statusColor = hasCritical ? [239, 68, 68] : hasWarning ? [245, 158, 11] : [16, 185, 129];
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CURRENT SITE STATUS:', 18, currentY + 6);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(siteStatus, 60, currentY + 6);

  doc.setTextColor(100, 116, 139);
  doc.text('ACTIVE UNACKNOWLEDGED ALERTS:', 18, currentY + 12);
  doc.setTextColor(15, 23, 42);
  doc.text(`${activeAlerts.length} event(s) requiring supervisor attention`, 72, currentY + 12);

  doc.setTextColor(100, 116, 139);
  doc.text('PM2.5 SITE AVERAGE / PEAK:', 18, currentY + 18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${avgPm25} µg/m³  (Peak: ${peakPm25Zone.pm25} µg/m³ in ${peakPm25Zone.name})`, 68, currentY + 18);

  doc.setTextColor(100, 116, 139);
  doc.text('PM10 SITE AVERAGE / PEAK:', 115, currentY + 18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${avgPm10} µg/m³  (Peak: ${peakPm10Zone.pm10} µg/m³ in ${peakPm10Zone.name})`, 160, currentY + 18);

  currentY += 28;

  // --- Section 2: Current Zone Snapshot Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Mine Zone Environmental Status Snapshot', 14, currentY);
  currentY += 2;

  const zoneTableBody = zones.map((z) => [
    z.code,
    z.name,
    z.status.toUpperCase(),
    `${z.pm25} µg/m³`,
    `${z.pm10} µg/m³`,
    z.dustSuppressionActive ? 'ACTIVE (Misting)' : 'STANDBY',
    `${z.windSpeedMps} m/s | ${z.temperatureC}°C | ${z.humidityPct}%`,
    z.equipment,
    z.lastUpdated,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Code', 'Zone Sector', 'Status', 'PM2.5', 'PM10', 'Suppression', 'Weather', 'Assigned Machinery', 'Updated']],
    body: zoneTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [248, 250, 252],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 15 },
      1: { fontStyle: 'bold', cellWidth: 26 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 27 },
      7: { cellWidth: 28 },
      8: { halign: 'center', cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = data.cell.raw as string;
        if (val === 'CRITICAL') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'WARNING') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- Section 3: Demonstration Thresholds Configuration ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Active Evaluation Thresholds', 14, currentY);
  currentY += 2;

  const thresholdBody = [
    ['PM2.5 Fine Dust', `${thresholds.pm25Warning} µg/m³`, `${thresholds.pm25Critical} µg/m³`, 'Check Critical first, then Warning, otherwise Normal.'],
    ['PM10 Coarse Dust', `${thresholds.pm10Warning} µg/m³`, `${thresholds.pm10Critical} µg/m³`, 'Triggers when particulate reading is >= configured threshold.'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Parameter', 'Warning Threshold', 'Critical Threshold', 'Evaluation Logic']],
    body: thresholdBody,
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 35 },
      3: { cellWidth: 77 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page overflow
  if (currentY > 210) {
    doc.addPage();
    currentY = 16;
  }

  // --- Section 4: Incident Log & Active Alerts ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Incident Log & Threshold Exceedance History (${alertsToInclude.length} items)`, 14, currentY);
  currentY += 2;

  if (alertsToInclude.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No active or historical threshold exceedances on record for this session.', 14, currentY + 4);
    currentY += 10;
  } else {
    const alertBody = alertsToInclude.slice(0, 15).map((a) => [
      a.timestamp,
      a.zoneName,
      a.parameter,
      `${a.reading} µg/m³`,
      `${a.thresholdCrossed} µg/m³`,
      a.severity.toUpperCase(),
      a.acknowledged ? 'Resolved' : 'Active',
      a.recommendation,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Time', 'Zone', 'Parameter', 'Reading', 'Limit', 'Severity', 'State', 'Operational Recommendation']],
      body: alertBody,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 6.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16 },
        1: { fontStyle: 'bold', cellWidth: 24 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 16 },
        4: { halign: 'right', cellWidth: 14 },
        5: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 14 },
        7: { cellWidth: 64 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.raw as string;
          if (val === 'CRITICAL') {
            data.cell.styles.textColor = [225, 29, 72];
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Section 5: Recent Trends & Time-series Sample ---
  if (options.includeTrendData && history.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('5. Recent Chronological Trend Samples (Last Readings)', 14, currentY);
    currentY += 2;

    const trendSlice = history.slice(-12);
    const trendBody = trendSlice.map((h) => {
      const zoneName = zones.find((z) => z.id === h.zoneId)?.name || h.zoneId;
      return [h.timeLabel, zoneName, `${h.pm25} µg/m³`, `${h.pm10} µg/m³`];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Time Sample', 'Mine Zone', 'PM2.5 Reading', 'PM10 Reading']],
      body: trendBody,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 7,
      },
      bodyStyles: {
        fontSize: 6.5,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', cellWidth: 40 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Footer Page Numbers & Compliance Notice ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MineGuard Prototype v1.0 | Page ${i} of ${pageCount} | Simulated environmental monitoring demonstration`,
      14,
      290
    );
  }

  // Save PDF
  doc.save(`MineGuard_Environmental_Audit_Report_${fileDateStr}_${fileTimeStr}.pdf`);
}

/**
 * Aggregates zone status, alerts, thresholds, and trends into a formatted CSV report
 */
export function generateReportCSV(
  zones: ZoneData[],
  alerts: AlertRecord[],
  thresholds: ThresholdSettings,
  history: HistoricalReading[],
  options: ReportOptions = { includeResolvedAlerts: true, includeTrendData: true }
): void {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);

  const hasCritical = zones.some((z) => z.status === 'critical');
  const hasWarning = zones.some((z) => z.status === 'warning');
  const siteStatus = hasCritical ? 'CRITICAL (ACTION REQUIRED)' : hasWarning ? 'WARNING (ADVISORY)' : 'NORMAL (BASELINE)';
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const alertsToInclude = options.includeResolvedAlerts ? alerts : activeAlerts;

  const avgPm25 = Math.round(zones.reduce((acc, z) => acc + z.pm25, 0) / (zones.length || 1));
  const avgPm10 = Math.round(zones.reduce((acc, z) => acc + z.pm10, 0) / (zones.length || 1));

  const lines: string[] = [];

  // Metadata & Notice
  lines.push('MINEGUARD - SMART COAL MINE POLLUTION ALERT SYSTEM');
  lines.push('COMPREHENSIVE ENVIRONMENTAL AUDIT & TELEMETRY REPORT');
  lines.push(`Generated On,${dateStr} ${timeStr}`);
  lines.push('Report Type,Simulated Demonstration Audit Snapshot');
  lines.push('Notice,"All data is simulated. Status thresholds are demonstration values, not certified regulatory limits."');
  lines.push('');

  // Section 1: Executive Summary
  lines.push('=== 1. EXECUTIVE SITE SUMMARY ===');
  lines.push(`Site Condition,${siteStatus}`);
  lines.push(`Active Unacknowledged Alerts,${activeAlerts.length}`);
  lines.push(`Total Incident History Count,${alerts.length}`);
  lines.push(`Site Average PM2.5 (ug/m3),${avgPm25}`);
  lines.push(`Site Average PM10 (ug/m3),${avgPm10}`);
  lines.push(`PM2.5 Warning Limit,${thresholds.pm25Warning}`);
  lines.push(`PM2.5 Critical Limit,${thresholds.pm25Critical}`);
  lines.push(`PM10 Warning Limit,${thresholds.pm10Warning}`);
  lines.push(`PM10 Critical Limit,${thresholds.pm10Critical}`);
  lines.push('');

  // Section 2: Mine Zones Snapshot
  lines.push('=== 2. CURRENT MINE ZONE ENVIRONMENTAL SNAPSHOT ===');
  lines.push('Zone Code,Zone Name,Status,PM2.5 (ug/m3),PM10 (ug/m3),Suppression Active,Wind (m/s),Temp (C),Humidity (%),Equipment,Last Updated');
  zones.forEach((z) => {
    lines.push(
      `"${z.code}","${z.name}","${z.status.toUpperCase()}",${z.pm25},${z.pm10},"${z.dustSuppressionActive ? 'YES' : 'NO'}",${z.windSpeedMps},${z.temperatureC},${z.humidityPct},"${z.equipment.replace(/"/g, '""')}","${z.lastUpdated}"`
    );
  });
  lines.push('');

  // Section 3: Active and Historical Alerts
  lines.push('=== 3. ALERT & INCIDENT LOG ===');
  lines.push('Alert ID,Timestamp,Zone Name,Parameter,Reading (ug/m3),Threshold Crossed,Severity,Status,Recommendation');
  if (alertsToInclude.length === 0) {
    lines.push('No alerts recorded for this period');
  } else {
    alertsToInclude.forEach((a) => {
      lines.push(
        `"${a.id}","${a.timestamp}","${a.zoneName}","${a.parameter}",${a.reading},${a.thresholdCrossed},"${a.severity.toUpperCase()}","${a.acknowledged ? 'RESOLVED' : 'ACTIVE'}","${a.recommendation.replace(/"/g, '""')}"`
      );
    });
  }
  lines.push('');

  // Section 4: Recent Trend Historical Telemetry
  if (options.includeTrendData && history.length > 0) {
    lines.push('=== 4. RECENT TELEMETRY SAMPLES ===');
    lines.push('Sample ID,Timestamp,Time Label,Zone ID,Zone Name,PM2.5 (ug/m3),PM10 (ug/m3)');
    history.slice(-30).forEach((h) => {
      const zName = zones.find((z) => z.id === h.zoneId)?.name || h.zoneId;
      lines.push(`"${h.id}","${h.timestamp}","${h.timeLabel}","${h.zoneId}","${zName}",${h.pm25},${h.pm10}`);
    });
    lines.push('');
  }

  // Trigger download
  const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MineGuard_Comprehensive_Report_${dateStr}_${now.toTimeString().slice(0, 5).replace(':', '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
