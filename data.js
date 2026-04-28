/* ============================================================
   SYSTEM OS — APP ENGINE
   ============================================================ */

// ── NAVIGATION ──
let currentSection = 'daily';
let currentDailyDate = todayKey();
let currentTrainingDate = todayKey();
let currentQuestCat = 'main';
let selectedRank = null;
let currentChartPeriod = '3M';
let alarmDismissed = { morning: false, evening: false };

const SECTIONS = ['daily','quests','training','nutrition','journal','settings'];

function switchSection(name) {
  currentSection = name;
  SECTIONS.forEach(s => {
    document.getElementById('section-' + s)?.classList.toggle('active', s === name);
    document.querySelector(`[data-nav="${s}"]`)?.classList.toggle('active', s === name);
  });
  renderSection(name);
  SoundEngine.tap();
}

function renderSection(name) {
  switch(name) {
    case 'daily':     renderDaily(); break;
    case 'quests':    renderQuests(); break;
    case 'training':  renderTraining(); break;
    case 'nutrition': renderNutrition(); break;
    case 'journal':   renderJournal(); break;
    case 'settings':  renderSettings(); break;
  }
}

// ── TOPBAR ──
function updateTopbar() {
  const day = getDay(todayKey());
  const rank = autoRank(day);
  const streak = calculateStreak();

  const rankEl = document.getElementById('topbar-rank');
  if (rankEl) {
    rankEl.textContent = rank;
    rankEl.className = 'rank-chip c-' + rank.toLowerCase();
    rankEl.style.color = rankColor(rank);
    rankEl.style.borderColor = rankColor(rank);
  }
  setText('streak-num', streak);
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric' }).toUpperCase();
}

// ── PARTICLES ──
function spawnParticles(emoji, count = 4) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    p.style.left = (window.innerWidth * (0.2 + Math.random() * 0.6)) + 'px';
    p.style.top = (window.innerHeight * (0.3 + Math.random() * 0.3)) + 'px';
    p.style.animationDelay = (i * 0.07) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

// ============================================================
// DAILY QUESTS
// ============================================================
function renderDaily() {
  const day = getDay(currentDailyDate);
  const s = state.settings;
  const isToday = currentDailyDate === todayKey();

  // Date nav
  setText('daily-date-label', currentDailyDate === todayKey() ? 'TODAY' : formatDate(currentDailyDate));
  setDisplay('daily-today-btn', !isToday);

  // Rest day
  const restBanner = document.getElementById('rest-day-banner');
  if (restBanner) restBanner.style.display = day.isRestDay ? 'flex' : 'none';

  // Rank
  const rank = autoRank(day);
  const rd = document.getElementById('daily-rank-display');
  if (rd) {
    rd.textContent = rank;
    rd.style.color = rankColor(rank);
    rd.style.borderColor = rankColor(rank);
  }
  updateTopbar();

  // Progress
  const cq = day.coreQuests;
  const coreGoals = [cq.sleep, cq.steps >= s.stepsGoal, cq.calories > 0 && cq.calories <= s.caloriesGoal, cq.protein >= s.proteinGoal, cq.trained, cq.mainQuest];
  const coreDone = coreGoals.filter(Boolean).length;
  const customDone = (day.customQuests||[]).filter(q=>q.done).length;
  const customTotal = (day.customQuests||[]).length;
  const totalDone = coreDone + customDone;
  const totalQuests = 6 + customTotal;
  const pct = Math.round((totalDone / totalQuests) * 100);
  setStyle('daily-progress-fill', 'width', pct + '%');
  setText('daily-completion-text', `${totalDone} / ${totalQuests} DAILY QUESTS`);

  // Intention
  setText('daily-intention-text', day.intention || 'Tap to log today\'s intention...');

  // Core quests
  updateSleepDisplay(cq.sleepHours || 0, day.isRestDay);
  setCoreQuestStepper('sq-steps', cq.steps, s.stepsGoal, 'steps');
  setCoreQuestManual('sq-calories', cq.calories, s.caloriesGoal, 'cal', 'calories');
  setCoreQuestManual('sq-protein', cq.protein, s.proteinGoal, 'g', 'protein');
  setCoreQuest('sq-trained', cq.trained, false);
  setCoreQuest('sq-mainquest', cq.mainQuest, false);

  // Custom / side quests
  renderCustomQuests();
}

function setCoreQuest(id, done, disabled) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('completed', done);
  el.classList.toggle('rest-disabled', disabled);
  const check = el.querySelector('.q-check');
  if (check) check.textContent = done ? '✓' : '';
}

function sleepStep(dir) {
  const day = getDay(currentDailyDate);
  const prev = day.coreQuests.sleepHours || 0;
  const next = Math.max(0, Math.min(12, Math.round((prev + dir) * 2) / 2));
  day.coreQuests.sleepHours = next;
  // Auto-complete: 6.5–10 hrs = done
  const wasGood = prev >= 6.5 && prev <= 10;
  const isGood = next >= 6.5 && next <= 10;
  day.coreQuests.sleep = isGood;
  if (isGood && !wasGood) { SoundEngine.questComplete(); spawnParticles('😴', 3); }
  else if (!isGood && wasGood) SoundEngine.questUndo();
  else SoundEngine.tap();
  saveState();
  updateSleepDisplay(next, day.isRestDay);
  updateTopbar();
  checkRankCelebration(day);
}

function updateSleepDisplay(hrs, disabled) {
  const el = document.getElementById('sq-sleep');
  if (!el) return;
  const isGood = hrs >= 6.5 && hrs <= 10;
  el.classList.toggle('completed', isGood);
  el.classList.toggle('rest-disabled', disabled);
  const check = el.querySelector('.q-check');
  if (check) check.textContent = isGood ? '✓' : '';
  const valEl = document.getElementById('sleep-val');
  if (valEl) valEl.textContent = hrs > 0 ? hrs + 'h' : '—';
  const metaEl = document.getElementById('sleep-meta');
  if (metaEl) {
    if (hrs > 0 && hrs < 6.5) metaEl.textContent = 'TOO LITTLE — NEED MORE';
    else if (hrs > 10) metaEl.textContent = 'TOO MUCH';
    else metaEl.textContent = 'GOAL: 6.5–10 hrs';
  }
}

function setCoreQuestStepper(id, val, goal, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const done = val >= goal;
  el.classList.toggle('completed', done);
  const check = el.querySelector('.q-check');
  if (check) check.textContent = done ? '✓' : '';
  const sv = el.querySelector('.step-val');
  if (sv) sv.textContent = val >= 1000 ? (val/1000).toFixed(1)+'k' : val;
  const meta = el.querySelector('.q-meta');
  if (meta) meta.textContent = `GOAL: ${goal >= 1000 ? (goal/1000)+'k' : goal}`;
}

function setCoreQuestManual(id, val, goal, unit, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const done = val > 0 && (key === 'calories' ? val <= goal : val >= goal);
  el.classList.toggle('completed', done);
  const check = el.querySelector('.q-check');
  if (check) check.textContent = done ? '✓' : '';
  const inp = el.querySelector('.q-manual-input');
  if (inp && document.activeElement !== inp) inp.value = val > 0 ? val : '';
  const meta = el.querySelector('.q-meta');
  if (meta) meta.textContent = `GOAL: ${key === 'calories' ? '≤' : '≥'} ${goal}${unit}`;
}

function toggleCoreQuest(key) {
  const day = getDay(currentDailyDate);
  day.coreQuests[key] = !day.coreQuests[key];
  const done = day.coreQuests[key];
  if (done) {
    SoundEngine.questComplete();
    spawnParticles(key === 'sleep' ? '😴' : key === 'trained' ? '💪' : '⚔');
  } else {
    SoundEngine.questUndo();
  }
  saveState();
  renderDaily();
  checkRankCelebration(day);
}

function stepperChange(key, dir, step) {
  const day = getDay(currentDailyDate);
  const prev = day.coreQuests[key];
  day.coreQuests[key] = Math.max(0, prev + dir * step);
  const goal = key === 'steps' ? state.settings.stepsGoal : 0;
  if (day.coreQuests[key] >= goal && prev < goal) {
    SoundEngine.questComplete();
    spawnParticles('⚡', 5);
  } else {
    SoundEngine.tap();
  }
  saveState();
  setCoreQuestStepper('sq-steps', day.coreQuests.steps, state.settings.stepsGoal, 'steps');
  updateTopbar();
  checkRankCelebration(day);
}

function commitManualInput(key, inputId) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const val = parseFloat(inp.value);
  if (isNaN(val) || val < 0) return;
  const day = getDay(currentDailyDate);
  const prev = day.coreQuests[key];
  day.coreQuests[key] = val;
  const s = state.settings;
  const goal = key === 'calories' ? s.caloriesGoal : s.proteinGoal;
  const nowDone = key === 'calories' ? (val > 0 && val <= goal) : val >= goal;
  const wasDone = key === 'calories' ? (prev > 0 && prev <= goal) : prev >= goal;
  if (nowDone && !wasDone) {
    SoundEngine.questComplete();
    spawnParticles('🔥', 4);
  } else {
    SoundEngine.save();
  }
  saveState();
  renderDaily();
  checkRankCelebration(day);
}

function checkRankCelebration(day) {
  const rank = autoRank(day);
  const lastCelebrated = sessionStorage.getItem('lastCelebrated_' + currentDailyDate);
  if (rank !== lastCelebrated) {
    if (['S','A','B'].includes(rank)) {
      SoundEngine.forRank(rank);
      if (rank === 'S') spawnParticles('★', 8);
      else if (rank === 'A') spawnParticles('✦', 5);
      sessionStorage.setItem('lastCelebrated_' + currentDailyDate, rank);
    }
  }
}

function renderCustomQuests() {
  const day = getDay(currentDailyDate);
  const container = document.getElementById('custom-quests-list');
  if (!container) return;
  container.innerHTML = '';
  (day.customQuests || []).forEach((q, i) => {
    const el = document.createElement('div');
    el.className = 'quest-item' + (q.done ? ' completed' : '') + (q.frozen ? ' rest-disabled' : '');
    el.innerHTML = `
      <div class="q-inner" onclick="toggleCustomQuest(${i})">
        <div class="q-check">${q.done ? '✓' : ''}</div>
        <div class="q-info">
          <div class="q-name">${escHtml(q.name)}</div>
          <div class="q-meta">${q.frozen ? 'FROZEN' : 'SIDE QUEST'}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button onclick="event.stopPropagation();toggleFreezeQuest(${i})" style="background:none;border:none;color:var(--text-muted);font-size:12px;cursor:pointer;padding:2px 5px;">${q.frozen?'❄':'⏸'}</button>
          <button onclick="event.stopPropagation();deleteCustomQuest(${i})" style="background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;padding:2px 5px;">×</button>
        </div>
      </div>`;
    container.appendChild(el);
  });
}

function toggleCustomQuest(i) {
  const day = getDay(currentDailyDate);
  if (day.customQuests[i].frozen) return;
  day.customQuests[i].done = !day.customQuests[i].done;
  if (day.customQuests[i].done) { SoundEngine.questComplete(); spawnParticles('✦', 3); }
  else SoundEngine.questUndo();
  saveState(); renderCustomQuests(); renderDaily();
}

function toggleFreezeQuest(i) {
  const day = getDay(currentDailyDate);
  day.customQuests[i].frozen = !day.customQuests[i].frozen;
  saveState(); renderCustomQuests();
}

function deleteCustomQuest(i) {
  const day = getDay(currentDailyDate);
  day.customQuests.splice(i, 1);
  saveState(); renderCustomQuests(); renderDaily();
}

function saveCustomQuest() {
  const name = document.getElementById('cq-name-input')?.value.trim();
  if (!name) return;
  const day = getDay(currentDailyDate);
  day.customQuests.push({ name, done: false, frozen: false });
  saveState();
  closeModal('custom-quest-modal');
  document.getElementById('cq-name-input').value = '';
  renderCustomQuests(); renderDaily();
  SoundEngine.save();
}

function navDailyDate(dir) {
  const d = new Date(currentDailyDate + 'T12:00:00');
  d.setDate(d.getDate() + dir);
  currentDailyDate = d.toISOString().slice(0,10);
  renderDaily();
}

function setDailyRestDay(val) {
  const day = getDay(currentDailyDate);
  day.isRestDay = val !== undefined ? val : !day.isRestDay;
  if (day.isRestDay) {
    day.coreQuests.trained = true; // auto-complete training on rest day
  }
  saveState(); renderDaily();
  SoundEngine.tap();
}

// ============================================================
// MORNING / EVENING PROMPTS
// ============================================================
function openMorningPrompt() {
  const day = getDay(currentDailyDate);
  setVal('morning-weight-input', day.weight || '');
  setVal('morning-intention-input', day.intention || '');
  openModal('morning-modal');
}

function saveMorningPrompt() {
  const w = parseFloat(document.getElementById('morning-weight-input')?.value);
  const intention = document.getElementById('morning-intention-input')?.value.trim();
  const day = getDay(currentDailyDate);
  if (!isNaN(w) && w > 0) {
    day.weight = w;
    // Add to weightLog
    const existing = state.weightLog.findIndex(l => l.date === currentDailyDate);
    if (existing >= 0) state.weightLog[existing].weight = w;
    else state.weightLog.push({ date: currentDailyDate, weight: w });
    state.weightLog.sort((a,b) => a.date < b.date ? -1 : 1);
  }
  if (intention) day.intention = intention;
  day.morningDone = true;
  saveState();
  SoundEngine.save();
  closeModal('morning-modal');
  alarmDismissed.morning = true;
  hideAlarm();
  renderDaily();
}

function openEveningPrompt() {
  const day = getDay(currentDailyDate);
  selectedRank = day.rank || null;
  document.querySelectorAll('.r-btn').forEach(b => b.classList.toggle('sel', b.dataset.rank === selectedRank));
  setVal('evening-reflection-input', day.reflection || '');
  openModal('evening-modal');
}

function saveEveningPrompt() {
  if (!selectedRank) { SoundEngine.error(); return; }
  const reflection = document.getElementById('evening-reflection-input')?.value.trim();
  const day = getDay(currentDailyDate);
  day.rank = selectedRank;
  day.reflection = reflection || '';
  day.eveningDone = true;
  if (reflection) {
    state.journal.unshift({
      date: currentDailyDate,
      rank: selectedRank,
      mood: day.mood,
      text: reflection,
      prompts: { ...day.journalPrompts },
      intention: day.intention
    });
  }
  saveState();
  SoundEngine.forRank(selectedRank);
  if (selectedRank === 'S') spawnParticles('★', 8);
  else if (selectedRank === 'A') spawnParticles('✦', 5);
  closeModal('evening-modal');
  alarmDismissed.evening = true;
  hideAlarm();
  renderDaily();
  checkStreak();
}

function selectRank(r) {
  selectedRank = r;
  document.querySelectorAll('.r-btn').forEach(b => b.classList.toggle('sel', b.dataset.rank === r));
  SoundEngine.tap();
}

function checkStreak() {
  const streak = calculateStreak();
  const milestones = [3,7,14,21,30,60,90,100,180,365];
  if (milestones.includes(streak)) {
    SoundEngine.streakMilestone();
    spawnParticles('🔥', 8);
  }
}

// ============================================================
// QUEST LOG
// ============================================================
let pendingNLP = null;

function handleQuestInput(val) {
  const parsed = parseNLP(val);
  pendingNLP = parsed;
  const hint = document.getElementById('nlp-hint');
  if (!hint) return;
  const parts = [];
  if (parsed.due && parsed.label) parts.push(`📅 ${parsed.label}`);
  if (parsed.recurring) parts.push(`🔁 ${parsed.recurring}`);
  if (parsed.priority < 4) parts.push(`P${parsed.priority}`);
  if (parsed.tags.length) parts.push(parsed.tags.map(t=>`@${t}`).join(' '));
  if (parsed.quests.length) parts.push(parsed.quests.map(q=>`#${q}`).join(' '));
  if (parts.length) {
    hint.textContent = parts.join(' · ');
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
}

function addQuest(cat) {
  const inp = document.getElementById('quest-input');
  if (!inp) return;
  const raw = inp.value.trim();
  if (!raw) return;
  const parsed = pendingNLP || parseNLP(raw);
  const title = parsed.clean || raw;
  state.quests.push({
    id: Date.now() + Math.random(),
    title, category: cat || currentQuestCat,
    due: parsed.due, recurring: parsed.recurring,
    priority: parsed.priority || 4,
    tags: parsed.tags || [], questTags: parsed.quests || [],
    done: false, frozen: false, dueCompleted: null,
    created: todayKey(), subquests: []
  });
  saveState();
  inp.value = '';
  pendingNLP = null;
  document.getElementById('nlp-hint').style.display = 'none';
  SoundEngine.save();
  renderQuests();
}

function renderQuests() {
  ['main','today','side'].forEach(cat => {
    const container = document.getElementById('quest-list-' + cat);
    if (!container) return;
    const items = state.quests.filter(q => q.category === cat);
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = `<div style="padding:10px 0;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);text-align:center;">NONE</div>`;
      return;
    }
    items.forEach(q => {
      const realIdx = state.quests.indexOf(q);
      const el = document.createElement('div');
      el.className = 'todo-item' + (q.done?' done':'') + (q.frozen?' frozen':'');
      const overdue = q.due && isOverdue(q.due) && !q.done;
      const pc = ['','p1-color','p2-color','p3-color','p4-color'][q.priority||4] || '';
      el.innerHTML = `
        <div class="todo-chk" onclick="toggleQuest(${realIdx})">${q.done?'✓':''}</div>
        <div class="todo-body" onclick="toggleQuest(${realIdx})">
          <div class="todo-title">${escHtml(q.title)}</div>
          <div class="todo-meta">
            ${q.due?`<span class="todo-due${overdue?' overdue':''}">📅 ${formatDate(q.due)}${overdue?' OVERDUE':''}</span>`:''}
            ${q.priority<4?`<span class="todo-priority ${pc}">P${q.priority}</span>`:''}
            ${(q.tags||[]).map(t=>`<span class="todo-tag">@${escHtml(t)}</span>`).join('')}
            ${q.recurring?`<span style="font-family:var(--font-mono);font-size:8px;color:var(--secondary)">🔁 ${q.recurring}</span>`:''}
          </div>
          ${(q.subquests||[]).length?`<div style="margin-top:5px;font-family:var(--font-mono);font-size:8px;color:var(--text-muted);">${q.subquests.filter(s=>s.done).length}/${q.subquests.length} sub-quests</div>`:''}
        </div>
        <div class="todo-actions">
          ${q.frozen?'❄':''}
          <button class="todo-action-btn" onclick="event.stopPropagation();freezeQuest(${realIdx})">⏸</button>
          <button class="todo-action-btn" onclick="event.stopPropagation();deleteQuest(${realIdx})">×</button>
        </div>`;
      container.appendChild(el);
    });
    // Count
    const cnt = document.getElementById('qc-' + cat);
    if (cnt) cnt.textContent = items.filter(q=>!q.done).length;
  });
}

function toggleQuest(i) {
  const q = state.quests[i];
  if (!q || q.frozen) return;
  q.done = !q.done;
  if (q.done) {
    q.dueCompleted = todayKey();
    SoundEngine.questComplete();
    spawnParticles('✦', 3);
    processRecurringTasks();
  } else {
    SoundEngine.questUndo();
  }
  saveState(); renderQuests();
}

function freezeQuest(i) {
  state.quests[i].frozen = !state.quests[i].frozen;
  saveState(); renderQuests(); SoundEngine.tap();
}

function deleteQuest(i) {
  state.quests.splice(i, 1);
  saveState(); renderQuests();
}

function setQuestCat(cat) {
  currentQuestCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  SoundEngine.tap();
}

// ============================================================
// TRAINING TRACKER
// ============================================================
let activeSplit = 'ALL';

const SPLITS = ['ALL','CHEST','BACK','LEGS','SHOULDERS','ARMS','CORE','CARDIO','FULL'];

function renderTraining() {
  setText('training-date-label', currentTrainingDate === todayKey() ? 'TODAY' : formatDate(currentTrainingDate));
  setDisplay('training-today-btn', currentTrainingDate !== todayKey());

  // Split chips
  const container = document.getElementById('split-chips');
  if (container) {
    container.innerHTML = '';
    SPLITS.forEach(s => {
      const b = document.createElement('button');
      b.className = 'split-chip' + (s === activeSplit ? ' active' : '');
      b.textContent = s;
      b.onclick = () => { activeSplit = s; renderSplitChips(); SoundEngine.tap(); };
      container.appendChild(b);
    });
  }

  renderExercises();
}

function renderSplitChips() {
  document.querySelectorAll('.split-chip').forEach(b => b.classList.toggle('active', b.textContent === activeSplit));
}

function renderExercises() {
  const container = document.getElementById('exercise-list');
  if (!container) return;
  const exercises = state.exercises[currentTrainingDate] || [];
  container.innerHTML = '';
  exercises.forEach((ex, idx) => {
    container.appendChild(buildExCard(ex, idx));
  });
}

function buildExCard(ex, idx) {
  const card = document.createElement('div');
  card.className = 'ex-card';

  // Get last session data
  const history = getExerciseHistory(ex.name, currentTrainingDate);
  const lastSession = history[0];
  const pb = getExPB(ex.name);

  // Volume
  const volume = ex.sets.filter(s=>s.done && s.weight && s.reps)
    .reduce((sum, s) => sum + (parseFloat(s.weight)||0) * (parseInt(s.reps)||0), 0);

  let setsHtml = '';
  ex.sets.forEach((set, si) => {
    setsHtml += `
      <div class="set-row">
        <div class="set-n">${si+1}</div>
        <input class="set-inp" type="number" placeholder="—" value="${set.weight||''}" step="0.5" min="0"
          onchange="updateSet(${idx},${si},'weight',this.value)" />
        <input class="set-inp" type="number" placeholder="—" value="${set.reps||''}" min="0"
          onchange="updateSet(${idx},${si},'reps',this.value)" />
        <input class="set-inp" type="number" placeholder="—" value="${set.rir||''}" min="0" max="5"
          onchange="updateSet(${idx},${si},'rir',this.value)" />
        <button class="set-done ${set.done?'done':''}" onclick="toggleSetDone(${idx},${si})">
          ${set.done?'✓':'○'}
        </button>
      </div>`;
  });

  // History rows (last 3 sessions)
  let histHtml = '';
  if (history.length) {
    histHtml = `<div class="ex-history-panel">
      <div class="hist-title">PREVIOUS SESSIONS</div>`;
    history.slice(0, 3).forEach(h => {
      const bestSet = h.sets.filter(s=>s.weight&&s.reps).sort((a,b)=>b.weight-a.weight)[0];
      const vol = h.sets.filter(s=>s.weight&&s.reps).reduce((sum,s)=>sum+(parseFloat(s.weight)||0)*(parseInt(s.reps)||0),0);
      histHtml += `
        <div class="hist-entry">
          <div class="hist-date">${formatDateShort(h.date)}</div>
          <div class="hist-sets">${h.sets.length} sets${vol>0?' · '+Math.round(vol)+'kg vol':''}</div>
          <div class="hist-best">${bestSet?bestSet.weight+'×'+bestSet.reps:''}</div>
        </div>`;
    });
    histHtml += '</div>';
  }

  card.innerHTML = `
    <div class="ex-header">
      <div>
        <div class="ex-name">${escHtml(ex.name)}</div>
        ${lastSession ? `<div class="ex-last">Last: ${formatDateShort(lastSession.date)} — ${lastSession.sets.filter(s=>s.done).length} sets</div>` : ''}
        ${pb ? `<div class="ex-pb">PB: ${pb.weight}${state.settings.trainingWeightUnit} × ${pb.reps}</div>` : ''}
      </div>
      <button class="ex-dismiss" onclick="removeExercise(${idx})">×</button>
    </div>
    <div class="set-hdr">
      <div class="set-hdr-cell">#</div>
      <div class="set-hdr-cell">${state.settings.trainingWeightUnit.toUpperCase()}</div>
      <div class="set-hdr-cell">REPS</div>
      <div class="set-hdr-cell">RIR</div>
      <div class="set-hdr-cell">✓</div>
    </div>
    ${setsHtml}
    <div class="ex-footer">
      <button class="add-set-btn" onclick="addSet(${idx})">+ SET</button>
      <input class="ex-notes" placeholder="Notes..." value="${escHtml(ex.notes||'')}"
        onchange="updateExNote(${idx},this.value)" />
    </div>
    ${volume > 0 ? `<div class="ex-volume">VOLUME: ${Math.round(volume)} ${state.settings.trainingWeightUnit}</div>` : ''}
    ${histHtml}`;
  return card;
}

function getExerciseHistory(name, excludeDate) {
  const results = [];
  Object.entries(state.exercises).forEach(([date, exs]) => {
    if (date === excludeDate) return;
    const found = exs.find(e => e.name === name);
    if (found) results.push({ date, ...found });
  });
  return results.sort((a,b) => a.date < b.date ? 1 : -1);
}

function getExPB(name) {
  let best = null;
  Object.values(state.exercises).forEach(exs => {
    exs.forEach(ex => {
      if (ex.name !== name) return;
      ex.sets.forEach(s => {
        if (s.weight && s.reps && s.done) {
          if (!best || parseFloat(s.weight) > parseFloat(best.weight)) best = s;
        }
      });
    });
  });
  return best;
}

function addExercise(name) {
  if (!state.exercises[currentTrainingDate]) state.exercises[currentTrainingDate] = [];
  state.exercises[currentTrainingDate].push({ name, sets: [freshSet()], notes: '' });
  // Auto-mark trained
  const day = getDay(currentTrainingDate);
  if (currentTrainingDate === todayKey() && !day.coreQuests.trained) {
    day.coreQuests.trained = true;
  }
  saveState();
  closeModal('ex-add-modal');
  SoundEngine.save();
  renderExercises();
  if (currentSection === 'daily') renderDaily();
}

function freshSet() { return { weight: '', reps: '', rir: '', done: false }; }
function addSet(idx) { state.exercises[currentTrainingDate][idx].sets.push(freshSet()); saveState(); renderExercises(); }
function updateSet(idx, si, field, val) { state.exercises[currentTrainingDate][idx].sets[si][field] = val; saveState(); }
function toggleSetDone(idx, si) {
  const set = state.exercises[currentTrainingDate][idx].sets[si];
  set.done = !set.done;
  if (set.done) SoundEngine.questComplete();
  saveState(); renderExercises();
}
function updateExNote(idx, val) { state.exercises[currentTrainingDate][idx].notes = val; saveState(); }
function removeExercise(idx) { state.exercises[currentTrainingDate].splice(idx, 1); saveState(); renderExercises(); }
function navTrainingDate(dir) {
  const d = new Date(currentTrainingDate + 'T12:00:00');
  d.setDate(d.getDate() + dir);
  currentTrainingDate = d.toISOString().slice(0,10);
  renderTraining();
}
function openExModal() {
  renderExList('');
  openModal('ex-add-modal');
}
function renderExList(search) {
  const container = document.getElementById('ex-list-modal');
  if (!container) return;
  const list = activeSplit === 'ALL' ? getAllExercises() : getExercisesForSplit(activeSplit);
  const filtered = search ? list.filter(e => e.toLowerCase().includes(search.toLowerCase())) : list;
  container.innerHTML = '';
  if (search && !filtered.find(e => e.toLowerCase() === search.toLowerCase())) {
    const custom = document.createElement('div');
    custom.className = 'ex-list-item';
    custom.innerHTML = `<span style="color:var(--accent)">+ "${escHtml(search)}"</span>`;
    custom.onclick = () => addExercise(search);
    container.appendChild(custom);
  }
  filtered.slice(0, 25).forEach(name => {
    const history = getExerciseHistory(name, '9999');
    const item = document.createElement('div');
    item.className = 'ex-list-item';
    item.innerHTML = `${escHtml(name)}${history.length ? `<div class="ex-list-item-sub">Last: ${formatDateShort(history[0].date)}</div>` : ''}`;
    item.onclick = () => addExercise(name);
    container.appendChild(item);
  });
}

// ============================================================
// NUTRITION
// ============================================================
function renderNutrition() {
  const day = getDay(todayKey());
  const n = day.nutrition;
  const s = state.settings;

  const calEl = document.getElementById('nut-cal');
  if (calEl) {
    calEl.textContent = n.calories;
    calEl.className = 'nut-val' + (n.calories > s.caloriesGoal ? ' over' : n.calories > s.caloriesGoal * 0.8 ? ' good' : '');
  }
  setText('nut-protein', n.protein + 'g');
  setText('nut-carbs', n.carbs + 'g');
  setText('nut-fat', n.fat + 'g');
  setBarPct('bar-protein', (n.protein / s.proteinGoal) * 100);
  setBarPct('bar-carbs', (n.carbs / 300) * 100);
  setBarPct('bar-fat', (n.fat / 80) * 100);
  setText('supp-caffeine', n.caffeine);
  setText('supp-creatine', n.creatine);

  // TDEE
  const tdee = calculateTDEE();
  const tdeeCard = document.getElementById('tdee-card');
  if (tdeeCard) {
    if (tdee) {
      tdeeCard.style.display = '';
      setText('tdee-val', tdee.tdee + ' kcal');
      setText('tdee-avg-cal', tdee.avgCalories + ' kcal');
      setText('tdee-wt-change', (tdee.weightChange >= 0 ? '+' : '') + tdee.weightChange.toFixed(2) + `${s.bodyWeightUnit}/wk`);
      setText('tdee-data-pts', tdee.dataPoints + ' days');
    } else {
      tdeeCard.style.display = 'none';
    }
  }

  // Food log
  const list = document.getElementById('food-list');
  if (list) {
    list.innerHTML = '';
    (n.foods || []).forEach((f, i) => {
      const el = document.createElement('div');
      el.className = 'food-item';
      el.innerHTML = `
        <div class="food-name">${escHtml(f.name)}</div>
        <div><div class="food-kcal">${f.calories} kcal</div><div class="food-macros">P:${f.protein}g C:${f.carbs}g F:${f.fat}g</div></div>
        <div class="food-del" onclick="removeFood(${i})">×</div>`;
      list.appendChild(el);
    });
  }
}

function addFood() {
  const day = getDay(todayKey());
  const name = document.getElementById('food-name-inp')?.value.trim();
  const cals = parseInt(document.getElementById('food-cals-inp')?.value) || 0;
  const prot = parseInt(document.getElementById('food-prot-inp')?.value) || 0;
  const carbs = parseInt(document.getElementById('food-carbs-inp')?.value) || 0;
  const fat = parseInt(document.getElementById('food-fat-inp')?.value) || 0;
  if (!name || !cals) { SoundEngine.error(); return; }
  day.nutrition.foods.push({ name, calories: cals, protein: prot, carbs, fat });
  day.nutrition.calories += cals;
  day.nutrition.protein += prot;
  day.nutrition.carbs += carbs;
  day.nutrition.fat += fat;
  saveState();
  closeModal('food-modal');
  ['food-name-inp','food-cals-inp','food-prot-inp','food-carbs-inp','food-fat-inp'].forEach(id => { const e = document.getElementById(id); if(e) e.value=''; });
  SoundEngine.save();
  renderNutrition();
}

function removeFood(i) {
  const day = getDay(todayKey());
  const f = day.nutrition.foods[i];
  day.nutrition.calories -= f.calories;
  day.nutrition.protein -= f.protein;
  day.nutrition.carbs -= f.carbs;
  day.nutrition.fat -= f.fat;
  day.nutrition.foods.splice(i, 1);
  saveState(); renderNutrition();
}

function adjustSupp(type, dir) {
  const day = getDay(todayKey());
  const steps = { caffeine: 25, creatine: 5 };
  day.nutrition[type] = Math.max(0, (day.nutrition[type]||0) + dir * steps[type]);
  saveState(); renderNutrition(); SoundEngine.tap();
}

// ============================================================
// JOURNAL
// ============================================================
let selectedMood = null;

function renderJournal() {
  renderJournalEntries();
  // Charts
  setTimeout(() => {
    Charts.drawWeightChart('weight-chart-canvas', currentChartPeriod);
    renderWeightStats();
    renderCaloriesChart();
  }, 50);
}

function setMood(m) {
  selectedMood = m;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.mood) === m));
  getDay(todayKey()).mood = m;
  saveState();
  SoundEngine.tap();
}

function openJournalPrompts() {
  const day = getDay(todayKey());
  setVal('prompt-q1', day.journalPrompts?.howWasToday || '');
  setVal('prompt-q2', day.journalPrompts?.whatHappened || '');
  setVal('prompt-q3', day.journalPrompts?.howAreYouFeeling || '');
  document.getElementById('journal-prompts-section').style.display = 'block';
  document.getElementById('open-prompts-btn').style.display = 'none';
  SoundEngine.tap();
}

function saveJournalEntry() {
  const day = getDay(todayKey());
  day.journalPrompts = {
    howWasToday: document.getElementById('prompt-q1')?.value || '',
    whatHappened: document.getElementById('prompt-q2')?.value || '',
    howAreYouFeeling: document.getElementById('prompt-q3')?.value || ''
  };
  const freeText = document.getElementById('journal-free-text')?.value.trim();
  if (freeText) day.journalFree = freeText;
  const hasContent = Object.values(day.journalPrompts).some(v=>v) || freeText;
  if (!hasContent) return;
  state.journal.unshift({
    date: todayKey(), rank: autoRank(day), mood: day.mood,
    text: freeText || '', prompts: { ...day.journalPrompts }, intention: day.intention
  });
  saveState();
  SoundEngine.save();
  renderJournalEntries();
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries-list');
  if (!container) return;
  container.innerHTML = '';
  const MOODS = ['','😔','😐','😊'];
  state.journal.slice(0, 20).forEach(entry => {
    const el = document.createElement('div');
    el.className = 'j-entry';
    const hasPrompts = entry.prompts && Object.values(entry.prompts).some(v=>v);
    el.innerHTML = `
      <div class="j-entry-hdr">
        <div class="j-entry-date">${formatDate(entry.date)}</div>
        <div class="j-entry-meta">
          ${entry.mood ? `<span class="j-entry-mood">${MOODS[entry.mood]||''}</span>` : ''}
          ${entry.rank ? `<span class="j-entry-rank c-${(entry.rank||'').toLowerCase()}">${entry.rank}</span>` : ''}
        </div>
      </div>
      ${hasPrompts ? `
        <div style="margin-bottom:6px;">
          ${entry.prompts.howWasToday ? `<div class="j-entry-text" style="-webkit-line-clamp:2;">${escHtml(entry.prompts.howWasToday)}</div>` : ''}
        </div>` : ''}
      ${entry.text ? `<div class="j-entry-text">${escHtml(entry.text)}</div>` : ''}`;
    container.appendChild(el);
  });
  if (!state.journal.length) {
    container.innerHTML = '<div style="padding:16px;text-align:center;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);">NO ENTRIES YET</div>';
  }
}

function renderWeightStats() {
  const logs = state.weightLog.slice(-30);
  if (logs.length < 2) return;
  const current = logs[logs.length-1].weight;
  const start = logs[0].weight;
  const change = current - start;
  const trend = calculateActualTrend();
  const proj = calculateProjection();
  setText('wstat-current', current + ' ' + state.settings.bodyWeightUnit);
  const changeEl = document.getElementById('wstat-change');
  if (changeEl) {
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + ' ' + state.settings.bodyWeightUnit;
    changeEl.className = 'wstat-val ' + (change > 0 ? 'positive' : change < 0 ? 'negative' : '');
  }
  if (trend) {
    const el = document.getElementById('wstat-trend');
    if (el) {
      el.textContent = (trend.slopePerWeek >= 0 ? '+' : '') + trend.slopePerWeek.toFixed(2) + '/wk';
      el.className = 'wstat-val ' + (trend.slopePerWeek < 0 ? 'negative' : 'positive');
    }
  }
  if (proj && state.settings.weightGoal) {
    setText('wstat-goal', state.settings.weightGoal + ' ' + state.settings.bodyWeightUnit);
    setText('wstat-eta', proj.targetDate ? formatDate(proj.targetDate) : '—');
  }
}

function renderCaloriesChart() {
  const data = Object.entries(state.days).slice(-14).map(([date, day]) => ({
    value: day.nutrition?.calories || 0, label: formatDateShort(date).slice(0,3)
  }));
  Charts.drawBarChart('cal-chart-canvas', data, 'rgba(108,99,255,0.6)', state.settings.caloriesGoal, 'Calories');
}

function setChartPeriod(p) {
  currentChartPeriod = p;
  document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === p));
  Charts.drawWeightChart('weight-chart-canvas', p);
  SoundEngine.tap();
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  const s = state.settings;
  setVal('set-name', s.name);
  setVal('set-cal-goal', s.caloriesGoal);
  setVal('set-prot-goal', s.proteinGoal);
  setVal('set-steps-goal', s.stepsGoal);
  setVal('set-wake-time', s.wakeTime);
  setVal('set-evening-time', s.eveningTime);
  setVal('set-weight-goal', s.weightGoal || '');
  setVal('set-weight-deadline', s.weightDeadline || '');
  setVal('set-weight-pace', s.weightLossPace || 1.0);
  setVal('set-week-start', s.weekStartDay);
  const bwu = document.getElementById('set-body-weight-unit');
  if (bwu) bwu.value = s.bodyWeightUnit;
  const twu = document.getElementById('set-training-weight-unit');
  if (twu) twu.value = s.trainingWeightUnit;
  setToggle('toggle-sounds', s.sounds);
  setToggle('toggle-share-weight', s.shareWeight);

  // Theme grid
  const THEMES = [
    { id: 'sl', name: 'SOLO LVL', colors: ['#6c63ff','#38bdf8','#0c0c16'] },
    { id: 'ff7c', name: 'FF7 CLS', colors: ['#00d4aa','#c9a84c','#0a0a12'] },
    { id: 'ff7r', name: 'FF7 RMK', colors: ['#00c8e8','#8040c0','#080c12'] },
    { id: 'ro', name: 'RO ONLN', colors: ['#4a82b4','#cee4f9','#f0f8ff'] },
    { id: 'og', name: 'OVRGRD', colors: ['#ceeeff','#d88038','#65799a'] },
  ];
  const grid = document.getElementById('theme-grid');
  if (grid) {
    grid.innerHTML = '';
    THEMES.forEach(t => {
      const card = document.createElement('div');
      card.className = 'theme-card' + (s.theme === t.id ? ' active' : '');
      card.onclick = () => applyTheme(t.id);
      const swatchGrad = `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`;
      card.innerHTML = `
        <div class="theme-swatch" style="background:${swatchGrad};"></div>
        <div class="theme-card-name">${t.name}</div>`;
      grid.appendChild(card);
    });
  }
}

function applyTheme(id) {
  state.settings.theme = id;
  document.documentElement.dataset.theme = id;
  saveState();
  renderSettings();
  SoundEngine.tap();
}

function saveSetting(key, val) {
  state.settings[key] = val;
  saveState();
}

function saveSettingNum(key, val) {
  state.settings[key] = parseFloat(val) || 0;
  saveState();
}

function saveSettingStr(key, val) {
  state.settings[key] = val;
  saveState();
}

function toggleSetting(key, el) {
  state.settings[key] = !state.settings[key];
  if (el) el.classList.toggle('on', state.settings[key]);
  if (key === 'sounds') SoundEngine.setEnabled(state.settings[key]);
  saveState(); SoundEngine.tap();
}

// ============================================================
// ALARMS
// ============================================================
function setupAlarms() {
  setInterval(() => {
    const now = new Date();
    const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    const day = getDay(todayKey());
    if (t === state.settings.wakeTime && !day.morningDone && !alarmDismissed.morning) {
      showAlarm('🌅', 'MORNING LOG', 'Weight · Intention', openMorningPrompt);
    }
    if (t === state.settings.eveningTime && !day.eveningDone && !alarmDismissed.evening) {
      showAlarm('🌙', 'EVENING DEBRIEF', 'Rate your day', openEveningPrompt);
    }
  }, 30000);
}

function showAlarm(icon, title, sub, action) {
  setText('alarm-icon', icon);
  setText('alarm-title', title);
  setText('alarm-sub', sub);
  const openBtn = document.getElementById('alarm-open-btn');
  const closeBtn = document.getElementById('alarm-close-btn');
  if (openBtn) openBtn.onclick = (e) => { e.stopPropagation(); hideAlarm(); if (action) action(); };
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); hideAlarm(); };
  const banner = document.getElementById('alarm-banner');
  if (banner) banner.classList.add('show');
}

function hideAlarm() {
  const banner = document.getElementById('alarm-banner');
  if (banner) banner.classList.remove('show');
}

// ============================================================
// MODALS
// ============================================================
function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ============================================================
// ONBOARDING
// ============================================================
let onboardingStep = 0;

function startOnboarding() {
  onboardingStep = 0;
  showOnboardingStep(0);
  document.getElementById('onboarding-screen').classList.remove('hidden');
}

function showOnboardingStep(step) {
  document.querySelectorAll('.onboarding-step').forEach((el, i) => el.classList.toggle('active', i === step));
  document.querySelectorAll('.onboarding-dot').forEach((el, i) => el.classList.toggle('active', i === step));
}

function nextOnboardingStep() {
  const steps = [
    { inputId: 'ob-name', key: 'name', required: true },
    { inputId: 'ob-quest', key: 'mainQuest', required: false },
    { inputId: 'ob-wake', key: 'wakeTime', required: false },
  ];
  const step = steps[onboardingStep];
  if (step) {
    const val = document.getElementById(step.inputId)?.value.trim();
    if (step.required && !val) { SoundEngine.error(); return; }
    if (val) state.settings[step.key] = val;
  }
  onboardingStep++;
  if (onboardingStep >= steps.length) {
    state.settings.onboardingDone = true;
    saveState();
    document.getElementById('onboarding-screen').classList.add('hidden');
    SoundEngine.save();
    renderSection('daily');
  } else {
    showOnboardingStep(onboardingStep);
    SoundEngine.tap();
  }
}

// ============================================================
// UTILS
// ============================================================
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function setText(id, val) { const e=document.getElementById(id); if(e) e.textContent=val; }
function setVal(id, val) { const e=document.getElementById(id); if(e) e.value=val; }
function setStyle(id, prop, val) { const e=document.getElementById(id); if(e) e.style[prop]=val; }
function setDisplay(id, show) { const e=document.getElementById(id); if(e) e.style.display=show?'':'none'; }
function setBarPct(id, pct) { const e=document.getElementById(id); if(e) e.style.width=Math.min(100,Math.max(0,pct))+'%'; }
function setToggle(id, on) { const e=document.getElementById(id); if(e) e.classList.toggle('on',!!on); }

// ============================================================
// BOOT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  processRecurringTasks();

  // Apply theme
  document.documentElement.dataset.theme = state.settings.theme || 'sl';

  // Update date
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric' }).toUpperCase();

  // Init sounds — iOS requires AudioContext resumed on first user gesture
  SoundEngine.setEnabled(state.settings.sounds !== false);
  const unlockAudio = () => {
    SoundEngine.init();
    SoundEngine.resume();
  };
  document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  document.addEventListener('click', unlockAudio, { once: true });

  // Boot sequence
  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    boot.classList.add('fade-out');
    setTimeout(() => {
      boot.style.display = 'none';
      document.getElementById('app').classList.add('visible');

      // Onboarding
      if (!state.settings.onboardingDone) {
        startOnboarding();
      } else {
        switchSection('daily');
        setupAlarms();
        // Check morning prompt
        const day = getDay(todayKey());
        if (!day.morningDone) {
          setTimeout(() => showAlarm('🌅', 'MORNING LOG', 'Log weight + intention', openMorningPrompt), 1200);
        }
      }
    }, 700);
  }, 2400);

  // Desktop mode
  if (state.settings.showDesktop && window.innerWidth > 900) {
    setTimeout(() => switchLayout('desktop'), 100);
  }
});
