/* ============================================================
   SYSTEM OS — STORY EXPORT ENGINE
   Full-screen display, long-press to save
   Transparent overlay style (Strava-inspired)
   ============================================================ */

const ExportEngine = (() => {

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ── BUILD STORY CARD (1080x1920) ──
  async function buildStoryCard(includeWeight = false) {
    const canvas = document.createElement('canvas');
    const W = 1080, H = 1920;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const today = state.days[todayKey()] || freshDay();
    const rank = autoRank(today);
    const streak = calculateStreak();
    const s = state.settings;
    const cq = today.coreQuests;

    // ── BACKGROUND — gradient with subtle pattern ──
    const theme = s.theme || 'sl';
    const bgColors = {
      sl: ['#06060a', '#0c0c16', '#10101e'],
      ff7c: ['#05050a', '#0a0a12', '#0f0f1a'],
      ff7r: ['#040608', '#080c12', '#0c1018'],
      ro: ['#ddeeff', '#e8f4ff', '#f0f8ff'],
      og: ['#3a4560', '#4a5570', '#5a6580']
    };
    const bgs = bgColors[theme] || bgColors.sl;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, bgs[0]);
    grad.addColorStop(0.5, bgs[1]);
    grad.addColorStop(1, bgs[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // ── TOP ACCENT LINE ──
    const accentColors = {
      sl: ['#6c63ff','#38bdf8'], ff7c: ['#00d4aa','#c9a84c'],
      ff7r: ['#00c8e8','#8040c0'], ro: ['#4a82b4','#c0cfd6'], og: ['#ceeeff','#d88038']
    };
    const [ac1, ac2] = accentColors[theme] || accentColors.sl;
    const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0, 'transparent'); lineGrad.addColorStop(0.3, ac1);
    lineGrad.addColorStop(0.7, ac2); lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(W, 180); ctx.stroke();

    // ── SYSTEM OS LABEL ──
    ctx.font = '500 36px Share Tech Mono, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.3em';
    ctx.fillText('SYSTEM OS', W/2, 130);

    // ── DATE ──
    ctx.font = '28px Share Tech Mono';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(formatDate(todayKey()).toUpperCase(), W/2, 230);

    // ── RANK — massive ──
    const rankColors = {
      S: '#ffd700', A: ac1, B: ac2, C: '#4a9eff', D: '#666', E: '#444', F: '#2a2a2a'
    };
    const rankColor2 = rankColors[rank] || '#888';

    // Glow
    ctx.shadowColor = rankColor2;
    ctx.shadowBlur = 120;
    ctx.font = 'bold 360px Cinzel, serif';
    ctx.fillStyle = rankColor2;
    ctx.textAlign = 'center';
    ctx.fillText(rank, W/2, 750);
    ctx.shadowBlur = 0;

    // Rank label
    ctx.font = '44px Share Tech Mono';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('DAY RANK', W/2, 840);

    // ── DIVIDER ──
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, 900); ctx.lineTo(W-120, 900); ctx.stroke();

    // ── QUEST SUMMARY ──
    const quests = [
      { name: 'SLEEP', done: cq.sleep },
      { name: `STEPS  ${cq.steps.toLocaleString()}`, done: cq.steps >= s.stepsGoal },
      { name: `PROTEIN  ${cq.protein}g`, done: cq.protein >= s.proteinGoal },
      { name: `CALORIES  ${cq.calories}`, done: cq.calories > 0 && cq.calories <= s.caloriesGoal },
      { name: 'TRAINED', done: cq.trained },
      { name: 'MAIN QUEST', done: cq.mainQuest },
    ];

    const completed = quests.filter(q => q.done).length;

    quests.forEach((q, i) => {
      const y = 980 + i * 120;
      const x = 120;
      const rowW = W - 240;

      // Row bg
      ctx.fillStyle = q.done ? `rgba(${hexToRgb(ac1)},0.08)` : 'rgba(255,255,255,0.03)';
      roundRect(ctx, x, y - 52, rowW, 90, 14); ctx.fill();

      // Check circle
      ctx.beginPath();
      ctx.arc(x + 44, y - 7, 22, 0, Math.PI * 2);
      ctx.strokeStyle = q.done ? ac1 : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (q.done) {
        ctx.fillStyle = ac1;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', x + 44, y - 7 + 8);
      }

      // Quest name
      ctx.font = `${q.done ? '600' : '400'} 38px Rajdhani, sans-serif`;
      ctx.fillStyle = q.done ? '#ffffff' : 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'left';
      ctx.fillText(q.name, x + 82, y + 5);
    });

    // ── BOTTOM DIVIDER ──
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, 1710); ctx.lineTo(W-120, 1710); ctx.stroke();

    // ── STATS ROW ──
    const stats = [
      { label: 'STREAK', val: `${streak}🔥` },
      { label: 'COMPLETED', val: `${completed}/${quests.length}` },
    ];
    if (includeWeight && today.weight) {
      stats.splice(1, 0, { label: 'WEIGHT', val: `${today.weight}${s.bodyWeightUnit}` });
    }

    const statW = W / stats.length;
    ctx.textAlign = 'center';
    stats.forEach((st, i) => {
      const cx = statW * i + statW / 2;
      ctx.font = 'bold 52px Cinzel, serif';
      ctx.fillStyle = ac1;
      ctx.fillText(st.val, cx, 1800);
      ctx.font = '26px Share Tech Mono';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText(st.label, cx, 1850);
    });

    // ── FOOTER ──
    ctx.font = '22px Share Tech Mono';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OS · MAIN QUEST SYSTEM', W/2, 1900);

    return canvas;
  }

  // ── SHOW FULL SCREEN (long-press to save) ──
  async function showFullScreen(includeWeight = false) {
    const canvas = await buildStoryCard(includeWeight);
    const dataUrl = canvas.toDataURL('image/png');
    const img = document.getElementById('story-img');
    img.src = dataUrl;

    const screen = document.getElementById('story-fullscreen');
    screen.classList.add('active');

    // Hint pulses
    document.getElementById('story-hint').textContent = 'HOLD IMAGE TO SAVE TO PHOTOS';

    // Close button
    document.getElementById('story-close-btn').onclick = () => {
      screen.classList.remove('active');
    };
  }

  // ── EXPORT WEIGHT CHART ──
  async function exportWeightToFullScreen() {
    const dataUrl = await Charts.exportWeightChart();
    if (!dataUrl) return;
    const img = document.getElementById('story-img');
    img.src = dataUrl;
    const screen = document.getElementById('story-fullscreen');
    screen.classList.add('active');
    document.getElementById('story-hint').textContent = 'HOLD IMAGE TO SAVE TO PHOTOS';
    document.getElementById('story-close-btn').onclick = () => screen.classList.remove('active');
  }

  // ── HELPERS ──
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  return { showFullScreen, exportWeightToFullScreen };
})();
