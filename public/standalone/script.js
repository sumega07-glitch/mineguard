/**
 * MineGuard - Smart Coal Mine Pollution Alert System
 * Standalone Client-Side Application Logic
 * Supports Chart.js with automatic Offline SVG Fallback
 */

(function () {
  const DEFAULT_THRESHOLDS = {
    pm25Warning: 60,
    pm25Critical: 100,
    pm10Warning: 120,
    pm10Critical: 200,
  };

  const STORAGE_KEYS = {
    THRESHOLDS: 'mg_standalone_thresholds_v2',
    ALERTS: 'mg_standalone_alerts_v2',
  };

  let thresholds = loadThresholds();
  let autoSimulate = true;
  let timerId = null;
  let currentZoneFilter = 'all';
  let currentStatusFilter = 'all';
  let trendZoneSelection = 'all';

  function formatTime(minutesAgo = 0) {
    const d = new Date(Date.now() - minutesAgo * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  let zones = [
    {
      id: 'mining',
      name: 'Mining Area',
      code: 'ZONE-01',
      description: 'Open-pit coal extraction face & excavator pit bench #3',
      pm25: 75,
      pm10: 135,
      equipment: 'Excavator EX-3400, CAT-789D',
      misting: true,
      wind: 4.2,
      temp: 28,
      humidity: 38,
      lastUpdated: formatTime(1),
    },
    {
      id: 'crushing',
      name: 'Crushing Area',
      code: 'ZONE-02',
      description: 'Primary jaw crusher & vibratory screening circuit',
      pm25: 118,
      pm10: 215,
      equipment: 'Nordberg C160 Jaw Crusher, Feeder F-02',
      misting: false,
      wind: 2.1,
      temp: 32,
      humidity: 30,
      lastUpdated: formatTime(0),
    },
    {
      id: 'transportation',
      name: 'Transportation Area',
      code: 'ZONE-03',
      description: 'Main arterial haulage corridor & truck weighbridge bypass',
      pm25: 42,
      pm10: 88,
      equipment: 'Haul Fleet Corridor, Komatsu HD785-7',
      misting: true,
      wind: 5.8,
      temp: 27,
      humidity: 44,
      lastUpdated: formatTime(2),
    },
    {
      id: 'storage',
      name: 'Storage Area',
      code: 'ZONE-04',
      description: 'Run-of-Mine (ROM) coal stockyard & reclaimer reclaim belt',
      pm25: 26,
      pm10: 58,
      equipment: 'Stacker-Reclaimer SR-1, Conveyor CV-104',
      misting: false,
      wind: 3.4,
      temp: 26,
      humidity: 50,
      lastUpdated: formatTime(3),
    },
  ];

  let alerts = loadAlerts();
  if (!alerts || alerts.length === 0) {
    alerts = [
      {
        id: 'init-1',
        timestamp: formatTime(0),
        zoneId: 'crushing',
        zoneName: 'Crushing Area',
        parameter: 'PM2.5 & PM10',
        reading: 215,
        thresholdCrossed: 200,
        severity: 'critical',
        acknowledged: false,
        recommendation: 'CRITICAL ACTION: Investigate emission source immediately. Inspect primary extraction hoods, activate secondary high-pressure dust suppression cannons.',
      },
      {
        id: 'init-2',
        timestamp: formatTime(1),
        zoneId: 'mining',
        zoneName: 'Mining Area',
        parameter: 'PM2.5',
        reading: 75,
        thresholdCrossed: 60,
        severity: 'warning',
        acknowledged: false,
        recommendation: 'ADVISORY: Elevated particulate detection. Inspect dust-control measures (misting cannons and water curtains).',
      },
    ];
  }

  let historyPoints = [];
  const initialNow = Date.now();
  for (let i = 10; i >= 0; i--) {
    const t = new Date(initialNow - i * 30000);
    const timeLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    zones.forEach((z) => {
      historyPoints.push({
        timeLabel,
        zoneId: z.id,
        pm25: Math.round(z.pm25 + Math.sin(i) * 6),
        pm10: Math.round(z.pm10 + Math.cos(i) * 10),
      });
    });
  }

  let trendChart = null;
  let comparisonChart = null;
  let chartJsAvailable = typeof window.Chart !== 'undefined';

  function loadThresholds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { ...DEFAULT_THRESHOLDS };
  }

  function saveThresholds(t) {
    try {
      localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(t));
    } catch (e) {}
  }

  function loadAlerts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveAlerts(a) {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(a.slice(0, 80)));
    } catch (e) {}
  }

  function evaluateReadings(pm25, pm10, zoneName) {
    const isPm25Crit = pm25 >= thresholds.pm25Critical;
    const isPm10Crit = pm10 >= thresholds.pm10Critical;

    if (isPm25Crit || isPm10Crit) {
      const param = isPm25Crit && isPm10Crit ? 'PM2.5 & PM10' : isPm25Crit ? 'PM2.5' : 'PM10';
      const exceeded = isPm25Crit && !isPm10Crit ? pm25 : !isPm25Crit && isPm10Crit ? pm10 : Math.max(pm25, pm10);
      const crossed = isPm25Crit ? thresholds.pm25Critical : thresholds.pm10Critical;
      return {
        status: 'critical',
        parameter: param,
        reading: exceeded,
        thresholdCrossed: crossed,
        recommendation: `CRITICAL ACTION [${zoneName}]: Investigate emission source immediately. Inspect extraction hoods, activate secondary cannons.`,
      };
    }

    const isPm25Warn = pm25 >= thresholds.pm25Warning;
    const isPm10Warn = pm10 >= thresholds.pm10Warning;

    if (isPm25Warn || isPm10Warn) {
      const param = isPm25Warn && isPm10Warn ? 'PM2.5 & PM10' : isPm25Warn ? 'PM2.5' : 'PM10';
      const exceeded = isPm25Warn && !isPm10Warn ? pm25 : !isPm25Warn && isPm10Warn ? pm10 : Math.max(pm25, pm10);
      const crossed = isPm25Warn ? thresholds.pm25Warning : thresholds.pm10Warning;
      return {
        status: 'warning',
        parameter: param,
        reading: exceeded,
        thresholdCrossed: crossed,
        recommendation: `ADVISORY [${zoneName}]: Elevated particulate detection. Inspect misting cannons, verify conveyor seals.`,
      };
    }

    return {
      status: 'normal',
      parameter: 'Normal',
      reading: Math.max(pm25, pm10),
      thresholdCrossed: 0,
      recommendation: `ROUTINE [${zoneName}]: Particulate concentration within baseline demonstration targets.`,
    };
  }

  function simulateTick(manual = false) {
    const nowStr = formatTime(0);
    const newAlerts = [];

    zones.forEach((z) => {
      const prevEval = evaluateReadings(z.pm25, z.pm10, z.name);
      let dPm25 = (Math.random() - 0.48) * 8;
      let dPm10 = (Math.random() - 0.48) * 14;
      if (z.misting) {
        dPm25 -= 3;
        dPm10 -= 6;
      }

      z.pm25 = Math.max(12, Math.min(220, Math.round(z.pm25 + dPm25)));
      z.pm10 = Math.max(25, Math.min(380, Math.round(z.pm10 + dPm10)));
      z.lastUpdated = nowStr;

      const newEval = evaluateReadings(z.pm25, z.pm10, z.name);
      const escalated =
        (newEval.status === 'critical' && prevEval.status !== 'critical') ||
        (newEval.status === 'warning' && prevEval.status === 'normal');

      if (escalated) {
        newAlerts.push({
          id: `alt-${Date.now()}-${z.id}`,
          timestamp: nowStr,
          zoneId: z.id,
          zoneName: z.name,
          parameter: newEval.parameter,
          reading: newEval.reading,
          thresholdCrossed: newEval.thresholdCrossed,
          severity: newEval.status,
          acknowledged: false,
          recommendation: newEval.recommendation,
        });
      }

      historyPoints.push({
        timeLabel: nowStr,
        zoneId: z.id,
        pm25: z.pm25,
        pm10: z.pm10,
      });
    });

    if (historyPoints.length > 100) historyPoints = historyPoints.slice(-100);
    if (newAlerts.length > 0) {
      alerts = [...newAlerts, ...alerts].slice(0, 60);
      saveAlerts(alerts);
    }

    renderAll();
  }

  function applyScenario(preset) {
    const nowStr = formatTime(0);
    let tPm25 = 25;
    let tPm10 = 60;

    if (preset === 'normal') {
      tPm25 = 25;
      tPm10 = 60;
    } else if (preset === 'warning-pm25') {
      tPm25 = 75;
      tPm10 = 85;
    } else if (preset === 'critical-pm25') {
      tPm25 = 125;
      tPm10 = 145;
    } else if (preset === 'critical-pm10') {
      tPm25 = 85;
      tPm10 = 230;
    } else if (preset === 'boundary') {
      tPm25 = thresholds.pm25Warning;
      tPm10 = thresholds.pm10Warning;
    }

    const newAlerts = [];
    zones.forEach((z) => {
      z.pm25 = tPm25;
      z.pm10 = tPm10;
      z.lastUpdated = nowStr;

      const evalRes = evaluateReadings(z.pm25, z.pm10, z.name);
      if (evalRes.status !== 'normal') {
        newAlerts.push({
          id: `scen-${Date.now()}-${z.id}`,
          timestamp: nowStr,
          zoneId: z.id,
          zoneName: z.name,
          parameter: evalRes.parameter,
          reading: evalRes.reading,
          thresholdCrossed: evalRes.thresholdCrossed,
          severity: evalRes.status,
          acknowledged: false,
          recommendation: evalRes.recommendation,
        });
      }
      historyPoints.push({ timeLabel: nowStr, zoneId: z.id, pm25: z.pm25, pm10: z.pm10 });
    });

    if (newAlerts.length > 0) {
      alerts = [...newAlerts, ...alerts].slice(0, 60);
      saveAlerts(alerts);
    }
    renderAll();
  }

  function renderAll() {
    try { renderSummary(); } catch (e) { console.error('Error renderSummary', e); }
    try { renderZones(); } catch (e) { console.error('Error renderZones', e); }
    try { renderRecommendations(); } catch (e) { console.error('Error renderRecommendations', e); }
    try { renderAlerts(); } catch (e) { console.error('Error renderAlerts', e); }
    try { updateCharts(); } catch (e) { console.error('Error updateCharts', e); }
  }

  function renderSummary() {
    const evals = zones.map((z) => evaluateReadings(z.pm25, z.pm10, z.name));
    const hasCrit = evals.some((e) => e.status === 'critical');
    const hasWarn = evals.some((e) => e.status === 'warning');
    const siteStatus = hasCrit ? 'critical' : hasWarn ? 'warning' : 'normal';

    const card = document.getElementById('siteStatusCard');
    const badge = document.getElementById('siteStatusBadge');
    const heading = document.getElementById('siteStatusHeading');
    const sub = document.getElementById('siteStatusSubtitle');

    if (card) card.className = `card summary-card status-${siteStatus}`;
    if (badge) {
      badge.className = `status-badge badge-${siteStatus}`;
      badge.textContent = siteStatus.toUpperCase();
    }

    if (heading) {
      heading.textContent =
        siteStatus === 'critical'
          ? 'ACTION REQUIRED'
          : siteStatus === 'warning'
          ? 'ATTENTION ADVISORY'
          : 'CONDITIONS NORMAL';
    }
    if (sub) {
      sub.textContent =
        siteStatus === 'critical'
          ? `${evals.filter((e) => e.status === 'critical').length} sector(s) exceeding critical limits`
          : siteStatus === 'warning'
          ? `${evals.filter((e) => e.status === 'warning').length} sector(s) in warning state`
          : 'All 4 sectors within target demo limits';
    }

    const unackEl = document.getElementById('activeAlertCount');
    if (unackEl) unackEl.textContent = alerts.filter((a) => !a.acknowledged).length;

    const avgPm25 = Math.round(zones.reduce((a, b) => a + b.pm25, 0) / zones.length);
    const avgPm10 = Math.round(zones.reduce((a, b) => a + b.pm10, 0) / zones.length);
    const peakPm25 = zones.reduce((p, c) => (c.pm25 > p.pm25 ? c : p), zones[0]);
    const peakPm10 = zones.reduce((p, c) => (c.pm10 > p.pm10 ? c : p), zones[0]);

    const avgPm25El = document.getElementById('avgPm25Val');
    const peakPm25El = document.getElementById('peakPm25Val');
    const peakPm25ZoneEl = document.getElementById('peakPm25Zone');
    if (avgPm25El) avgPm25El.textContent = avgPm25;
    if (peakPm25El) peakPm25El.textContent = peakPm25.pm25;
    if (peakPm25ZoneEl) peakPm25ZoneEl.textContent = `Highest: ${peakPm25.name}`;

    const avgPm10El = document.getElementById('avgPm10Val');
    const peakPm10El = document.getElementById('peakPm10Val');
    const peakPm10ZoneEl = document.getElementById('peakPm10Zone');
    if (avgPm10El) avgPm10El.textContent = avgPm10;
    if (peakPm10El) peakPm10El.textContent = peakPm10.pm10;
    if (peakPm10ZoneEl) peakPm10ZoneEl.textContent = `Highest: ${peakPm10.name}`;

    const pm25Lim = document.getElementById('pm25LimitsLabel');
    const pm10Lim = document.getElementById('pm10LimitsLabel');
    if (pm25Lim) pm25Lim.textContent = `Limit: ${thresholds.pm25Warning}/${thresholds.pm25Critical}`;
    if (pm10Lim) pm10Lim.textContent = `Limit: ${thresholds.pm10Warning}/${thresholds.pm10Critical}`;
  }

  function renderZones() {
    const container = document.getElementById('zonesContainer');
    if (!container) return;

    const filtered = zones.filter((z) => {
      const evalRes = evaluateReadings(z.pm25, z.pm10, z.name);
      if (currentZoneFilter !== 'all' && z.id !== currentZoneFilter) return false;
      if (currentStatusFilter !== 'all' && evalRes.status !== currentStatusFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-placeholder">No sectors match your current filters.</div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach((zone) => {
      const ev = evaluateReadings(zone.pm25, zone.pm10, zone.name);
      const pm25Pct = Math.min(100, Math.round((zone.pm25 / (thresholds.pm25Critical * 1.4)) * 100));
      const pm10Pct = Math.min(100, Math.round((zone.pm10 / (thresholds.pm10Critical * 1.4)) * 100));

      const card = document.createElement('div');
      card.className = `card zone-card status-${ev.status}`;
      card.innerHTML = `
        <div class="zone-card-top">
          <div class="zone-code-row">
            <span class="zone-code">${zone.code} · ${zone.lastUpdated}</span>
            <span class="status-badge badge-${ev.status}">${ev.status.toUpperCase()}</span>
          </div>
          <div class="zone-name">${zone.name}</div>
          <div class="zone-desc">${zone.description}</div>

          <div class="gauges-container">
            <div class="gauge-item">
              <div class="gauge-header">
                <span class="gauge-label">PM2.5 (Fine Dust)</span>
                <span class="gauge-val font-mono">${zone.pm25} µg/m³</span>
              </div>
              <div class="gauge-track">
                <div class="gauge-fill fill-${ev.status}" style="width: ${pm25Pct}%"></div>
              </div>
              <div class="gauge-limits">
                <span>0</span>
                <span>Warn: ${thresholds.pm25Warning}</span>
                <span>Crit: ${thresholds.pm25Critical}</span>
              </div>
            </div>

            <div class="gauge-item">
              <div class="gauge-header">
                <span class="gauge-label">PM10 (Coarse Dust)</span>
                <span class="gauge-val font-mono">${zone.pm10} µg/m³</span>
              </div>
              <div class="gauge-track">
                <div class="gauge-fill fill-${ev.status}" style="width: ${pm10Pct}%"></div>
              </div>
              <div class="gauge-limits">
                <span>0</span>
                <span>Warn: ${thresholds.pm10Warning}</span>
                <span>Crit: ${thresholds.pm10Critical}</span>
              </div>
            </div>
          </div>

          <div class="zone-weather">
            <div>💨 ${zone.wind} m/s</div>
            <div>🌡️ ${zone.temp}°C</div>
            <div>💧 ${zone.humidity}% RH</div>
          </div>
        </div>

        <div class="zone-footer">
          <button class="btn-misting ${zone.misting ? 'active' : ''}" data-toggle-misting="${zone.id}">
            💧 ${zone.misting ? 'Misting: ON' : 'Misting: OFF'}
          </button>
          <span style="font-size: 10.5px; color: var(--text-dim);">${zone.equipment}</span>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-toggle-misting]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-misting');
        const target = zones.find((z) => z.id === id);
        if (target) {
          target.misting = !target.misting;
          target.pm25 = target.misting ? Math.round(target.pm25 * 0.75) : Math.round(target.pm25 * 1.25);
          target.pm10 = target.misting ? Math.round(target.pm10 * 0.72) : Math.round(target.pm10 * 1.3);
          renderAll();
        }
      });
    });
  }

  function renderRecommendations() {
    const container = document.getElementById('recsContainer');
    if (!container) return;

    const overallEv = zones.map((z) => evaluateReadings(z.pm25, z.pm10, z.name));
    const hasCrit = overallEv.some((e) => e.status === 'critical');
    const hasWarn = overallEv.some((e) => e.status === 'warning');
    const siteState = hasCrit ? 'critical' : hasWarn ? 'warning' : 'normal';

    const overallBadge = document.getElementById('recsOverallBadge');
    if (overallBadge) {
      overallBadge.className = `status-badge badge-${siteState}`;
      overallBadge.textContent =
        siteState === 'critical'
          ? 'ACTION REQUIRED'
          : siteState === 'warning'
          ? 'SITE ADVISORY'
          : 'STANDARD ROUTINE';
    }

    container.innerHTML = '';
    zones.forEach((zone) => {
      const ev = evaluateReadings(zone.pm25, zone.pm10, zone.name);
      let action = 'Maintain baseline perimeter misting and scheduled water tanker sweeps.';
      if (ev.status === 'critical') {
        action = 'CRITICAL: Halt heavy excavation/crushing; activate secondary cannons; notify site safety officer.';
      } else if (ev.status === 'warning') {
        action = 'ADVISORY: Inspect water spray nozzles; ensure conveyor rubber skirts sealed; increase cycle frequency.';
      }

      const box = document.createElement('div');
      box.className = 'rec-box';
      box.innerHTML = `
        <div class="rec-box-header">
          <span class="rec-box-title">${zone.name} (${zone.code})</span>
          <span class="status-badge badge-${ev.status}">${ev.status.toUpperCase()}</span>
        </div>
        <ul>
          <li>${action}</li>
          <li style="color: var(--text-dim); font-size: 10.5px;">Assigned Gear: ${zone.equipment}</li>
        </ul>
      `;
      container.appendChild(box);
    });
  }

  function renderAlerts() {
    const list = document.getElementById('alertsListContainer');
    if (!list) return;

    const searchInput = document.getElementById('alertSearchInput');
    const zoneSelect = document.getElementById('alertFilterZone');
    const sevSelect = document.getElementById('alertFilterSeverity');

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    const zoneVal = zoneSelect ? zoneSelect.value : 'all';
    const sevVal = sevSelect ? sevSelect.value : 'all';

    const filtered = alerts.filter((a) => {
      if (zoneVal !== 'all' && a.zoneId !== zoneVal) return false;
      if (sevVal !== 'all' && a.severity !== sevVal) return false;
      if (searchVal) {
        const str = `${a.zoneName} ${a.parameter} ${a.recommendation} ${a.severity}`.toLowerCase();
        if (!str.includes(searchVal)) return false;
      }
      return true;
    });

    const countTag = document.getElementById('alertsCountTag');
    if (countTag) countTag.textContent = `${filtered.length} shown / ${alerts.length} total`;

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-placeholder">No alerts found matching current filters.</div>';
      return;
    }

    list.innerHTML = '';
    filtered.forEach((alert) => {
      const row = document.createElement('div');
      row.className = `alert-row ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`;
      row.innerHTML = `
        <div>
          <div class="alert-meta">
            <span class="status-badge badge-${alert.severity}">${alert.severity.toUpperCase()}</span>
            <span class="alert-zone">${alert.zoneName}</span>
            <span class="font-mono text-dim" style="font-size: 11px;">${alert.parameter}: <strong>${alert.reading} µg/m³</strong> (limit was ${alert.thresholdCrossed})</span>
          </div>
          <div class="alert-desc">${alert.recommendation}</div>
          <div class="alert-time">⏱️ ${alert.timestamp} ${alert.acknowledged ? '· [Acknowledged]' : ''}</div>
        </div>
        <div>
          ${
            !alert.acknowledged
              ? `<button class="btn btn-sm btn-secondary" data-ack="${alert.id}">✓ Acknowledge</button>`
              : `<span class="font-mono text-dim" style="font-size: 10px;">Resolved</span>`
          }
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('[data-ack]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-ack');
        const found = alerts.find((a) => a.id === id);
        if (found) {
          found.acknowledged = true;
          saveAlerts(alerts);
          renderAll();
        }
      });
    });
  }

  // --- Chart Setup & Offline Fallbacks ---
  function initCharts() {
    chartJsAvailable = typeof window.Chart !== 'undefined';
    if (!chartJsAvailable) {
      renderOfflineSvgCharts();
      return;
    }

    try {
      const trendCanvas = document.getElementById('trendChartCanvas');
      if (trendCanvas) {
        const trendCtx = trendCanvas.getContext('2d');
        trendChart = new Chart(trendCtx, {
          type: 'line',
          data: { labels: [], datasets: [] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9.5 } } },
              y: { beginAtZero: true, ticks: { color: '#94a3b8', callback: (v) => `${v} µg` } },
            },
            plugins: {
              legend: { labels: { color: '#cbd5e1', font: { size: 10 } } },
            },
          },
        });
      }

      const compCanvas = document.getElementById('comparisonChartCanvas');
      if (compCanvas) {
        const compCtx = compCanvas.getContext('2d');
        comparisonChart = new Chart(compCtx, {
          type: 'bar',
          data: {
            labels: zones.map((z) => z.name.replace(' Area', '')),
            datasets: [
              { label: 'PM2.5', data: [], backgroundColor: '#38bdf8' },
              { label: 'PM10', data: [], backgroundColor: '#fbbf24' },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8', font: { weight: 'bold' } } },
              y: { beginAtZero: true, ticks: { color: '#94a3b8', callback: (v) => `${v} µg` } },
            },
            plugins: {
              legend: { labels: { color: '#cbd5e1', font: { size: 10 } } },
            },
          },
        });
      }
    } catch (e) {
      console.warn('Chart.js init failed, falling back to SVG charts', e);
      renderOfflineSvgCharts();
    }
  }

  function updateCharts() {
    if (!chartJsAvailable || !trendChart || !comparisonChart) {
      renderOfflineSvgCharts();
      return;
    }

    try {
      let slice = [];
      if (trendZoneSelection === 'all') {
        const grouped = new Map();
        historyPoints.forEach((h) => {
          const item = grouped.get(h.timeLabel) || { pm25Sum: 0, pm10Sum: 0, count: 0, timeLabel: h.timeLabel };
          item.pm25Sum += h.pm25;
          item.pm10Sum += h.pm10;
          item.count++;
          grouped.set(h.timeLabel, item);
        });
        slice = Array.from(grouped.values()).slice(-12).map((g) => ({
          timeLabel: g.timeLabel,
          pm25: Math.round(g.pm25Sum / g.count),
          pm10: Math.round(g.pm10Sum / g.count),
        }));
      } else {
        slice = historyPoints.filter((h) => h.zoneId === trendZoneSelection).slice(-12);
      }

      trendChart.data.labels = slice.map((s) => s.timeLabel);
      trendChart.data.datasets = [
        { label: 'PM2.5 (Fine)', data: slice.map((s) => s.pm25), borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', tension: 0.3, borderWidth: 2, fill: true },
        { label: 'PM10 (Coarse)', data: slice.map((s) => s.pm10), borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)', tension: 0.3, borderWidth: 2, fill: true },
        { label: `Warn (${thresholds.pm25Warning})`, data: slice.map(() => thresholds.pm25Warning), borderColor: 'rgba(245, 158, 11, 0.5)', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
        { label: `Crit (${thresholds.pm25Critical})`, data: slice.map(() => thresholds.pm25Critical), borderColor: 'rgba(239, 68, 68, 0.6)', borderDash: [3, 3], borderWidth: 1.5, pointRadius: 0 },
      ];
      trendChart.update();

      comparisonChart.data.datasets[0].data = zones.map((z) => z.pm25);
      comparisonChart.data.datasets[1].data = zones.map((z) => z.pm10);
      comparisonChart.update();
    } catch (e) {
      renderOfflineSvgCharts();
    }
  }

  // Pure SVG/HTML chart fallback if offline or no Chart.js
  function renderOfflineSvgCharts() {
    const compWrap = document.getElementById('comparisonChartWrapper');
    if (compWrap) {
      compWrap.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:space-around; height:100%; padding:10px 0;">
          ${zones
            .map((z) => {
              const p25Pct = Math.min(100, Math.round((z.pm25 / (thresholds.pm25Critical * 1.5)) * 100));
              const p10Pct = Math.min(100, Math.round((z.pm10 / (thresholds.pm10Critical * 1.5)) * 100));
              return `
              <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                  <strong style="color:#fff;">${z.name}</strong>
                  <span style="font-family:'JetBrains Mono'; font-size:10px; color:#cbd5e1;">PM2.5: <span style="color:#38bdf8;">${z.pm25}</span> | PM10: <span style="color:#fbbf24;">${z.pm10}</span></span>
                </div>
                <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden; display:flex; gap:2px;">
                  <div style="width:${p25Pct}%; background:#38bdf8; height:100%;"></div>
                  <div style="width:${p10Pct}%; background:#fbbf24; height:100%;"></div>
                </div>
              </div>`;
            })
            .join('')}
        </div>
      `;
    }

    const trendWrap = document.getElementById('trendChartWrapper');
    if (trendWrap) {
      trendWrap.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:12px; text-align:center;">
          <div>
            <div style="font-size:24px; margin-bottom:4px;">📈</div>
            <div>Live Trend Telemetry Active (${historyPoints.length} points buffered)</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">Thresholds: Warn ${thresholds.pm25Warning} / Crit ${thresholds.pm25Critical}</div>
          </div>
        </div>
      `;
    }
  }

  function exportCSV() {
    const lines = [];
    lines.push('MINEGUARD STANDALONE DEMO AUDIT EXPORT');
    lines.push(`Generated On,${new Date().toISOString()}`);
    lines.push('Disclaimer,"All metrics are simulated. Thresholds are non-regulatory demo values."');
    lines.push('');
    lines.push('=== MINE SECTORS SNAPSHOT ===');
    lines.push('Code,Name,Status,PM2.5 (ug/m3),PM10 (ug/m3),Misting,Equipment,Updated');
    zones.forEach((z) => {
      const ev = evaluateReadings(z.pm25, z.pm10, z.name);
      lines.push(`"${z.code}","${z.name}","${ev.status.toUpperCase()}",${z.pm25},${z.pm10},"${z.misting ? 'YES' : 'NO'}","${z.equipment}","${z.lastUpdated}"`);
    });
    lines.push('');
    lines.push('=== ALERTS & INCIDENT HISTORY ===');
    lines.push('Timestamp,Zone,Parameter,Reading,Threshold,Severity,State,Recommendation');
    alerts.forEach((a) => {
      lines.push(`"${a.timestamp}","${a.zoneName}","${a.parameter}",${a.reading},${a.thresholdCrossed},"${a.severity.toUpperCase()}","${a.acknowledged ? 'RESOLVED' : 'ACTIVE'}","${a.recommendation.replace(/"/g, '""')}"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `MineGuard_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function setupEventListeners() {
    const btnGen = document.getElementById('btnGenerate');
    const btnStep = document.getElementById('btnSimStep');
    if (btnGen) btnGen.addEventListener('click', () => simulateTick(true));
    if (btnStep) btnStep.addEventListener('click', () => simulateTick(true));

    const autoBtn = document.getElementById('btnToggleAuto');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        autoSimulate = !autoSimulate;
        const lbl = document.getElementById('autoLabel');
        const icon = document.getElementById('autoIcon');
        const stat = document.getElementById('simStatusText');
        if (lbl) lbl.textContent = autoSimulate ? 'Auto: Active' : 'Auto: Paused';
        if (icon) icon.textContent = autoSimulate ? '⏸' : '▶';
        if (stat) stat.textContent = autoSimulate ? 'Live (5s)' : 'Manual Mode';
        if (autoSimulate) startTimer(); else clearInterval(timerId);
      });
    }

    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        applyScenario(e.currentTarget.getAttribute('data-preset'));
      });
    });

    document.querySelectorAll('#zoneFilterGroup .seg-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#zoneFilterGroup .seg-btn').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentZoneFilter = e.currentTarget.getAttribute('data-zone');
        renderZones();
      });
    });

    const statSel = document.getElementById('statusFilterSelect');
    if (statSel) {
      statSel.addEventListener('change', (e) => {
        currentStatusFilter = e.target.value;
        renderZones();
      });
    }

    const trSel = document.getElementById('trendZoneSelect');
    if (trSel) {
      trSel.addEventListener('change', (e) => {
        trendZoneSelection = e.target.value;
        updateCharts();
      });
    }

    const sIn = document.getElementById('alertSearchInput');
    const zF = document.getElementById('alertFilterZone');
    const sF = document.getElementById('alertFilterSeverity');
    if (sIn) sIn.addEventListener('input', renderAlerts);
    if (zF) zF.addEventListener('change', renderAlerts);
    if (sF) sF.addEventListener('change', renderAlerts);

    const bCsv = document.getElementById('btnExportCSV');
    const bDRep = document.getElementById('btnDownloadReportCSV');
    const bPrint = document.getElementById('btnPrintReport');
    if (bCsv) bCsv.addEventListener('click', exportCSV);
    if (bDRep) bDRep.addEventListener('click', exportCSV);
    if (bPrint) bPrint.addEventListener('click', () => window.print());

    const bClr = document.getElementById('btnClearAlerts');
    if (bClr) {
      bClr.addEventListener('click', () => {
        alerts = [];
        saveAlerts(alerts);
        renderAll();
      });
    }

    const bSet = document.getElementById('btnOpenSettings');
    const bGui = document.getElementById('btnOpenGuide');
    const bRep = document.getElementById('btnOpenReport');
    if (bSet) bSet.addEventListener('click', () => openModal('settingsModal'));
    if (bGui) bGui.addEventListener('click', () => openModal('guideModal'));
    if (bRep) {
      bRep.addEventListener('click', () => {
        const c1 = document.getElementById('repAlertCount');
        const c2 = document.getElementById('repTrendCount');
        if (c1) c1.textContent = `${alerts.length} Total`;
        if (c2) c2.textContent = `${historyPoints.length} Points`;
        openModal('reportModal');
      });
    }

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => closeModal(e.currentTarget.getAttribute('data-close')));
    });

    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const errBox = document.getElementById('settingsError');
        const succBox = document.getElementById('settingsSuccess');
        if (errBox) errBox.classList.add('hidden');
        if (succBox) succBox.classList.add('hidden');

        const pm25W = parseFloat(document.getElementById('inputPm25Warn').value);
        const pm25C = parseFloat(document.getElementById('inputPm25Crit').value);
        const pm10W = parseFloat(document.getElementById('inputPm10Warn').value);
        const pm10C = parseFloat(document.getElementById('inputPm10Crit').value);

        if (pm25W >= pm25C) {
          if (errBox) {
            errBox.textContent = `PM2.5 Warning (${pm25W}) must be strictly lower than Critical (${pm25C}).`;
            errBox.classList.remove('hidden');
          }
          return;
        }
        if (pm10W >= pm10C) {
          if (errBox) {
            errBox.textContent = `PM10 Warning (${pm10W}) must be strictly lower than Critical (${pm10C}).`;
            errBox.classList.remove('hidden');
          }
          return;
        }

        thresholds = { pm25Warning: pm25W, pm25Critical: pm25C, pm10Warning: pm10W, pm10Critical: pm10C };
        saveThresholds(thresholds);
        if (succBox) {
          succBox.textContent = 'Settings saved successfully!';
          succBox.classList.remove('hidden');
        }
        renderAll();
        setTimeout(() => closeModal('settingsModal'), 800);
      });
    }

    const bRes = document.getElementById('btnResetThresholds');
    if (bRes) {
      bRes.addEventListener('click', () => {
        document.getElementById('inputPm25Warn').value = DEFAULT_THRESHOLDS.pm25Warning;
        document.getElementById('inputPm25Crit').value = DEFAULT_THRESHOLDS.pm25Critical;
        document.getElementById('inputPm10Warn').value = DEFAULT_THRESHOLDS.pm10Warning;
        document.getElementById('inputPm10Crit').value = DEFAULT_THRESHOLDS.pm10Critical;
      });
    }

    const bDism = document.getElementById('btnDismissBanner');
    if (bDism) {
      bDism.addEventListener('click', () => {
        const ban = document.getElementById('disclaimerBanner');
        if (ban) ban.style.display = 'none';
      });
    }

    const aCard = document.getElementById('alertsSummaryCard');
    if (aCard) {
      aCard.addEventListener('click', () => {
        document.getElementById('alertsSection')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      if (id === 'settingsModal') {
        const w25 = document.getElementById('inputPm25Warn');
        const c25 = document.getElementById('inputPm25Crit');
        const w10 = document.getElementById('inputPm10Warn');
        const c10 = document.getElementById('inputPm10Crit');
        if (w25) w25.value = thresholds.pm25Warning;
        if (c25) c25.value = thresholds.pm25Critical;
        if (w10) w10.value = thresholds.pm10Warning;
        if (c10) c10.value = thresholds.pm10Critical;
        document.getElementById('settingsError')?.classList.add('hidden');
        document.getElementById('settingsSuccess')?.classList.add('hidden');
      }
      modal.classList.add('open');
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => simulateTick(false), 5000);
  }

  function boot() {
    setupEventListeners();
    renderAll();
    initCharts();
    startTimer();
  }

  // Safe immediate or event-based bootloader
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
