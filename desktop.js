/* ============================================================
   SYSTEM OS — CHART ENGINE
   Weight line + goal + reality projection pacer
   Bar charts, moving averages
   ============================================================ */

const Charts = (() => {

  // ── COLORS ──
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ── WEIGHT + PROJECTION CHART ──
  function drawWeightChart(canvasId, period = '3M') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Filter data by period
    const now = todayKey();
    const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 9999 };
    const days = periodDays[period] || 90;
    const cutoff = addDays(now, -days);

    const logs = state.weightLog
      .filter(w => w.date >= cutoff)
      .sort((a,b) => a.date < b.date ? -1 : 1);

    if (logs.length < 2) {
      drawEmpty(ctx, canvas, 'Not enough weight data yet');
      return;
    }

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = Math.min(200, Math.round(W * 0.55));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 16, bottom: 36, left: 44 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    // Data range
    const allWeights = logs.map(l => l.weight);
    const proj = calculateProjection();
    const trend = calculateActualTrend();

    // Include projection in range
    let maxW = Math.max(...allWeights) + 3;
    let minW = Math.min(...allWeights) - 3;
    if (proj) {
      minW = Math.min(minW, proj.targetWeight - 3);
    }
    if (state.settings.weightGoal) {
      minW = Math.min(minW, state.settings.weightGoal - 3);
    }

    const dateRange = [logs[0].date];
    if (proj && proj.targetDate > logs[logs.length-1].date) dateRange.push(proj.targetDate);
    else dateRange.push(logs[logs.length-1].date);
    const totalDays = daysBetween(dateRange[0], dateRange[1]) || 1;

    function xPos(date) {
      return pad.left + (daysBetween(dateRange[0], date) / totalDays) * cW;
    }
    function yPos(weight) {
      return pad.top + cH - ((weight - minW) / (maxW - minW)) * cH;
    }

    // ── GRID ──
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const w = minW + (maxW - minW) * (i / gridLines);
      const y = yPos(w);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = cssVar('--text-muted');
      ctx.font = `${8 * dpr / dpr}px Share Tech Mono, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(w), pad.left - 4, y + 3);
    }

    // ── MOVING AVERAGE (7-day) ──
    if (logs.length >= 7) {
      ctx.beginPath();
      ctx.strokeStyle = cssVar('--secondary') || '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      let first = true;
      for (let i = 6; i < logs.length; i++) {
        const avg = logs.slice(i-6, i+1).reduce((s,l) => s + l.weight, 0) / 7;
        const x = xPos(logs[i].date);
        const y = yPos(avg);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── PROJECTION / PACER ──
    if (proj && state.settings.weightGoal) {
      // Goal line (horizontal)
      ctx.beginPath();
      ctx.strokeStyle = cssVar('--success') || '#34d399';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      const goalY = yPos(state.settings.weightGoal);
      ctx.moveTo(pad.left, goalY);
      ctx.lineTo(W - pad.right, goalY);
      ctx.stroke();
      ctx.fillStyle = cssVar('--success') || '#34d399';
      ctx.font = '8px Share Tech Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`Goal: ${state.settings.weightGoal}`, pad.left + 2, goalY - 3);

      // Projection/pacer line (from last actual to target)
      const lastLog = logs[logs.length - 1];
      if (proj.targetDate > lastLog.date) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99,102,241,0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.moveTo(xPos(lastLog.date), yPos(lastLog.weight));
        ctx.lineTo(xPos(proj.targetDate), yPos(state.settings.weightGoal));
        ctx.stroke();
      }

      // Reality trend line
      if (trend && trend.slope !== 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(239,68,68,0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        const startX = xPos(logs[0].date);
        const endDate = proj.targetDate > logs[logs.length-1].date ? proj.targetDate : addDays(now, 60);
        const endDays = daysBetween(logs[0].date, endDate);
        const endWeight = logs[0].weight + trend.slope * endDays;
        ctx.moveTo(startX, yPos(logs[0].weight));
        ctx.lineTo(xPos(endDate), yPos(Math.max(minW, Math.min(maxW, endWeight))));
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // ── ACTUAL WEIGHT LINE ──
    ctx.beginPath();
    ctx.strokeStyle = cssVar('--gold-bright') || '#f0c040';
    ctx.lineWidth = 2;
    logs.forEach((log, i) => {
      const x = xPos(log.date);
      const y = yPos(log.weight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points
    logs.forEach((log, i) => {
      if (i % Math.max(1, Math.floor(logs.length / 20)) === 0 || i === logs.length - 1) {
        ctx.beginPath();
        ctx.arc(xPos(log.date), yPos(log.weight), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = cssVar('--gold-bright') || '#f0c040';
        ctx.fill();
      }
    });

    // ── LEGEND ──
    const legendItems = [
      { color: cssVar('--gold-bright') || '#f0c040', label: 'Weight', dash: false },
      { color: cssVar('--secondary') || '#38bdf8', label: '7d Avg', dash: true },
    ];
    if (state.settings.weightGoal) {
      legendItems.push({ color: 'rgba(99,102,241,0.8)', label: 'Target pace', dash: true });
      legendItems.push({ color: 'rgba(239,68,68,0.8)', label: 'Reality', dash: true });
    }
    let lx = pad.left;
    const ly = H - 8;
    legendItems.forEach(item => {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.5;
      if (item.dash) ctx.setLineDash([4,3]); else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(lx, ly); ctx.lineTo(lx + 14, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = cssVar('--text-secondary') || '#888';
      ctx.font = '7px Share Tech Mono';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 17, ly + 3);
      lx += item.label.length * 5 + 26;
    });
  }

  // ── BAR CHART (calories, volume) ──
  function drawBarChart(canvasId, data, color, goalLine = null, label = '') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 160;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 12, right: 12, bottom: 28, left: 42 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map(d => d.value), goalLine || 0) * 1.1;
    const barW = Math.max(4, (cW / data.length) - 3);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(p => {
      const y = pad.top + cH - p * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = cssVar('--text-muted');
      ctx.font = '7px Share Tech Mono';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * p), pad.left - 3, y + 3);
    });

    // Goal line
    if (goalLine) {
      const gy = pad.top + cH - (goalLine / maxVal) * cH;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5,4]);
      ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bars
    data.forEach((d, i) => {
      const x = pad.left + i * (cW / data.length) + (cW / data.length - barW) / 2;
      const h = (d.value / maxVal) * cH;
      const y = pad.top + cH - h;
      const barColor = goalLine && d.value > goalLine ? 'rgba(239,68,68,0.7)' : color;
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 2);
      ctx.fill();
      // X label
      if (i % Math.max(1, Math.floor(data.length / 8)) === 0) {
        ctx.fillStyle = cssVar('--text-muted');
        ctx.font = '7px Share Tech Mono';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || '', x + barW / 2, H - pad.bottom + 10);
      }
    });
  }

  // ── MOVING AVERAGE LINE CHART ──
  function drawMovingAvgChart(canvasId, rawData, windowSize = 7, color = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || rawData.length < windowSize) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 140;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 12, right: 12, bottom: 24, left: 42 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...rawData.map(d => d.value)) * 1.1;
    const n = rawData.length;
    function xP(i) { return pad.left + (i / (n - 1)) * cW; }
    function yP(v) { return pad.top + cH - (v / maxVal) * cH; }

    // Raw (faint)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    rawData.forEach((d,i) => { i===0 ? ctx.moveTo(xP(i),yP(d.value)) : ctx.lineTo(xP(i),yP(d.value)); });
    ctx.stroke();

    // Moving average
    const lineColor = color || cssVar('--accent') || '#6c63ff';
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    let first = true;
    for (let i = windowSize - 1; i < n; i++) {
      const avg = rawData.slice(i - windowSize + 1, i + 1).reduce((s,d) => s + d.value, 0) / windowSize;
      const x = xP(i), y = yP(avg);
      if (first) { ctx.moveTo(x, y); first = false; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawEmpty(ctx, canvas, msg = 'No data') {
    const W = canvas.offsetWidth, H = 160;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '11px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(msg, W / 2, H / 2);
  }

  // ── EXPORT WEIGHT CHART AS IMAGE ──
  async function exportWeightChart() {
    const tmpCanvas = document.createElement('canvas');
    const W = 1080, H = 500;
    tmpCanvas.width = W; tmpCanvas.height = H;
    const ctx = tmpCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0c0c16';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#c4b5fd';
    ctx.font = 'bold 28px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('WEIGHT TRACKING', W / 2, 44);

    // Draw chart scaled up on this canvas
    // (simplified — render key data points)
    const logs = state.weightLog.slice(-90).sort((a,b) => a.date < b.date ? -1 : 1);
    if (logs.length < 2) return null;

    const pad = { top: 70, right: 60, bottom: 80, left: 90 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const allW = logs.map(l => l.weight);
    const maxW = Math.max(...allW) + 3, minW = Math.min(...allW, state.settings.weightGoal || Infinity) - 3;
    const totalDays = daysBetween(logs[0].date, logs[logs.length-1].date) || 1;
    function xP(date) { return pad.left + (daysBetween(logs[0].date, date) / totalDays) * cW; }
    function yP(w) { return pad.top + cH - ((w - minW) / (maxW - minW)) * cH; }

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const w = minW + (maxW - minW) * (i / 5);
      const y = yP(w);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '18px Share Tech Mono'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(w), pad.left - 8, y + 6);
    }

    // Goal line
    if (state.settings.weightGoal) {
      const gy = yP(state.settings.weightGoal);
      ctx.strokeStyle = 'rgba(52,211,153,0.6)'; ctx.lineWidth = 2;
      ctx.setLineDash([10,6]);
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#34d399'; ctx.font = '16px Share Tech Mono'; ctx.textAlign = 'left';
      ctx.fillText(`Goal: ${state.settings.weightGoal} ${state.settings.bodyWeightUnit}`, pad.left + 4, gy - 6);
    }

    // Actual line
    ctx.beginPath(); ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 3; ctx.setLineDash([]);
    logs.forEach((l,i) => { i===0 ? ctx.moveTo(xP(l.date),yP(l.weight)) : ctx.lineTo(xP(l.date),yP(l.weight)); });
    ctx.stroke();

    // Projection
    const proj = calculateProjection();
    if (proj && proj.targetDate > logs[logs.length-1].date) {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(99,102,241,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([8,6]);
      ctx.moveTo(xP(logs[logs.length-1].date), yP(logs[logs.length-1].weight));
      ctx.lineTo(xP(proj.targetDate), yP(state.settings.weightGoal)); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '16px Share Tech Mono'; ctx.textAlign = 'center';
    ctx.fillText(formatDate(logs[0].date), pad.left, H - 20);
    ctx.fillText(formatDate(logs[logs.length-1].date), W - pad.right, H - 20);

    return tmpCanvas.toDataURL('image/png');
  }

  return { drawWeightChart, drawBarChart, drawMovingAvgChart, exportWeightChart };
})();
