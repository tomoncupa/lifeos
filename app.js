/* ================================================================
   SYSTEM OS v3 — app.js
   Single file. No dependencies. No patches.
   ================================================================ */

'use strict';

// ================================================================
// 1. EXERCISE DATABASE (from provided CSV, 20 muscle groups)
// ================================================================
const EXERCISES = {
  'Push Up Variation':        ['Wall Push Ups','Incline Push Ups','Incline Deficit Push Ups','Kneeling Push Ups','Push Ups','Tricep Push Ups','Deficit Push Ups','Decline Push Ups','Decline Deficit Push Ups'],
  'Chest / Lower Chest':      ['Barbell Bench Press','Dumbbell Bench Press','Smith Machine Bench Press','Cable Flyes','Chest Dips','Chest Press','Dumbbell Flyes','Machine Flyes','Push Ups'],
  'Upper Chest':              ['Incline Barbell Bench Press','Incline Dumbbell Bench Press','Incline Smith Machine Bench Press','Decline Deficit Push Ups','Decline Push Ups','Incline Cable Flyes','Incline Chest Press','Incline Dumbbell Flyes','Incline Machine Flyes','Low Incline Dumbbell Press'],
  'Front Shoulders':          ['Dumbbell Press','Barbell Press','Barbell Front Raise','Dumbbell Front Raise','High Incline Dumbbell Press','Machine Shoulder Press'],
  'Side Shoulders':           ['Dumbbell Lateral Raises','Cable Lateral Raises','Barbell Upright Row','Cable Cross Body Lateral Raise','Cable Leaning Lateral Raise','Cable Upright Row','Dumbbell Upright Row','Machine Lateral Raise','Smith Machine Upright Row'],
  'Rear Shoulders':           ['Dumbbell Bent Lateral Raise','Cable Rope Facepull','Barbell Facepull','Cable Cross Body Bent Lateral Raise','Cable Single Arm Rear Delt Raise','Dumbbell Facepull','Incline Dumbbell Facepull','Incline Dumbbell Lateral Raise','Machine Reverse Flye'],
  'Triceps':                  ['Tricep Dips','Tricep Pushdown','Assisted Dips','Barbell Overhead Triceps Extension','Barbell Skullcrusher','Cable Overhead Triceps Extension','Cable Rope Overhead Triceps Extension','Cable Rope Pushdown','Cable Single Arm Triceps Pushdown','Cable Triceps Pushdown','Close Grip Bench Press','Dumbbell Skullcrusher','EZ Bar Overhead Tricep Extension','Machine Triceps Extension','Machine Triceps Pushdown','Overhead Extension','Tricep Push Ups'],
  'Biceps':                   ['Dumbbell Curl','Barbell Curl','Wall Curls','Barbell Curl Close Grip','Cable Curl','Chin Ups','Assisted Chin Ups','Dumbbell Preacher Curl','Dumbbell Spider Curl','EZ Bar Curl','EZ Bar Preacher Curl','Hammer Curl','Incline Dumbbell Curl','Machine Preacher Curl','Parallel Pull Ups','Assisted Parallel Pull Ups'],
  'Pull Up Variation':        ['Assisted Pull Ups','Reverse Row','Pull Ups','Assisted Chin Ups','Assisted Parallel Pull Ups','Parallel Pull Ups','Weighted Pull Ups'],
  'Vertical Pull':            ['Lat Pull Down','Assisted Pull Ups','Assisted Chin Ups','Assisted Parallel Pull Ups','Chin Ups','Dumbbell Pullover','Machine Pullover','Parallel Pull Ups','Pull Overs','Pull Ups','Straight Arm Pulldown','Underhand Pulldown','Weighted Pull Ups'],
  'Horizontal Pull':          ['Barbell Row','Seated Cable Row','Machine Row','Chest Supported Row','Dumbbell Row','Hammer High Row','Hammer Low Row','Incline Dumbbell Row','Inverted Row','Machine Chest Supported Row','Seal Row','Single Arm Supported Dumbbell Row','Smith Machine Row','T-Bar Row','Underhand EZ Bar Row'],
  'Traps':                    ['Dumbbell Shrug','Barbell Shrug','Cable Shrug','Trap Bar Shrug'],
  'BW Legs':                  ['BW Squats','Step Ups','Walking Lunges','Superior Lunges'],
  'Quads':                    ['Barbell Squats','Leg Press','Leg Extension','Bulgarian Split Squat','Smitch Machine Squats','Barbell Split Squat','Belt Squat','Front Squat','Hack Squat','High Bar Squat','Dumbbell Split Squat','Dumbbell Walking Lunge','Machine Glute Kickback','Single Leg Dumbbell Hip Thrust','Sumo Stance Belt Squat'],
  'Hamstrings':               ['Stiff Legged Deadlift','Seated Leg Curl','Dumbbell Stiff Legged Deadlift','Lying Leg Curl','Good Mornings','45 Degree Back Raise','Glute Ham Raise','High Bar Good Morning','Low Bar Good Morning','Single Leg Leg Curl'],
  'Glutes':                   ['Barbell Hip Thrust','Sumo Squat','Deadlift','Romanian Deadlift','Sumo Deadlift','Cable Pull Through','Deficit 25\'s Deadlift','Deficit Deadlift','Dumbbell Reverse Lunge','Dumbbell Walking Lunge','Barbell Walking Lunge'],
  'Calves':                   ['Standing Calf Raise','Leg Press Calf Extension','Calf Machine','Seated Calf Raise','Smith Machine Calf Extension'],
  'Abs/Core':                 ['Knee Raise','Hanging Knee Raise','Cable Rope Crunch','Abs Machine','Hanging Straight Leg Raise','Machine Crunch','Modified Candlestick','Reaching Sit-Up','Slant Board Sit-Up','V-Up'],
  'Incline Push / Front Delts':['Incline Barbell Bench Press','Incline Dumbbell Bench Press','Incline Smith Machine Bench Press','Decline Deficit Push Ups','Decline Push Ups','Incline Cable Flyes','Incline Chest Press','Incline Dumbbell Flyes','Incline Machine Flyes','Low Incline Dumbbell Press','Dumbbell Press','Barbell Press','Barbell Front Raise','Dumbbell Front Raise','High Incline Dumbbell Press','Machine Shoulder Press'],
  'Forearms':                 ['Barbell Wrist Curl','Cable Wrist Curl','Dumbbell Bench Wrist Curl','Dumbbell Wrist Curl'],
};

function allExercises() {
  const seen = new Set();
  Object.values(EXERCISES).flat().forEach(e => seen.add(e));
  return [...seen].sort();
}

// ================================================================
// 2. UTILITIES
// ================================================================
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const pad = n => String(n).padStart(2,'0');

function todayISO() { return new Date().toISOString().slice(0,10); }
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b+'T12:00:00') - new Date(a+'T12:00:00')) / 86400000);
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso+'T12:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});
}
function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso+'T12:00:00').toLocaleDateString('en',{month:'short',day:'numeric'});
}
function isOverdue(iso) { return iso && iso < todayISO(); }
function nextWeekday(n) {
  const d = new Date();
  const diff = (n - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0,10);
}
function isoToDisplay(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ================================================================
// 3. NLP DATE PARSER (Todoist-compatible)
// ================================================================
function parseNLP(raw) {
  let text = raw, due = null, dueLabel = '', recurring = null, priority = 4;
  const labels = [], projectId = null;
  let projectName = null;

  // Priority: !1 !2 !3 or !! !!! style
  text = text.replace(/!{3}/g, () => { priority = 1; return ''; });
  text = text.replace(/!{2}/g, () => { priority = 2; return ''; });
  text = text.replace(/!(\d)/g, (_, n) => { priority = Math.min(4, Math.max(1, parseInt(n))); return ''; });

  // Labels: @tag
  text = text.replace(/@(\w+)/g, (_, t) => { labels.push(t); return ''; });

  // Project: #name
  let proj = null;
  text = text.replace(/#(\w+)/g, (_, p) => { proj = p; return ''; });

  // Recurring
  if (/\bevery day\b/i.test(text))   { recurring = 'daily';   text = text.replace(/\bevery day\b/i,''); }
  if (/\bevery week\b/i.test(text))  { recurring = 'weekly';  text = text.replace(/\bevery week\b/i,''); }
  if (/\bevery month\b/i.test(text)) { recurring = 'monthly'; text = text.replace(/\bevery month\b/i,''); }
  if (/\beveryday\b/i.test(text))    { recurring = 'daily';   text = text.replace(/\beveryday\b/i,''); }

  // Due dates
  const today = todayISO();
  const checks = [
    [/\btoday\b/i,        () => today,              'Today'],
    [/\btomorrow\b/i,     () => addDays(today,1),   'Tomorrow'],
    [/\bnext week\b/i,    () => addDays(today,7),   'Next week'],
    [/\bnext month\b/i,   () => { const d=new Date(); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); }, 'Next month'],
    [/\bin (\d+) days?\b/i, m => addDays(today,+m[1]), null],
    [/\bin (\d+) weeks?\b/i, m => addDays(today,+m[1]*7), null],
    [/\b(mon|monday)\b/i,    () => nextWeekday(1), 'Monday'],
    [/\b(tue|tuesday)\b/i,   () => nextWeekday(2), 'Tuesday'],
    [/\b(wed|wednesday)\b/i, () => nextWeekday(3), 'Wednesday'],
    [/\b(thu|thursday)\b/i,  () => nextWeekday(4), 'Thursday'],
    [/\b(fri|friday)\b/i,    () => nextWeekday(5), 'Friday'],
    [/\b(sat|saturday)\b/i,  () => nextWeekday(6), 'Saturday'],
    [/\b(sun|sunday)\b/i,    () => nextWeekday(0), 'Sunday'],
  ];
  for (const [re, fn, lbl] of checks) {
    const m = text.match(re);
    if (m) {
      due = fn(m);
      dueLabel = lbl || fmtDate(due);
      text = text.replace(re, '');
      break;
    }
  }

  const content = text.replace(/\s+/g,' ').trim();
  return { content, due, dueLabel, recurring, priority, labels, proj };
}

// ================================================================
// 4. DEFAULT STATE FACTORIES
// ================================================================
const DEFAULTS = {
  name: '',
  mainObjective: '',
  wakeTime: '07:00',
  sleepGoal: 7,
  caloriesGoal: 2400,
  proteinGoal: 175,
  stepsGoal: 10000,
  bodyWeightUnit: 'lbs',
  trainingWeightUnit: 'kg',
  weekStartDay: 0,
  trainingDaysPerWeek: 4,
  theme: 'ff7c',
  sounds: true,
  restTimerAuto: true,
  restTimerDuration: 120,
  calBadgeEnabled: false,
  electrolyteMode: false,
  karmaEnabled: false,
  onboardingDone: false,
  supabaseUrl: '',
  supabaseKey: '',
  weightGoal: null,
  weightDeadline: null,
  weightPace: 1.0,
  shareWeight: false,
  supplements: [],
  caffeineHalfLifeMode: false,   // false = 5hr standard, true = 7hr slow metabolizer
  caffeineEnabled: true,
};

function freshDay(date) {
  return {
    date,
    weight: null,
    sleep: 0,
    steps: 0,
    trained: false,
    trackingOn: false,
    rank: null,
    intention: '',
    cals: 0, protein: 0,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    supplements: {},
    water: 0,
    mood: null,
    energyLevel: null,
    journalPrompts: { howWasToday:'', whatHappened:'', howAreYouFeeling:'' },
    journalFree: '',
    timeBlocks: [],
    pmDebriefDone: false,
  };
}

function freshQuest(overrides) {
  return {
    id: uid(),
    content: '',
    description: '',
    projectId: 'inbox',
    parentId: null,
    childIds: [],
    priority: 4,
    labels: [],
    due: null,
    dueLabel: '',
    recurring: null,
    checked: false,
    completedAt: null,
    frozen: false,
    createdAt: todayISO(),
    notes: [],
    itemOrder: 0,
    ...overrides,
  };
}

function freshProject(overrides) {
  return { id: uid(), name: '', color: '#6c63ff', itemOrder: 0, ...overrides };
}

function freshFood(overrides) {
  return { id: uid(), name: '', cals: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, potassium: 0, zinc: 0, magnesium: 0, servingSize: 100, servingUnit: 'g', ...overrides };
}

// ================================================================
// 5. STATE
// ================================================================
let S = {
  settings: { ...DEFAULTS },
  days: {},
  quests: [],
  projects: [
    { id: 'main',  name: 'Main Quest',   color: '#f0b323', itemOrder: 0 },
    { id: 'daily', name: 'Daily Quests', color: '#22c55e', itemOrder: 1 },
    { id: 'side',  name: 'Side Quests',  color: '#3b82f6', itemOrder: 2 },
  ],
  foodDB: [],
  training: {},
  weightLog: [],
  karma: { points: 0 },
  trackers: [],
  _v: 3,
};

// ================================================================
// 6. PERSISTENCE
// ================================================================
let _saveTimer = null;

function save(immediate = false) {
  S._dirty = true;
  if (immediate) { _flush(); return; }
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_flush, 1000);
}

function _flush() {
  try {
    localStorage.setItem('sos_v3', JSON.stringify(S));
    S._dirty = false;
    syncDot('synced');
  } catch(e) { syncDot('offline'); }
}

function load() {
  try {
    const raw = localStorage.getItem('sos_v3');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    // Merge settings
    S.settings = { ...DEFAULTS, ...parsed.settings };
    // Arrays — always arrays
    S.quests   = Array.isArray(parsed.quests)   ? parsed.quests   : [];
    S.projects = Array.isArray(parsed.projects)  ? parsed.projects : S.projects;
    S.foodDB   = Array.isArray(parsed.foodDB)    ? parsed.foodDB   : [];
    S.weightLog= Array.isArray(parsed.weightLog) ? parsed.weightLog: [];
    // Days — plain object
    S.days = parsed.days && typeof parsed.days === 'object' ? parsed.days : {};
    // Training — plain object keyed by date
    S.training = parsed.training && typeof parsed.training === 'object' ? parsed.training : {};
    S.karma = parsed.karma || { points: 0 };
    S.trackers = Array.isArray(parsed.trackers) ? parsed.trackers : [];
  } catch(e) {
    console.warn('Load failed, starting fresh:', e);
    localStorage.removeItem('sos_v3');
  }
}

window.addEventListener('pagehide', () => { if (S._dirty) _flush(); });
window.addEventListener('beforeunload', () => { if (S._dirty) _flush(); });

function syncDot(status) {
  const d = $('sync-dot');
  if (d) d.dataset.status = status;
}

// ================================================================
// 7. DAY HELPERS
// ================================================================
function getDay(date) {
  if (!S.days[date]) S.days[date] = freshDay(date);
  return S.days[date];
}

function todayDay() { return getDay(todayISO()); }

function autoRank(day) {
  if (day.rank !== null && day.rank !== undefined) return day.rank;
  const s = S.settings;
  const checks = [
    day.sleep >= s.sleepGoal,
    day.cals > 0 && day.cals <= s.caloriesGoal,
    day.protein >= s.proteinGoal,
    day.steps >= s.stepsGoal,
    day.trained,
    day.trackingOn,
  ];
  const done = checks.filter(Boolean).length;
  if (done === 6) return 'S';
  if (done === 5) return 'A';
  if (done === 4) return 'B';
  if (done === 3) return 'C';
  if (done === 2) return 'D';
  if (done === 1) return 'E';
  return 'F';
}

const RANK_COLOR = { S:'#f0b323', A:'#22c55e', B:'#3b82f6', C:'#f59e0b', D:'#64748b', E:'#374151', F:'#212322' };
function rankColor(r) { return RANK_COLOR[r] || '#212322'; }

function calculateStreak() {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0,10);
    const day = S.days[key];
    if (i === 0 && (!day || day.rank === null)) { d.setDate(d.getDate()-1); continue; }
    if (!day || day.rank === null) break;
    streak++;
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function calcNutritionTotals(day) {
  let cals = 0, protein = 0, carbs = 0, fat = 0;
  ['breakfast','lunch','dinner','snacks'].forEach(meal => {
    (day.meals[meal] || []).forEach(item => {
      cals    += item.cals    || 0;
      protein += item.protein || 0;
      carbs   += item.carbs   || 0;
      fat     += item.fat     || 0;
    });
  });
  return { cals, protein, carbs, fat };
}

function syncNutritionToDay(date) {
  const day = getDay(date);
  const tot = calcNutritionTotals(day);
  day.cals    = tot.cals;
  day.protein = tot.protein;
  if (date === todayISO()) renderDailyNutritionSync();
}

function renderDailyNutritionSync() {
  const day = getDay(currentDate);
  setText('daily-cals-val',    day.cals    + ' kcal');
  setText('daily-protein-val', day.protein + 'g');
  updateDailyChecks(day);
  updateRankDisplay(day);
}

function isTrainedToday(date) {
  const sess = S.training[date];
  return !!(sess && sess.exercises && sess.exercises.length > 0);
}

// ================================================================
// 8. TRAINING HELPERS
// ================================================================

// Exercise types — mirrors FitNotes ExerciseType enum
const EX_TYPE = {
  WEIGHT_AND_REPS:     'weight_reps',
  BODYWEIGHT_REPS:     'bodyweight_reps',
  WEIGHTED_BODYWEIGHT: 'weighted_bodyweight',
  ASSISTED_BODYWEIGHT: 'assisted_bodyweight',
  REPS_ONLY:           'reps_only',
  CARDIO:              'cardio',
};

const BW_EXERCISES = new Set([
  'Pull Ups','Chin Ups','Parallel Pull Ups','Assisted Pull Ups','Assisted Chin Ups',
  'Assisted Parallel Pull Ups','Weighted Pull Ups','Push Ups','Tricep Push Ups',
  'Wall Push Ups','Incline Push Ups','Decline Push Ups','Deficit Push Ups',
  'Incline Deficit Push Ups','Decline Deficit Push Ups','Kneeling Push Ups',
  'Tricep Dips','Chest Dips','Inverted Row','Reverse Row',
  'BW Squats','Step Ups','Walking Lunges','Superior Lunges','Knee Raise',
  'Hanging Knee Raise','Hanging Straight Leg Raise','Glute Ham Raise',
]);

function defaultExType(name) {
  if (BW_EXERCISES.has(name)) return EX_TYPE.BODYWEIGHT_REPS;
  return EX_TYPE.WEIGHT_AND_REPS;
}

function freshSet(overrides) {
  return { id: uid(), weight: null, reps: null, done: false, isPR: false, ...overrides };
}

function freshExerciseEntry(name, overrides) {
  return { name, type: defaultExType(name), oneOff: false, sets: [freshSet()], notes: '', ...overrides };
}

function getSession(date) {
  if (!S.training[date]) {
    S.training[date] = { date, exercises: [], sessionTimer: 0, notes: '', startTime: null };
  }
  return S.training[date];
}

function calc1RM(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

function getExerciseHistory(name, beforeDate, limit = 5) {
  return Object.entries(S.training)
    .filter(([d, sess]) => d < beforeDate && sess.exercises.some(e => e.name === name))
    .sort((a, b) => b[0] < a[0] ? -1 : 1)
    .slice(0, limit)
    .map(([date, sess]) => ({ date, ex: sess.exercises.find(e => e.name === name) }));
}

function getPRGrid(name) {
  const grid = {};
  Object.entries(S.training).forEach(([date, sess]) => {
    sess.exercises.filter(e => e.name === name).forEach(ex => {
      ex.sets.filter(s => s.done && s.weight && s.reps).forEach(s => {
        if (!grid[s.reps] || s.weight > grid[s.reps].weight) grid[s.reps] = { weight: s.weight, date };
      });
    });
  });
  return grid;
}

function getPersonalBest(name) {
  let best = null;
  Object.values(S.training).forEach(sess => {
    sess.exercises.filter(e => e.name === name).forEach(ex => {
      ex.sets.filter(s => s.done && s.weight && s.reps).forEach(s => {
        const r = calc1RM(s.weight, s.reps);
        if (!best || r > best.oneRM) best = { weight: s.weight, reps: s.reps, oneRM: r, date: sess.date };
      });
    });
  });
  return best;
}

function getExerciseProgressData(name) {
  return Object.entries(S.training)
    .filter(([, sess]) => sess.exercises.some(e => e.name === name))
    .sort((a, b) => a[0] < b[0] ? -1 : 1)
    .map(([date, sess]) => {
      const ex = sess.exercises.find(e => e.name === name);
      const doneSets = ex.sets.filter(s => s.done && s.weight && s.reps);
      if (!doneSets.length) return null;
      const maxWeight = Math.max(...doneSets.map(s => s.weight));
      const totalVolume = doneSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const best = doneSets.reduce((b, s) => calc1RM(s.weight, s.reps) > calc1RM(b.weight, b.reps) ? s : b);
      return { date, maxWeight, totalVolume, e1RM: calc1RM(best.weight, best.reps) };
    })
    .filter(Boolean);
}

function getSessionVolume(sess) {
  let vol = 0, sets = 0;
  sess.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.done && s.weight && s.reps) { vol += s.weight * s.reps; sets++; }
    });
  });
  return { vol: Math.round(vol), sets };
}

function markPRs(name, date) {
  const sess = S.training[date];
  if (!sess) return;
  const ex = sess.exercises.find(e => e.name === name);
  if (!ex) return;
  const grid = {};
  Object.entries(S.training).forEach(([d, s]) => {
    if (d >= date) return;
    s.exercises.filter(e => e.name === name).forEach(e => {
      e.sets.filter(s => s.done && s.weight && s.reps).forEach(s => {
        if (!grid[s.reps] || s.weight > grid[s.reps]) grid[s.reps] = s.weight;
      });
    });
  });
  ex.sets.forEach(s => {
    s.isPR = !!(s.done && s.weight && s.reps && (!grid[s.reps] || s.weight > grid[s.reps]));
  });
}

function isTrainedToday(date) {
  const sess = S.training[date];
  return !!(sess && sess.exercises && sess.exercises.some(ex => ex.sets.some(s => s.done)));
}

function getMuscleDays() {
  const result = {};
  const today = todayISO();
  Object.entries(S.training).forEach(([date, sess]) => {
    const daysAgo = daysBetween(date, today);
    sess.exercises.forEach(ex => {
      Object.entries(EXERCISES).forEach(([group, list]) => {
        if (list.includes(ex.name)) {
          if (!result[group] || result[group] > daysAgo) result[group] = daysAgo;
        }
      });
    });
  });
  return result;
}

// ================================================================
// 9. QUEST HELPERS
// ================================================================
function getProject(id) { return S.projects.find(p => p.id === id); }

function questsForProject(projectId, includeChildren = false) {
  return S.quests.filter(q => q.projectId === projectId && (includeChildren || !q.parentId));
}

function questsForToday() {
  const today = todayISO();
  return S.quests.filter(q => !q.checked && q.due === today);
}

function overdueQuests() {
  const today = todayISO();
  return S.quests.filter(q => !q.checked && q.due && q.due < today);
}

function upcomingQuests(days = 7) {
  const today = todayISO();
  const limit = addDays(today, days);
  return S.quests.filter(q => !q.checked && q.due && q.due > today && q.due <= limit)
    .sort((a,b) => a.due < b.due ? -1 : 1);
}

function addQuest(raw, projectId = 'side') {
  const parsed = parseNLP(raw);
  if (!parsed.content) return null;
  const pid = parsed.proj
    ? (S.projects.find(p => p.name.toLowerCase() === parsed.proj.toLowerCase())?.id || projectId)
    : projectId;
  const q = freshQuest({
    content: parsed.content,
    projectId: pid,
    priority: parsed.priority,
    labels: parsed.labels,
    due: parsed.due,
    dueLabel: parsed.dueLabel,
    recurring: parsed.recurring,
    itemOrder: S.quests.length,
    createdAt: todayISO(),
  });
  S.quests.push(q);
  save();
  return q;
}

function toggleQuest(id) {
  const q = S.quests.find(x => x.id === id);
  if (!q || q.frozen) return;
  q.checked = !q.checked;
  q.completedAt = q.checked ? todayISO() : null;
  if (q.checked && q.recurring) scheduleRecurring(q);
  if (S.settings.karmaEnabled) S.karma.points += q.checked ? 5 : -5;
  save();
}

function scheduleRecurring(q) {
  const base = q.due || todayISO();
  const next = q.recurring === 'daily'   ? addDays(base, 1)
             : q.recurring === 'weekly'  ? addDays(base, 7)
             : q.recurring === 'monthly' ? (() => { const d = new Date(base+'T12:00:00'); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); })()
             : null;
  if (!next) return;
  const newQ = freshQuest({ ...q, id: uid(), checked: false, completedAt: null, due: next, itemOrder: S.quests.length });
  S.quests.push(newQ);
}

function deleteQuest(id) {
  // Also delete children
  const q = S.quests.find(x => x.id === id);
  if (!q) return;
  q.childIds?.forEach(cid => deleteQuest(cid));
  S.quests = S.quests.filter(x => x.id !== id);
  // Remove from parent
  if (q.parentId) {
    const parent = S.quests.find(x => x.id === q.parentId);
    if (parent) parent.childIds = parent.childIds.filter(c => c !== id);
  }
  save();
}

function addSubQuest(parentId, content) {
  const parent = S.quests.find(x => x.id === parentId);
  if (!parent || !content.trim()) return null;
  const q = freshQuest({
    content: content.trim(),
    projectId: parent.projectId,
    parentId,
    itemOrder: parent.childIds.length,
  });
  S.quests.push(q);
  parent.childIds.push(q.id);
  save();
  return q;
}

// ================================================================
// 10. FOOD DB HELPERS
// ================================================================
function searchFoodDB(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const deleted = S._deletedFromDB || [];
  return S.foodDB
    .filter(f => !deleted.includes(f.id) && f.name.toLowerCase().includes(q))
    .slice(0, 15);
}

function addToFoodDB(food) {
  if (!S.foodDB.find(f => f.name.toLowerCase() === food.name.toLowerCase())) {
    S.foodDB.push({ ...food, id: food.id || uid() });
    save();
  }
}

function logFoodItem(date, meal, food, qty = 1) {
  const day = getDay(date);
  const item = {
    id: uid(),
    foodId: food.id,
    name: food.name,
    qty,
    cals:    Math.round((food.cals    || 0) * qty),
    protein: Math.round((food.protein || 0) * qty),
    carbs:   Math.round((food.carbs   || 0) * qty),
    fat:     Math.round((food.fat     || 0) * qty),
    sodium:      Math.round((food.sodium      || 0) * qty),
    potassium:   Math.round((food.potassium   || 0) * qty),
    zinc:        Math.round((food.zinc        || 0) * qty),
    magnesium:   Math.round((food.magnesium   || 0) * qty),
  };
  day.meals[meal].push(item);
  syncNutritionToDay(date);
  save();
  return item;
}

function removeFoodItem(date, meal, itemId) {
  const day = getDay(date);
  day.meals[meal] = day.meals[meal].filter(i => i.id !== itemId);
  syncNutritionToDay(date);
  save();
}

// ================================================================
// 11. WEIGHT LOG
// ================================================================
function logWeight(date, weight) {
  const existing = S.weightLog.findIndex(w => w.date === date);
  if (existing >= 0) S.weightLog[existing].weight = weight;
  else S.weightLog.push({ date, weight });
  S.weightLog.sort((a,b) => a.date < b.date ? -1 : 1);
  getDay(date).weight = weight;
  save();
}

function calcWeightTrend() {
  const logs = S.weightLog.slice(-30);
  if (logs.length < 3) return null;
  const n = logs.length, xm = (n-1)/2;
  const ym = logs.reduce((s,l) => s+l.weight, 0) / n;
  let num = 0, den = 0;
  logs.forEach((l,i) => { num += (i-xm)*(l.weight-ym); den += (i-xm)**2; });
  return den ? num/den : 0;
}

function calcTDEE() {
  const days = Object.values(S.days)
    .filter(d => d.cals > 0)
    .sort((a,b) => a.date < b.date ? -1 : 1)
    .slice(-14);
  const weights = S.weightLog.slice(-14);
  if (days.length < 7 || weights.length < 5) return null;
  const avgCal = days.reduce((s,d) => s+d.cals, 0) / days.length;
  const weightChange = (weights[weights.length-1].weight - weights[0].weight) / weights.length;
  return Math.round(avgCal - weightChange * 500);
}

// ================================================================
// 12. SOUND ENGINE
// ================================================================
let _ctx = null;
function audioCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}
function unlockAudio() {
  try { audioCtx(); } catch(e) {}
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('click', unlockAudio);
}
document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
document.addEventListener('click', unlockAudio, { once: true });

function beep(freq, dur, vol = 0.15, type = 'sine') {
  if (!S.settings.sounds) return;
  try {
    const ctx = audioCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.01);
  } catch(e) {}
}

const SFX = {
  tap:     () => beep(600, 0.06, 0.08),
  check:   () => { beep(440, 0.08, 0.12); setTimeout(() => beep(660, 0.12, 0.1), 80); },
  uncheck: () => { beep(330, 0.08, 0.08); setTimeout(() => beep(220, 0.1, 0.06), 80); },
  save:    () => beep(800, 0.08, 0.1),
  error:   () => { beep(200, 0.1, 0.12, 'sawtooth'); },
  rankS:   () => {
    [523, 659, 784, 1047].forEach((f,i) => setTimeout(() => beep(f, 0.18, 0.15, 'triangle'), i*90));
    setTimeout(() => beep(1047, 0.4, 0.12), 400);
  },
  rankGood: () => {
    [440, 554, 659].forEach((f,i) => setTimeout(() => beep(f, 0.15, 0.12, 'triangle'), i*80));
  },
  restDone: () => { beep(880, 0.12, 0.15); setTimeout(() => beep(880, 0.12, 0.15), 150); },
};

// ================================================================
// 13. REST TIMER
// ================================================================
let _restTimer = null, _restRemaining = 0, _restTotal = 0;

function startRestTimer(seconds) {
  clearInterval(_restTimer);
  _restRemaining = seconds;
  _restTotal = seconds;
  updateRestDisplay();
  _restTimer = setInterval(() => {
    _restRemaining--;
    updateRestDisplay();
    if (_restRemaining <= 0) {
      clearInterval(_restTimer);
      _restTimer = null;
      SFX.restDone();
      hideRestTimer();
    }
  }, 1000);
}

function updateRestDisplay() {
  const bar = $('rest-timer-bar');
  const txt = $('rest-timer-text');
  if (!bar) return;
  bar.style.display = 'flex';
  if (txt) txt.style.display = 'block';
  const mins = Math.floor(_restRemaining / 60);
  const secs = _restRemaining % 60;
  if (txt) txt.textContent = `REST  ${mins}:${pad(secs)}`;
  const pct = _restTotal > 0 ? (_restRemaining / _restTotal) : 0;
  const fill = $('rest-timer-fill');
  if (fill) fill.style.width = (pct * 100) + '%';
}

function hideRestTimer() {
  const bar = $('rest-timer-bar');
  const txt = $('rest-timer-text');
  if (bar) bar.style.display = 'none';
  if (txt) txt.style.display = 'none';
  clearInterval(_restTimer);
  _restTimer = null;
}

// ================================================================
// 14. SESSION TIMER
// ================================================================
let _sessionTimer = null, _sessionSeconds = 0;

function startSessionTimer() {
  if (_sessionTimer) return;
  _sessionTimer = setInterval(() => {
    _sessionSeconds++;
    const m = Math.floor(_sessionSeconds / 60), s = _sessionSeconds % 60;
    setText('session-timer-text', `${pad(m)}:${pad(s)}`);
  }, 1000);
}

function stopSessionTimer() {
  clearInterval(_sessionTimer);
  _sessionTimer = null;
  return _sessionSeconds;
}

// ================================================================
// 15. TIME TRACKER (Toggl-style)
// ================================================================
let _timeBlock = null, _timeInterval = null;

function startTimeBlock(label) {
  if (_timeBlock) stopTimeBlock();
  _timeBlock = { id: uid(), label: label || 'Focus', start: Date.now(), end: null, duration: 0 };
  _timeInterval = setInterval(updateTimeBlockDisplay, 1000);
  updateTimeBlockDisplay();
}

function stopTimeBlock() {
  if (!_timeBlock) return null;
  clearInterval(_timeInterval);
  _timeInterval = null;
  _timeBlock.end = Date.now();
  _timeBlock.duration = Math.round((_timeBlock.end - _timeBlock.start) / 1000);
  const block = { ..._timeBlock };
  const day = todayDay();
  day.timeBlocks.push(block);
  _timeBlock = null;
  save();
  renderTimeTracker();
  return block;
}

function updateTimeBlockDisplay() {
  if (!_timeBlock) return;
  const elapsed = Math.round((Date.now() - _timeBlock.start) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  setText('time-tracker-running', `${_timeBlock.label}  ${pad(m)}:${pad(s)}`);
}

// ================================================================
// 16. SHARE / EXPORT (transparent PNG)
// ================================================================
function buildShareCard(transparent = true) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const day = getDay(currentDate);
  const rank = autoRank(day);
  const streak = calculateStreak();

  // Background
  if (transparent) {
    ctx.clearRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(0, 0, W, H);
    // Subtle vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.9);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // Top accent line
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.3, rankColor(rank));
  lineGrad.addColorStop(0.7, rankColor(rank) + '88');
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(W, 200); ctx.stroke();

  // SYSTEM OS label
  ctx.font = '500 40px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('SYSTEM OS', W/2, 160);

  // Date
  ctx.font = '32px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(fmtDate(currentDate).toUpperCase(), W/2, 260);

  // Rank — massive
  ctx.font = '900 380px "Cinzel", serif';
  ctx.shadowColor = rankColor(rank);
  ctx.shadowBlur = 100;
  ctx.fillStyle = rankColor(rank);
  ctx.fillText(rank, W/2, 720);
  ctx.shadowBlur = 0;

  ctx.font = '40px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('DAY RANK', W/2, 800);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(120, 860); ctx.lineTo(W-120, 860); ctx.stroke();

  // Quest summary
  const checks = [
    { label: 'SLEEP',    done: day.sleep >= S.settings.sleepGoal,            val: day.sleep > 0 ? day.sleep+'h' : '' },
    { label: 'CALORIES', done: day.cals > 0 && day.cals <= S.settings.caloriesGoal, val: day.cals > 0 ? day.cals+' kcal' : '' },
    { label: 'PROTEIN',  done: day.protein >= S.settings.proteinGoal,        val: day.protein > 0 ? day.protein+'g' : '' },
    { label: 'STEPS',    done: day.steps >= S.settings.stepsGoal,            val: day.steps > 0 ? day.steps.toLocaleString() : '' },
    { label: 'TRAINED',  done: day.trained,                                  val: '' },
    { label: 'TRACKING', done: day.trackingOn,                               val: '' },
  ];

  checks.forEach((c, i) => {
    const y = 960 + i * 140;
    ctx.fillStyle = c.done ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)';
    roundRect(ctx, 80, y - 60, W - 160, 110, 16); ctx.fill();
    // Check circle
    ctx.beginPath();
    ctx.arc(150, y - 5, 28, 0, Math.PI * 2);
    ctx.strokeStyle = c.done ? rankColor(rank) : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 3; ctx.stroke();
    if (c.done) {
      ctx.fillStyle = rankColor(rank);
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', 150, y - 5 + 10);
    }
    ctx.font = `${c.done?'600':'400'} 42px "Rajdhani", sans-serif`;
    ctx.fillStyle = c.done ? '#fff' : 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'left';
    ctx.fillText(c.label, 200, y + 14);
    if (c.val) {
      ctx.font = '36px "Share Tech Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'right';
      ctx.fillText(c.val, W - 100, y + 14);
    }
  });

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.moveTo(120, 1820); ctx.lineTo(W-120, 1820); ctx.stroke();

  // Stats row
  const stats = [{ label:'STREAK', val: streak+'🔥' }];
  if (S.settings.shareWeight && day.weight) stats.push({ label: 'WEIGHT', val: day.weight + S.settings.bodyWeightUnit });
  const sw = W / (stats.length + 2);
  ctx.textAlign = 'center';
  stats.forEach((st, i) => {
    const cx = sw * (i + 1.5);
    ctx.font = 'bold 56px "Cinzel", serif';
    ctx.fillStyle = rankColor(rank);
    ctx.fillText(st.val, cx, 1870);
    ctx.font = '26px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(st.label, cx, 1910);
  });

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

function showShareFullscreen(transparent) {
  const canvas = buildShareCard(transparent);
  const img = $('share-img');
  img.src = canvas.toDataURL('image/png');
  $('share-screen').classList.add('active');
}

// ================================================================
// 17. CHARTS
// ================================================================
function drawChart(canvasId, datasets, options = {}) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 320;
  const H = options.height || 180;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const pad = { top: 16, right: 16, bottom: 32, left: 48 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  if (!datasets.length || !datasets[0].points.length) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '11px Share Tech Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', W/2, H/2);
    return;
  }

  // Value range
  let minY = Infinity, maxY = -Infinity;
  datasets.forEach(d => d.points.forEach(p => { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }));
  if (options.goalLine !== undefined) { minY = Math.min(minY, options.goalLine); maxY = Math.max(maxY, options.goalLine); }
  const yRange = maxY - minY || 1;
  minY -= yRange * 0.1; maxY += yRange * 0.1;

  // X range
  const allX = datasets.flatMap(d => d.points.map(p => p.x));
  let minX = Math.min(...allX), maxX = Math.max(...allX);
  if (options.xMax !== undefined) maxX = options.xMax;
  const xRange = maxX - minX || 1;

  const xP = x => pad.left + ((x - minX) / xRange) * cW;
  const yP = y => pad.top + cH - ((y - minY) / (maxY - minY)) * cH;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i/4) * cH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W-pad.right, y); ctx.stroke();
    const val = maxY - (i/4)*(maxY-minY);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px Share Tech Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(val), pad.left - 4, y + 3);
  }

  // Goal line
  if (options.goalLine !== undefined) {
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1; ctx.setLineDash([6,4]);
    const gy = yP(options.goalLine);
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W-pad.right, gy); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Projection line
  if (options.projectionTo) {
    const last = datasets[0].points[datasets[0].points.length-1];
    ctx.strokeStyle = 'rgba(99,102,241,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
    ctx.beginPath();
    ctx.moveTo(xP(last.x), yP(last.y));
    ctx.lineTo(xP(options.projectionTo.x), yP(options.projectionTo.y));
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Moving average
  if (options.movingAvg && datasets[0].points.length >= 7) {
    const pts = datasets[0].points;
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.setLineDash([3,3]);
    ctx.beginPath();
    for (let i = 6; i < pts.length; i++) {
      const avg = pts.slice(i-6, i+1).reduce((s,p) => s+p.y, 0) / 7;
      i === 6 ? ctx.moveTo(xP(pts[i].x), yP(avg)) : ctx.lineTo(xP(pts[i].x), yP(avg));
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Dataset lines
  datasets.forEach(d => {
    if (!d.points.length) return;
    ctx.strokeStyle = d.color; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath();
    d.points.forEach((p, i) => { i === 0 ? ctx.moveTo(xP(p.x), yP(p.y)) : ctx.lineTo(xP(p.x), yP(p.y)); });
    ctx.stroke();
    // Dots
    d.points.forEach((p, i) => {
      if (i % Math.max(1, Math.floor(d.points.length / 15)) === 0 || i === d.points.length-1) {
        ctx.beginPath(); ctx.arc(xP(p.x), yP(p.y), 3, 0, Math.PI*2);
        ctx.fillStyle = d.color; ctx.fill();
      }
    });
  });

  // X labels
  const nLabels = Math.min(6, allX.length);
  const step = Math.ceil(allX.length / nLabels);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px Share Tech Mono, monospace'; ctx.textAlign = 'center';
  allX.filter((_,i) => i % step === 0).forEach(x => {
    ctx.fillText(x.toString().slice(5), xP(x), H - pad.bottom + 12);
  });
}

function weightChartDatasets() {
  const logs = S.weightLog.slice(-90);
  const pts = logs.map((w, i) => ({ x: w.date, y: w.weight }));
  return [{ points: pts, color: '#f0b323', label: 'Weight' }];
}

// ================================================================
// 18. NAVIGATION STATE
// ================================================================
let currentSection = null;
let currentDate = todayISO();
let activeView = 'today'; // quest view
let activeProject = null;
let currentTrainingDate = todayISO();
let currentNutritionDate = todayISO();
let currentMeal = 'breakfast';

const SECTIONS = ['daily','quests','training','nutrition','journal','settings'];

function nav(name) {
  if (name === currentSection) return;
  currentSection = name;
  SECTIONS.forEach(s => {
    $('sec-'+s)?.classList.toggle('active', s === name);
    document.querySelector(`[data-nav="${s}"]`)?.classList.toggle('active', s === name);
  });
  SFX.tap();
  requestAnimationFrame(() => {
    try { render(name); } catch(e) { console.error('render error:', name, e); }
  });
}

function render(name) {
  if (name !== 'journal') stopCaffeineUpdates();
  switch(name) {
    case 'daily':     renderDaily(); break;
    case 'quests':    renderQuests(); break;
    case 'training':  renderTraining(); break;
    case 'nutrition': renderNutrition(); break;
    case 'journal':   renderJournal(); break;
    case 'settings':  renderSettings(); break;
  }
}

// ================================================================
// 19. DAILY RENDER
// ================================================================
function renderDaily() {
  const day = getDay(currentDate);
  const s = S.settings;
  const isToday = currentDate === todayISO();

  // Date nav
  setText('daily-date', currentDate === todayISO() ? 'TODAY' : fmtDate(currentDate).toUpperCase());
  $('daily-prev-date')?.classList.toggle('hidden', false);
  $('daily-next-date')?.classList.toggle('hidden', isToday);

  // Weight
  const wInp = $('daily-weight-input');
  if (wInp && document.activeElement !== wInp) wInp.value = day.weight || '';

  // Rank
  const rank = autoRank(day);
  const rankEl = $('daily-rank');
  if (rankEl) {
    rankEl.textContent = rank;
    rankEl.style.color = rankColor(rank);
    rankEl.style.borderColor = rankColor(rank);
  }

  // Core quests
  updateDailyChecks(day);
  updateRankDisplay(day);

  // Upcoming quests
  renderDailyUpcoming();
}

function updateDailyChecks(day) {
  const s = S.settings;
  setCheck('check-sleep',    day.sleep >= s.sleepGoal,                          day.sleep > 0 ? day.sleep+'h' : '—');
  setCheck('check-cals',     day.cals > 0 && day.cals <= s.caloriesGoal,        day.cals > 0 ? day.cals.toLocaleString()+' kcal' : '—');
  setCheck('check-protein',  day.protein >= s.proteinGoal,                      day.protein > 0 ? day.protein+'g' : '—');
  setCheck('check-steps',    day.steps >= s.stepsGoal,                          day.steps > 0 ? day.steps.toLocaleString() : '—');
  setCheck('check-trained',  isTrainedToday(currentDate),                       isTrainedToday(currentDate) ? 'LOGGED' : '—');
  setCheck('check-tracking', day.trackingOn,                                    day.trackingOn ? 'ON' : 'OFF');

  // Nutrition values display
  setText('daily-cals-val',    day.cals    > 0 ? day.cals.toLocaleString()    : '—');
  setText('daily-protein-val', day.protein > 0 ? day.protein + 'g'            : '—');
}

function setCheck(id, done, val) {
  const row = $(id);
  if (!row) return;
  row.classList.toggle('done', done);
  const valEl = row.querySelector('.quest-row-val');
  if (valEl) valEl.textContent = val || '';
  const dot = row.querySelector('.quest-dot');
  if (dot) {
    dot.textContent = done ? '✓' : '';
    dot.classList.toggle('done', done);
  }
}

function updateRankDisplay(day) {
  const rank = autoRank(day);
  const el = $('daily-rank');
  if (el) { el.textContent = rank; el.style.color = rankColor(rank); el.style.borderColor = rankColor(rank); }
  const topEl = $('topbar-rank');
  if (topEl) { topEl.textContent = rank; topEl.style.color = rankColor(rank); }
  const streak = calculateStreak();
  setText('topbar-streak', streak);
}

function renderDailyUpcoming() {
  const container = $('daily-upcoming');
  if (!container) return;
  const quests = [...questsForToday(), ...upcomingQuests(3)].slice(0, 5);
  if (!quests.length) {
    container.innerHTML = '<div class="empty-hint">No upcoming quests, Player.</div>';
    return;
  }
  container.innerHTML = quests.map(q => `
    <div class="upcoming-quest-row" onclick="nav('quests')">
      <span class="uq-dot" style="background:${getProject(q.projectId)?.color||'#6b7280'}"></span>
      <span class="uq-content">${esc(q.content)}</span>
      <span class="uq-due">${q.due === todayISO() ? 'Today' : fmtDateShort(q.due)}</span>
    </div>`).join('');
}

// ================================================================
// 20. QUEST RENDER
// ================================================================
function renderQuests() {
  renderQuestSidebar();
  renderQuestList();
  updateQuestBadge();
}

function renderQuestSidebar() {
  const sidebar = $('quest-sidebar');
  if (!sidebar) return;

  const todayCount = questsForToday().length + overdueQuests().length;
  const views = [
    { id: 'today',    label: 'Today',    badge: todayCount },
    { id: 'upcoming', label: 'Upcoming', badge: upcomingQuests().length },
    { id: 'all',      label: 'All',      badge: S.quests.filter(q=>!q.checked).length },
  ];

  let html = views.map(v => `
    <div class="sidebar-row ${activeView===v.id&&!activeProject?'active':''}" onclick="setView('${v.id}')">
      <span class="sidebar-label">${v.label}</span>
      ${v.badge > 0 ? `<span class="sidebar-badge">${v.badge}</span>` : ''}
    </div>`).join('');

  html += '<div class="sidebar-divider"></div>';

  html += S.projects.map(p => {
    const count = questsForProject(p.id).filter(q=>!q.checked).length;
    return `<div class="sidebar-row ${activeProject===p.id?'active':''}" onclick="setProject('${p.id}')">
      <span class="sidebar-dot" style="background:${p.color}"></span>
      <span class="sidebar-label">${esc(p.name)}</span>
      ${count > 0 ? `<span class="sidebar-badge">${count}</span>` : ''}
    </div>`;
  }).join('');

  html += `<div class="sidebar-add-project" onclick="openModal('modal-add-project')">+ Board</div>`;
  sidebar.innerHTML = html;
}

function renderQuestList() {
  const list = $('quest-list');
  if (!list) return;

  let quests = [];
  const today = todayISO();

  if (activeProject) {
    quests = questsForProject(activeProject).sort((a,b) => a.priority - b.priority || a.itemOrder - b.itemOrder);
  } else if (activeView === 'today') {
    quests = [...overdueQuests().map(q=>({...q,_overdue:true})), ...questsForToday()];
  } else if (activeView === 'upcoming') {
    quests = upcomingQuests(14);
  } else {
    quests = S.quests.filter(q => !q.parentId).sort((a,b) => {
      if (a.due && b.due) return a.due < b.due ? -1 : 1;
      if (a.due) return -1; if (b.due) return 1;
      return a.priority - b.priority;
    });
  }

  const active = quests.filter(q => !q.checked);
  const done   = quests.filter(q => q.checked);

  if (!active.length && !done.length) {
    list.innerHTML = `<div class="quest-empty"><div class="quest-empty-icon">⚔</div><div>Board clear, Player.</div><div class="quest-empty-sub">What's the next objective?</div></div>`;
    return;
  }

  list.innerHTML = '';
  active.forEach(q => list.appendChild(buildQuestRow(q)));

  if (done.length) {
    const tog = el('div', 'completed-toggle', `▸ Completed (${done.length})`);
    let showDone = false;
    tog.onclick = () => {
      showDone = !showDone;
      tog.textContent = (showDone ? '▾' : '▸') + ` Completed (${done.length})`;
      const container = $('done-quests');
      if (container) container.style.display = showDone ? '' : 'none';
    };
    list.appendChild(tog);
    const doneContainer = el('div', '');
    doneContainer.id = 'done-quests';
    doneContainer.style.display = 'none';
    done.forEach(q => doneContainer.appendChild(buildQuestRow(q)));
    list.appendChild(doneContainer);
  }
}

function buildQuestRow(q, depth = 0) {
  const wrap = el('div', 'quest-row-wrap');
  const row = el('div', 'quest-row' + (q.checked?' done':'') + (q.frozen?' frozen':'') + (q._overdue?' overdue':''));
  row.dataset.id = q.id;
  if (depth > 0) row.style.marginLeft = (depth * 20) + 'px';

  const PRIO = ['','prio-legendary','prio-epic','prio-rare',''];
  const prioColor = ['','#f0b323','#ef4444','#3b82f6','#64748b'];

  row.innerHTML = `
    <div class="quest-check ${PRIO[q.priority]||''}" onclick="handleToggleQuest('${q.id}')" style="border-color:${prioColor[q.priority]||''}">
      ${q.checked ? '✓' : ''}
    </div>
    <div class="quest-body" onclick="openQuestDetail('${q.id}')">
      <div class="quest-content">${esc(q.content)}
        ${q.notes?.length ? `<span class="quest-meta-icon">💬</span>` : ''}
        ${q.childIds?.length ? `<span class="quest-meta-icon">◫ ${q.childIds.filter(id => !S.quests.find(x=>x.id===id)?.checked).length}/${q.childIds.length}</span>` : ''}
      </div>
      <div class="quest-meta">
        ${q.due ? `<span class="quest-due ${isOverdue(q.due)?'overdue':''}">${q._overdue?'🔴 ':''} ${q.due===todayISO()?'Today':fmtDateShort(q.due)}</span>` : ''}
        ${(q.labels||[]).map(l=>`<span class="quest-label">@${esc(l)}</span>`).join('')}
        ${q.recurring ? `<span class="quest-recurring">🔁</span>` : ''}
        ${q.priority < 4 ? `<span class="quest-prio" style="color:${prioColor[q.priority]}">${['','!!!','!!','!',''][q.priority]}</span>` : ''}
      </div>
    </div>
    <div class="quest-actions">
      <button class="quest-action-btn" onclick="handleToggleFreeze('${q.id}')">⏸</button>
      <button class="quest-action-btn danger" onclick="handleDeleteQuest('${q.id}')">×</button>
    </div>`;

  // Swipe to reveal
  setupSwipe(row, () => handleDeleteQuest(q.id));

  wrap.appendChild(row);

  // Render children
  if (q.childIds?.length && !q.checked) {
    q.childIds.forEach(cid => {
      const child = S.quests.find(x => x.id === cid);
      if (child) wrap.appendChild(buildQuestRow(child, depth + 1));
    });
  }

  return wrap;
}

function setupSwipe(el, onDelete) {
  let startX = 0, dx = 0;
  el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchmove', e => {
    dx = e.touches[0].clientX - startX;
    if (dx < -20) el.style.transform = `translateX(${Math.max(dx, -80)}px)`;
  }, { passive: true });
  el.addEventListener('touchend', () => {
    if (dx < -60) {
      el.style.transform = 'translateX(-80px)';
      // Show delete button briefly then ask
      setTimeout(() => {
        if (confirm('Delete this quest?')) onDelete();
        else el.style.transform = '';
      }, 100);
    } else {
      el.style.transform = '';
    }
    dx = 0;
  });
}

function handleToggleQuest(id) {
  toggleQuest(id);
  SFX.check();
  renderQuestList();
  updateQuestBadge();
  // Sync to daily if it's a daily quest due today
  const q = S.quests.find(x => x.id === id);
  if (q?.due === todayISO() && currentSection === 'daily') renderDaily();
}

function handleToggleFreeze(id) {
  const q = S.quests.find(x => x.id === id);
  if (q) { q.frozen = !q.frozen; save(); renderQuestList(); SFX.tap(); }
}

function handleDeleteQuest(id) {
  deleteQuest(id);
  SFX.tap();
  renderQuests();
}

function setView(v) {
  activeView = v; activeProject = null;
  renderQuestSidebar(); renderQuestList();
}

function setProject(id) {
  activeProject = id; activeView = null;
  renderQuestSidebar(); renderQuestList();
}

function updateQuestBadge() {
  const count = questsForToday().length + overdueQuests().length;
  const badge = $('quest-badge');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? '' : 'none'; }
}

function openQuestDetail(id) {
  const q = S.quests.find(x => x.id === id);
  if (!q) return;
  const modal = $('modal-quest-detail');
  if (!modal) return;

  const PRIO_LABELS = ['','!!! Legendary','!! Epic','! Rare','Common'];
  const projectOpts = S.projects.map(p => `<option value="${p.id}" ${q.projectId===p.id?'selected':''}>${esc(p.name)}</option>`).join('');

  modal.querySelector('.modal-body').innerHTML = `
    <div class="qd-header">
      <div class="quest-check ${q.checked?'done':''}" onclick="handleToggleQuest('${q.id}');openQuestDetail('${q.id}')">${q.checked?'✓':''}</div>
      <input class="qd-title" value="${esc(q.content)}" placeholder="Quest title..." onchange="updateQuestField('${q.id}','content',this.value)" />
    </div>
    <textarea class="qd-desc" placeholder="Notes and description..." onchange="updateQuestField('${q.id}','description',this.value)">${esc(q.description||'')}</textarea>
    <div class="qd-meta-grid">
      <div class="qd-field">
        <label>Due</label>
        <input type="date" value="${q.due||''}" onchange="updateQuestField('${q.id}','due',this.value)" />
      </div>
      <div class="qd-field">
        <label>Priority</label>
        <select onchange="updateQuestField('${q.id}','priority',+this.value)">
          ${[1,2,3,4].map(p=>`<option value="${p}" ${q.priority===p?'selected':''}>${PRIO_LABELS[p]}</option>`).join('')}
        </select>
      </div>
      <div class="qd-field">
        <label>Board</label>
        <select onchange="updateQuestField('${q.id}','projectId',this.value)">${projectOpts}</select>
      </div>
      <div class="qd-field">
        <label>Labels</label>
        <input value="${(q.labels||[]).map(l=>'@'+l).join(' ')}" placeholder="@tag @tag" onchange="updateQuestField('${q.id}','labels',this.value.match(/@(\\w+)/g)?.map(t=>t.slice(1))||[])" />
      </div>
    </div>

    <div class="qd-section-label">SUB-QUESTS</div>
    <div id="qd-subs">${buildSubQuestList(q)}</div>
    <div class="qd-add-row">
      <input id="qd-sub-inp" placeholder="Add sub-quest..." onkeydown="if(event.key==='Enter'&&this.value.trim()){addSubQuest('${q.id}',this.value);this.value='';renderSubQuestList('${q.id}')}" />
    </div>

    <div class="qd-section-label">NOTES</div>
    <div id="qd-notes">${buildNotesList(q)}</div>
    <div class="qd-add-row">
      <input id="qd-note-inp" placeholder="Add note..." onkeydown="if(event.key==='Enter'&&this.value.trim()){addQuestNote('${q.id}',this.value.trim());this.value='';renderNotesList('${q.id}')}" />
    </div>

    <div style="margin-top:16px;display:flex;gap:8px;">
      <button class="btn-primary" onclick="closeModal('modal-quest-detail')">Done</button>
      <button class="btn-danger" onclick="handleDeleteQuest('${q.id}');closeModal('modal-quest-detail')">Delete</button>
    </div>`;

  openModal('modal-quest-detail');
}

function buildSubQuestList(q) {
  const subs = (q.childIds||[]).map(id => S.quests.find(x=>x.id===id)).filter(Boolean);
  if (!subs.length) return '<div class="qd-empty">No sub-quests</div>';
  return subs.map(s => `
    <div class="qd-sub-row">
      <div class="quest-check small ${s.checked?'done':''}" onclick="handleToggleQuest('${s.id}');renderSubQuestList('${q.id}')">${s.checked?'✓':''}</div>
      <span class="${s.checked?'line-through':''}">${esc(s.content)}</span>
      <button class="qd-del" onclick="deleteQuest('${s.id}');renderSubQuestList('${q.id}')">×</button>
    </div>`).join('');
}

function renderSubQuestList(parentId) {
  const q = S.quests.find(x=>x.id===parentId);
  if (q) { const c = $('qd-subs'); if (c) c.innerHTML = buildSubQuestList(q); }
}

function buildNotesList(q) {
  if (!q.notes?.length) return '<div class="qd-empty">No notes</div>';
  return q.notes.map(n => `
    <div class="qd-note">
      <div class="qd-note-text">${esc(n.content)}</div>
      <div class="qd-note-date">${fmtDate(n.date)}</div>
    </div>`).join('');
}

function renderNotesList(questId) {
  const q = S.quests.find(x=>x.id===questId);
  if (q) { const c = $('qd-notes'); if (c) c.innerHTML = buildNotesList(q); }
}

function addQuestNote(questId, content) {
  const q = S.quests.find(x=>x.id===questId);
  if (!q) return;
  if (!q.notes) q.notes = [];
  q.notes.push({ id: uid(), content, date: todayISO() });
  save();
}

function updateQuestField(id, field, value) {
  const q = S.quests.find(x=>x.id===id);
  if (!q) return;
  q[field] = value;
  save();
  renderQuestList();
}


// ================================================================
// 21. TRAINING RENDER — FitNotes-faithful rebuild
// ================================================================

// State for the active exercise being logged
let _activeExIdx = null;   // index into sess.exercises, or null
let _editSetId   = null;   // set.id being edited, or null (null = new set)
let _graphExName = null;   // exercise name shown in graph view

function renderTraining() {
  const sess    = getSession(currentTrainingDate);
  const isToday = currentTrainingDate === todayISO();
  setText('training-date', isToday ? 'TODAY' : fmtDate(currentTrainingDate).toUpperCase());
  const nextBtn = $('training-next-date'); if (nextBtn) nextBtn.style.visibility = isToday ? 'hidden' : 'visible';
  setText('session-timer-text', '00:00');

  _renderRoutineBar(sess);
  _renderExerciseDrawer(sess);
  _renderEntryPanel(sess);
  _renderSetList(sess);
  _renderSessionFooter(sess);
  updateCopySessionBtn();
}

// ── ROUTINE BAR (exercise list as pill-tabs across top) ─────────
function _renderRoutineBar(sess) {
  const bar = $('routine-bar');
  if (!bar) return;
  if (!sess.exercises.length) { bar.innerHTML = ''; return; }
  bar.innerHTML = sess.exercises.map((ex, i) => {
    const doneSets = ex.sets.filter(s => s.done).length;
    const active   = i === _activeExIdx;
    return `<button class="routine-pill${active ? ' active' : ''}" onclick="selectExercise(${i})">
      <span class="rp-name">${esc(ex.name)}</span>
      ${doneSets ? `<span class="rp-sets">${doneSets}</span>` : ''}
    </button>`;
  }).join('');
}

// ── EXERCISE DRAWER (left-side exercise list — visible when no active ex) ─
function _renderExerciseDrawer(sess) {
  const list = $('exercise-list');
  if (!list) return;
  if (_activeExIdx !== null) { list.style.display = 'none'; return; }
  list.style.display = '';
  if (!sess.exercises.length) {
    list.innerHTML = `<div class="training-empty">
      <div class="training-empty-icon">💪</div>
      <div>No exercises yet</div>
      <div class="training-empty-sub">Search or pick an exercise below to begin</div>
    </div>`;
    return;
  }
  list.innerHTML = sess.exercises.map((ex, i) => {
    const done  = ex.sets.filter(s => s.done).length;
    const total = ex.sets.length;
    const vol   = ex.sets.filter(s => s.done && s.weight && s.reps)
                         .reduce((sum, s) => sum + s.weight * s.reps, 0);
    return `<div class="ex-drawer-row" onclick="selectExercise(${i})">
      <div class="ex-drawer-left">
        <div class="ex-drawer-name">${esc(ex.name)}</div>
        <div class="ex-drawer-meta">${done}/${total} sets${vol ? ' · ' + Math.round(vol) + ' ' + S.settings.trainingWeightUnit : ''}</div>
      </div>
      <div class="ex-drawer-right">
        <button class="ex-drawer-del" onclick="event.stopPropagation();removeExercise(${i})">×</button>
      </div>
    </div>`;
  }).join('');
}

// ── ENTRY PANEL (weight/reps steppers + SAVE/CLEAR) ─────────────
function _renderEntryPanel(sess) {
  const panel = $('entry-panel');
  if (!panel) return;
  if (_activeExIdx === null || !sess.exercises[_activeExIdx]) {
    panel.style.display = 'none'; return;
  }
  panel.style.display = '';
  const ex      = sess.exercises[_activeExIdx];
  const isEdit  = _editSetId !== null;
  const editSet = isEdit ? ex.sets.find(s => s.id === _editSetId) : null;
  const isBW    = ex.type === EX_TYPE.BODYWEIGHT_REPS || ex.type === EX_TYPE.REPS_ONLY;
  const lastSess = getExerciseHistory(ex.name, currentTrainingDate)[0];
  const lastSet  = lastSess?.ex?.sets?.filter(s => s.done)?.[0];

  const wVal = editSet ? (editSet.weight ?? '') : (_draftWeight ?? lastSet?.weight ?? '');
  const rVal = editSet ? (editSet.reps   ?? '') : (_draftReps   ?? lastSet?.reps   ?? '');

  $('entry-ex-name').textContent = ex.name;
  $('entry-ex-back').style.display = '';

  // Weight field
  const wBlock = $('entry-weight-block');
  if (wBlock) wBlock.style.display = isBW ? 'none' : '';
  if (!isBW) setVal('entry-weight', wVal);

  // Reps field
  setVal('entry-reps', rVal);

  // Button label
  const saveBtn = $('entry-save-btn');
  if (saveBtn) saveBtn.textContent = isEdit ? 'UPDATE' : 'SAVE SET';
  const clearBtn = $('entry-clear-btn');
  if (clearBtn) clearBtn.textContent = isEdit ? 'DELETE' : 'CLEAR';

  // Hints: PB and last session
  const pb = getPersonalBest(ex.name);
  let hint = '';
  if (pb)      hint += `PB: ${pb.weight}${S.settings.trainingWeightUnit} × ${pb.reps} — e1RM ~${pb.oneRM}${S.settings.trainingWeightUnit}`;
  if (lastSess) {
    const ls = lastSess.ex.sets.filter(s => s.done && s.weight);
    if (ls.length) hint += (hint ? '   ·   ' : '') + `Last: ${fmtDateShort(lastSess.date)} — ${ls.map(s => `${s.weight}×${s.reps}`).join(', ')}`;
  }
  setText('entry-hint', hint);
}

// Draft values persist while adding multiple sets to same exercise
let _draftWeight = null;
let _draftReps   = null;

function _onEntryInput() {
  _draftWeight = parseFloat($('entry-weight')?.value) || null;
  _draftReps   = parseInt($('entry-reps')?.value)    || null;
}

// ── SAVE / CLEAR / UPDATE / DELETE ──────────────────────────────
function saveSet() {
  const sess = getSession(currentTrainingDate);
  if (_activeExIdx === null) return;
  const ex = sess.exercises[_activeExIdx];
  if (!ex) return;

  const isBW   = ex.type === EX_TYPE.BODYWEIGHT_REPS || ex.type === EX_TYPE.REPS_ONLY;
  const weight = isBW ? null : (parseFloat($('entry-weight')?.value) || null);
  const reps   = parseInt($('entry-reps')?.value) || null;
  if (!reps) { SFX.error(); return; }

  if (_editSetId !== null) {
    // UPDATE existing set
    const set = ex.sets.find(s => s.id === _editSetId);
    if (set) { set.weight = weight; set.reps = reps; set.done = true; }
    _editSetId = null;
  } else {
    // SAVE new set — reuse the last empty slot or push
    const empty = ex.sets.find(s => !s.done && !s.reps);
    if (empty) { empty.weight = weight; empty.reps = reps; empty.done = true; }
    else ex.sets.push(freshSet({ weight, reps, done: true }));
    _draftWeight = weight;
    _draftReps   = reps;
  }

  markPRs(ex.name, currentTrainingDate);

  // Update trained flag
  const day = getDay(currentTrainingDate);
  day.trained = isTrainedToday(currentTrainingDate);
  if (currentSection === 'daily') updateDailyChecks(day);

  if (!_sessionTimer) startSessionTimer();
  save();
  SFX.check();
  _renderSetList(sess);
  _renderRoutineBar(sess);
  _renderSessionFooter(sess);
  _renderEntryPanel(sess); // refresh hint + clear edit state
  spawnParticles('💪', 2);
}

function clearEntry() {
  if (_editSetId !== null) {
    // DELETE mode
    const sess = getSession(currentTrainingDate);
    const ex   = sess.exercises[_activeExIdx];
    if (ex) ex.sets = ex.sets.filter(s => s.id !== _editSetId);
    _editSetId = null;
    save();
    _renderSetList(sess);
    _renderRoutineBar(sess);
    _renderSessionFooter(sess);
  } else {
    // CLEAR draft
    _draftWeight = null;
    _draftReps   = null;
    if ($('entry-weight')) $('entry-weight').value = '';
    if ($('entry-reps'))   $('entry-reps').value   = '';
  }
  _renderEntryPanel(getSession(currentTrainingDate));
}

// Adjust weight/reps with stepper buttons
function stepField(field, delta) {
  const inp  = $(field);
  if (!inp) return;
  const step = field === 'entry-weight' ? (S.settings.trainingWeightUnit === 'lbs' ? 5 : 2.5) : 1;
  const cur  = parseFloat(inp.value) || 0;
  inp.value  = Math.max(0, Math.round((cur + delta * step) * 100) / 100);
  _onEntryInput();
}

// ── SET LOG LIST ─────────────────────────────────────────────────
function _renderSetList(sess) {
  const listEl = $('set-log-list');
  if (!listEl) return;

  if (_activeExIdx === null || !sess.exercises[_activeExIdx]) {
    listEl.innerHTML = ''; return;
  }

  const ex       = sess.exercises[_activeExIdx];
  const isBW     = ex.type === EX_TYPE.BODYWEIGHT_REPS || ex.type === EX_TYPE.REPS_ONLY;
  const lastSess = getExerciseHistory(ex.name, currentTrainingDate)[0];
  const unit     = S.settings.trainingWeightUnit;

  // Column header
  let header = `<div class="set-log-header">
    <span class="slh-num">#</span>
    ${!isBW ? `<span class="slh-weight">${unit.toUpperCase()}</span>` : ''}
    <span class="slh-reps">REPS</span>
    <span class="slh-prev">PREV</span>
    <span class="slh-done">✓</span>
  </div>`;

  const rows = ex.sets.map((set, si) => {
    const prev     = lastSess?.ex?.sets?.[si];
    const isEditing = set.id === _editSetId;
    const prevTxt  = prev?.weight && prev?.reps ? `${prev.weight}×${prev.reps}` : prev?.reps ? `×${prev.reps}` : '—';
    return `<div class="set-log-row${set.done ? ' done' : ''}${isEditing ? ' editing' : ''}" 
               onclick="editSet('${set.id}')">
      <span class="slr-num">${set.isPR ? '★' : si + 1}</span>
      ${!isBW ? `<span class="slr-weight">${set.weight ?? '—'}</span>` : ''}
      <span class="slr-reps">${set.reps ?? '—'}</span>
      <span class="slr-prev">${esc(prevTxt)}</span>
      <span class="slr-done">${set.done ? '✓' : '○'}</span>
    </div>`;
  }).join('');

  // History from last session (ghost reference below rows)
  let histBlock = '';
  if (lastSess) {
    const donePrev = lastSess.ex.sets.filter(s => s.done && (s.weight || s.reps));
    if (donePrev.length) {
      histBlock = `<div class="set-log-history">
        <span class="slh-label">LAST SESSION (${fmtDateShort(lastSess.date)})</span>
        ${donePrev.map(s => `<span class="slh-set">${s.weight ? s.weight + '×' : ''}${s.reps}</span>`).join('')}
      </div>`;
    }
  }

  listEl.innerHTML = header + rows + histBlock;
}

function editSet(setId) {
  const sess = getSession(currentTrainingDate);
  const ex   = sess.exercises[_activeExIdx];
  if (!ex) return;
  const set  = ex.sets.find(s => s.id === setId);
  if (!set || !set.done) return; // tap undone set → do nothing
  _editSetId = setId;
  _renderEntryPanel(sess);
  _renderSetList(sess);
  // Populate fields
  if ($('entry-weight')) $('entry-weight').value = set.weight ?? '';
  if ($('entry-reps'))   $('entry-reps').value   = set.reps   ?? '';
}

// ── SESSION FOOTER (volume + graph button) ───────────────────────
function _renderSessionFooter(sess) {
  const footer = $('session-footer');
  if (!footer) return;
  const { vol, sets } = getSessionVolume(sess);
  if (!sets) { footer.style.display = 'none'; return; }
  footer.style.display = '';
  footer.innerHTML = `
    <div class="sf-vol">
      <span class="sf-val">${vol.toLocaleString()}</span>
      <span class="sf-unit">${S.settings.trainingWeightUnit} total volume</span>
    </div>
    <span class="sf-sets">${sets} set${sets !== 1 ? 's' : ''} logged</span>
  `;
}

// ── EXERCISE SELECTION ────────────────────────────────────────────
function selectExercise(idx) {
  _activeExIdx = idx;
  _editSetId   = null;
  _draftWeight = null;
  _draftReps   = null;
  const sess = getSession(currentTrainingDate);
  const ex   = sess.exercises[idx];
  if (ex) {
    // Pre-fill draft from last session
    const last = getExerciseHistory(ex.name, currentTrainingDate)[0];
    if (last) {
      const lastDone = last.ex.sets.filter(s => s.done && s.weight);
      if (lastDone.length) {
        _draftWeight = lastDone[lastDone.length - 1].weight;
        _draftReps   = lastDone[lastDone.length - 1].reps;
      }
    }
  }
  renderTraining();
}

function backToExerciseList() {
  _activeExIdx = null;
  _editSetId   = null;
  _draftWeight = null;
  _draftReps   = null;
  renderTraining();
}

function addExerciseToSession(name) {
  const sess = getSession(currentTrainingDate);
  if (sess.exercises.find(e => e.name === name && !e.oneOff)) {
    // Already exists — just select it
    const idx = sess.exercises.findIndex(e => e.name === name);
    selectExercise(idx);
    const searchEl = $('exercise-search');
    if (searchEl) { searchEl.value = ''; $('ex-search-results')?.classList.remove('open'); }
    return;
  }
  sess.exercises.push(freshExerciseEntry(name));
  const day = getDay(currentTrainingDate);
  day.trained = true;
  save();
  SFX.save();
  if (!_sessionTimer) startSessionTimer();
  const searchEl = $('exercise-search');
  if (searchEl) { searchEl.value = ''; $('ex-search-results')?.classList.remove('open'); }
  selectExercise(sess.exercises.length - 1);
}

function addOneOffExercise(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const sess = getSession(currentTrainingDate);
  sess.exercises.push(freshExerciseEntry(trimmed, { oneOff: true }));
  const day = getDay(currentTrainingDate);
  day.trained = true;
  save();
  SFX.save();
  if (!_sessionTimer) startSessionTimer();
  const searchEl = $('exercise-search');
  if (searchEl) { searchEl.value = ''; $('ex-search-results')?.classList.remove('open'); }
  selectExercise(sess.exercises.length - 1);
}

function removeExercise(exIdx) {
  if (_activeExIdx === exIdx) { _activeExIdx = null; _editSetId = null; }
  else if (_activeExIdx > exIdx) _activeExIdx--;
  const sess = getSession(currentTrainingDate);
  sess.exercises.splice(exIdx, 1);
  save();
  renderTraining();
}

// ── PROGRESS GRAPH ────────────────────────────────────────────────
let _graphMode = 'maxWeight'; // 'maxWeight' | 'volume' | 'e1RM'

function openExerciseGraph(name) {
  _graphExName = name;
  renderExerciseGraph();
  openModal('modal-exercise-graph');
}

function renderExerciseGraph() {
  const canvas = $('graph-canvas');
  if (!canvas || !_graphExName) return;
  const data = getExerciseProgressData(_graphExName);
  setText('graph-ex-name', _graphExName);

  // Mode tabs
  document.querySelectorAll('.graph-mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === _graphMode);
  });

  if (data.length < 2) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setText('graph-empty', 'Not enough data yet');
    $('graph-empty').style.display = '';
    return;
  }
  if ($('graph-empty')) $('graph-empty').style.display = 'none';

  const vals = data.map(d => _graphMode === 'volume' ? d.totalVolume : _graphMode === 'e1RM' ? d.e1RM : d.maxWeight);
  _drawLineGraph(canvas, data.map(d => d.date), vals);

  // PR grid below graph
  _renderPRGrid(_graphExName);
}

function _drawLineGraph(canvas, labels, vals) {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.offsetWidth  || 320;
  const H   = canvas.offsetHeight || 180;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const gW  = W - pad.left - pad.right;
  const gH  = H - pad.top  - pad.bottom;

  const minV = Math.min(...vals) * 0.95;
  const maxV = Math.max(...vals) * 1.05;
  const range = maxV - minV || 1;

  const xStep = gW / (vals.length - 1 || 1);
  const yScale = v => pad.top + gH - ((v - minV) / range) * gH;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (gH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + gW, y); ctx.stroke();
    const label = Math.round(maxV - (range / 4) * i);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(label, pad.left - 4, y + 3);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gH);
  const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00d4aa';
  grad.addColorStop(0, accentRgb.replace(')', ', 0.3)').replace('rgb', 'rgba'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = yScale(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + (vals.length - 1) * xStep, pad.top + gH);
  ctx.lineTo(pad.left, pad.top + gH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = accentRgb;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  vals.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = yScale(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots + gold for PRs
  let runMax = -Infinity;
  vals.forEach((v, i) => {
    const x   = pad.left + i * xStep;
    const y   = yScale(v);
    const isPR = v > runMax;
    if (isPR) runMax = v;
    ctx.beginPath();
    ctx.arc(x, y, isPR ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = isPR ? 'var(--gold-bright, #f0c040)' : accentRgb;
    ctx.fill();
  });

  // X axis labels (first and last)
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(fmtDateShort(labels[0]), pad.left, H - 6);
  ctx.textAlign = 'right';
  ctx.fillText(fmtDateShort(labels[labels.length - 1]), pad.left + gW, H - 6);
}

function _renderPRGrid(name) {
  const grid = getPRGrid(name);
  const container = $('pr-grid');
  if (!container) return;
  const reps = Object.keys(grid).map(Number).sort((a, b) => a - b);
  if (!reps.length) { container.innerHTML = '<div class="pr-empty">No personal records yet</div>'; return; }
  container.innerHTML = `
    <div class="pr-grid-label">PERSONAL RECORDS</div>
    <div class="pr-grid-rows">
      ${reps.map(r => `
        <div class="pr-grid-row">
          <span class="pr-reps">${r} rep${r !== 1 ? 's' : ''}</span>
          <span class="pr-weight">${grid[r].weight} ${S.settings.trainingWeightUnit}</span>
          <span class="pr-date">${fmtDateShort(grid[r].date)}</span>
        </div>`).join('')}
    </div>`;
}

function setGraphMode(mode) {
  _graphMode = mode;
  renderExerciseGraph();
}

// ── EXERCISE PICKER ────────────────────────────────────────────────
let activeSplitFilter = null;

function initExercisePicker() {
  const chips = $('muscle-chips');
  if (!chips) return;
  const allChip = document.createElement('button');
  allChip.className = 'muscle-chip active';
  allChip.textContent = 'ALL';
  allChip.onclick = () => { activeSplitFilter = null; setActiveChip(allChip); renderExercisePickerForGroup('ALL'); };
  chips.appendChild(allChip);
  Object.keys(EXERCISES).forEach(group => {
    const chip = document.createElement('button');
    chip.className = 'muscle-chip';
    chip.textContent = group.length > 10 ? group.slice(0, 10) : group;
    chip.title = group;
    chip.onclick = () => { activeSplitFilter = group; setActiveChip(chip); renderExercisePickerForGroup(group); };
    chips.appendChild(chip);
  });
}

function setActiveChip(active) {
  document.querySelectorAll('.muscle-chip').forEach(c => c.classList.remove('active'));
  active.classList.add('active');
}

function renderExercisePickerForGroup(group) {
  const list = $('exercise-picker-list');
  if (!list) return;
  const searchVal = $('exercise-search')?.value?.toLowerCase() || '';

  const historyNames = [];
  const historySet   = new Set();
  Object.entries(S.training).sort((a, b) => b[0] < a[0] ? -1 : 1).forEach(([, sess]) => {
    sess.exercises.forEach(ex => {
      if (ex.oneOff) return;
      if (!historySet.has(ex.name)) { historySet.add(ex.name); historyNames.push(ex.name); }
    });
  });

  let pool;
  if (searchVal.length >= 1) {
    pool = allExercises().filter(e => e.toLowerCase().includes(searchVal));
    pool.sort((a, b) => {
      const aH = historySet.has(a), bH = historySet.has(b);
      if (aH && !bH) return -1; if (!aH && bH) return 1; return 0;
    });
  } else if (group && group !== 'ALL') {
    pool = EXERCISES[group] || [];
  } else {
    pool = historyNames.slice(0, 20);
  }

  if (!pool.length && searchVal.length >= 1) {
    list.innerHTML = '<div class="picker-empty">No results for "' + esc(searchVal) + '"</div>' +
      '<div class="picker-row picker-onetime" onclick="addOneOffExercise(\'' + searchVal.replace(/'/g, "\\'") + '\')">' +
      '<span class="picker-name">+ Add <strong>' + esc(searchVal) + '</strong> as one-off</span>' +
      '<span class="picker-onetime-badge">ONE-OFF</span></div>';
    return;
  }

  list.innerHTML = pool.map(name => {
    const isHistory = historySet.has(name);
    return '<div class="picker-row' + (isHistory ? ' picker-history' : '') + '" onclick="addExerciseToSession(\'' + name.replace(/'/g, "\\'") + '\')">' +
      '<span class="picker-name">' + esc(name) + '</span>' +
      (isHistory ? '<span class="picker-hist-badge">Recent</span>' : '') + '</div>';
  }).join('');

  if (searchVal.length >= 1 && !pool.some(n => n.toLowerCase() === searchVal.toLowerCase())) {
    list.innerHTML += '<div class="picker-row picker-onetime" onclick="addOneOffExercise(\'' + searchVal.replace(/'/g, "\\'") + '\')">' +
      '<span class="picker-name">+ Add <strong>' + esc(searchVal) + '</strong> as one-off</span>' +
      '<span class="picker-onetime-badge">ONE-OFF</span></div>';
  }
}

function handleExerciseSearch(val) {
  const results = $('ex-search-results');
  if (!results) return;
  results.classList.add('open');
  renderExercisePickerForGroup(activeSplitFilter || 'ALL');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.ex-search-wrap')) {
    $('ex-search-results')?.classList.remove('open');
  }
});

// ── COPY LAST SESSION ─────────────────────────────────────────────
function updateCopySessionBtn() {
  const btn = $('copy-session-btn');
  if (!btn) return;
  const pastDates = Object.keys(S.training).filter(d => d < currentTrainingDate).sort().reverse();
  btn.style.display = pastDates.length ? '' : 'none';
  btn.dataset.lastDate = pastDates[0] || '';
}

function copyLastSession() {
  const btn      = $('copy-session-btn');
  const lastDate = btn?.dataset.lastDate;
  if (!lastDate || !S.training[lastDate]) return;
  const src  = S.training[lastDate];
  const sess = getSession(currentTrainingDate);
  sess.exercises = src.exercises.map(ex => ({
    ...freshExerciseEntry(ex.name, { type: ex.type, notes: ex.notes || '' }),
    sets: ex.sets.map(() => freshSet()),
  }));
  const day = getDay(currentTrainingDate);
  day.trained = true;
  save();
  _activeExIdx = null;
  renderTraining();
  SFX.save();
}

function renderSessionVolume() { /* kept for compat — footer handles this now */ }


// ================================================================
// 22. NUTRITION RENDER
// ================================================================
function renderNutrition() {
  const day = getDay(currentNutritionDate);
  const tot = calcNutritionTotals(day);
  const s = S.settings;

  // Totals
  setText('nut-cals-total', tot.cals.toLocaleString());
  setText('nut-protein-total', tot.protein + 'g');
  setText('nut-carbs-total', tot.carbs + 'g');
  setText('nut-fat-total', tot.fat + 'g');

  // Goal progress bars
  setBarWidth('nut-cal-bar', Math.min(100, (tot.cals / (s.caloriesGoal||2400)) * 100));
  setBarWidth('nut-prot-bar', Math.min(100, (tot.protein / (s.proteinGoal||175)) * 100));

  // TDEE
  const tdee = calcTDEE();
  setText('nut-tdee', tdee ? tdee + ' kcal estimated TDEE' : '');

  // Meals
  ['breakfast','lunch','dinner','snacks'].forEach(meal => renderMealSection(meal, day));

  // Supplements
  renderSupplementSection(day);
}

function renderMealSection(meal, day) {
  const items = day.meals[meal] || [];
  const mealCals = items.reduce((s,i) => s + i.cals, 0);

  const itemContainer = $(`meal-items-${meal}`);
  if (itemContainer) itemContainer.innerHTML = items.map((item, i) => buildFoodItemRow(item, meal, i)).join('');

  const calEl = $(`meal-cal-${meal}`);
  if (calEl) calEl.textContent = mealCals > 0 ? mealCals + ' kcal' : '';
}

function buildFoodItemRow(item, meal, idx) {
  return `<div class="food-item-row">
    <span class="food-item-name">${esc(item.name)}</span>
    <span class="food-item-cals">${item.cals} kcal</span>
    <span class="food-item-macros">P:${item.protein} C:${item.carbs} F:${item.fat}</span>
    <button class="food-item-del" onclick="removeFoodItem('${currentNutritionDate}','${meal}','${item.id}');renderNutrition()">×</button>
  </div>`;
}

function renderSupplementSection(day) {
  const container = $('supplement-list');
  if (!container) return;
  const supps = S.settings.supplements || [];
  container.innerHTML = supps.map(supp => {
    const val = day.supplements?.[supp.id] || 0;
    return `<div class="supp-row">
      <span class="supp-name">${esc(supp.name)}</span>
      <div class="supp-ctrl">
        <button class="supp-btn" onclick="adjustSupp('${supp.id}',${currentNutritionDate},-${supp.step})">−</button>
        <span class="supp-val">${val}</span>
        <button class="supp-btn" onclick="adjustSupp('${supp.id}','${currentNutritionDate}',${supp.step})">+</button>
        <span class="supp-unit">${supp.unit}</span>
      </div>
    </div>`;
  }).join('') || '<div class="empty-hint">Add supplements in Settings.</div>';
}

function adjustSupp(suppId, date, step) {
  const day = getDay(date);
  if (!day.supplements) day.supplements = {};
  day.supplements[suppId] = Math.max(0, (day.supplements[suppId] || 0) + Number(step));
  save();
  renderSupplementSection(day);
}

// Food logging flow
let _pendingMeal = 'breakfast';
let _pendingFood = null;

function openAddFood(meal) {
  _pendingMeal = meal;
  _pendingFood = null;
  $('food-search-inp') && ($('food-search-inp').value = '');
  $('food-search-results') && ($('food-search-results').innerHTML = '');
  clearFoodForm();
  openModal('modal-add-food');
}

function clearFoodForm() {
  ['food-name','food-cals','food-protein','food-carbs','food-fat','food-sodium','food-potassium','food-zinc','food-magnesium'].forEach(id => {
    const e = $(id); if (e) e.value = '';
  });
}

function runFoodSearch(query) {
  const res = searchFoodDB(query);
  const container = $('food-search-results');
  if (!container) return;
  if (!res.length && query.length > 1) {
    container.innerHTML = '<div class="search-empty">No results. Enter manually below.</div>';
    return;
  }
  container.innerHTML = res.map(f => `
    <div class="search-result" onclick="selectFood(${JSON.stringify(JSON.stringify(f)).slice(1,-1)})">
      <span class="sr-name">${esc(f.name)}</span>
      <span class="sr-macros">${f.cals}kcal P:${f.protein}g C:${f.carbs}g F:${f.fat}g</span>
    </div>`).join('');
}

function selectFood(foodJson) {
  let food;
  try { food = JSON.parse(foodJson); } catch(e) { return; }
  _pendingFood = food;
  setVal('food-name', food.name);
  setVal('food-cals', food.cals);
  setVal('food-protein', food.protein);
  setVal('food-carbs', food.carbs);
  setVal('food-fat', food.fat);
  if (S.settings.electrolyteMode) {
    setVal('food-sodium', food.sodium || 0);
    setVal('food-potassium', food.potassium || 0);
    setVal('food-zinc', food.zinc || 0);
    setVal('food-magnesium', food.magnesium || 0);
  }
}

function autoCalcCals() {
  const p = parseFloat($('food-protein')?.value) || 0;
  const c = parseFloat($('food-carbs')?.value) || 0;
  const f = parseFloat($('food-fat')?.value) || 0;
  const calField = $('food-cals');
  if (calField && !calField.value) {
    calField.value = Math.round(p * 4 + c * 4 + f * 9);
  }
}

function confirmAddFood() {
  const name = $('food-name')?.value.trim();
  if (!name) { SFX.error(); return; }
  let cals = parseFloat($('food-cals')?.value) || 0;
  const protein = parseFloat($('food-protein')?.value) || 0;
  const carbs = parseFloat($('food-carbs')?.value) || 0;
  const fat = parseFloat($('food-fat')?.value) || 0;
  if (!cals && (protein || carbs || fat)) cals = Math.round(protein*4 + carbs*4 + fat*9);

  const food = {
    id: uid(), name, cals, protein, carbs, fat,
    sodium:    parseFloat($('food-sodium')?.value)    || 0,
    potassium: parseFloat($('food-potassium')?.value) || 0,
    zinc:      parseFloat($('food-zinc')?.value)      || 0,
    magnesium: parseFloat($('food-magnesium')?.value) || 0,
  };

  logFoodItem(currentNutritionDate, _pendingMeal, food, 1);

  // Auto-add to DB
  if (!S.foodDB.find(f => f.name.toLowerCase() === name.toLowerCase())) {
    addToFoodDB(food);
  }

  closeModal('modal-add-food');
  renderNutrition();
  SFX.save();
}

function saveToPersonalDB() {
  const name = $('food-name')?.value.trim();
  if (!name) return;
  const food = {
    id: uid(), name,
    cals:    parseFloat($('food-cals')?.value)    || 0,
    protein: parseFloat($('food-protein')?.value) || 0,
    carbs:   parseFloat($('food-carbs')?.value)   || 0,
    fat:     parseFloat($('food-fat')?.value)     || 0,
  };
  addToFoodDB(food);
  SFX.save();
  const btn = $('save-to-db-btn');
  if (btn) { btn.textContent = 'Saved!'; setTimeout(() => btn.textContent = 'Save to DB', 1500); }
}


// ================================================================
// CAFFEINE HALF-LIFE TRACKER
// ================================================================
// Standard half-life: 5 hours. Slow metabolizer: 7 hours.
// Logs stored as: { id, time (ISO datetime), amount (mg) }

function getCaffeineHalfLife() {
  return S.settings.caffeineHalfLifeMode ? 7 : 5; // hours
}

function calcCaffeineInSystem(nowMs) {
  const day = todayDay();
  const logs = day.caffeineLogs || [];
  const halfLifeMs = getCaffeineHalfLife() * 3600000;
  let total = 0;
  logs.forEach(log => {
    const elapsed = nowMs - new Date(log.time).getTime();
    if (elapsed >= 0) {
      total += log.amount * Math.pow(0.5, elapsed / halfLifeMs);
    }
  });
  return Math.round(total);
}

function calcCaffeineClearTime() {
  const day = todayDay();
  const logs = day.caffeineLogs || [];
  if (!logs.length) return null;
  const halfLifeMs = getCaffeineHalfLife() * 3600000;
  const threshold = 25; // mg — effectively "clear"
  const now = Date.now();
  // Total caffeine now
  let total = calcCaffeineInSystem(now);
  if (total < threshold) return null;
  // Solve: total * 0.5^(t/halfLife) = 25
  // t = halfLife * log2(total/25)
  const hoursUntilClear = getCaffeineHalfLife() * Math.log2(total / threshold);
  const clearTime = new Date(now + hoursUntilClear * 3600000);
  return clearTime;
}

function addCaffeineLog(time, amount) {
  const day = todayDay();
  if (!day.caffeineLogs) day.caffeineLogs = [];
  day.caffeineLogs.push({ id: uid(), time, amount });
  day.caffeineLogs.sort((a,b) => a.time < b.time ? -1 : 1);
  save();
  renderCaffeineTracker();
}

function removeCaffeineLog(id) {
  const day = todayDay();
  day.caffeineLogs = (day.caffeineLogs || []).filter(l => l.id !== id);
  save();
  renderCaffeineTracker();
}

function renderCaffeineTracker() {
  const container = $('caffeine-tracker');
  if (!container) return;
  if (!S.settings.caffeineEnabled) { container.style.display = 'none'; return; }
  container.style.display = '';

  const day = todayDay();
  const logs = day.caffeineLogs || [];
  const inSystem = calcCaffeineInSystem(Date.now());
  const clearTime = calcCaffeineClearTime();
  const halfLife = getCaffeineHalfLife();

  // Bar: max ~600mg for scale
  const pct = Math.min(100, (inSystem / 600) * 100);
  const barColor = inSystem > 400 ? '#ef4444' : inSystem > 200 ? '#f0b323' : '#22c55e';

  let clearStr = '';
  if (clearTime) {
    const h = clearTime.getHours();
    const m = pad(clearTime.getMinutes());
    const ampm = h >= 12 ? 'PM' : 'AM';
    clearStr = `Clears ~${h % 12 || 12}:${m} ${ampm}`;
  } else {
    clearStr = 'System clear ✓';
  }

  container.innerHTML = `
    <div class="caff-header">
      <div class="caff-title">CAFFEINE</div>
      <div class="caff-meta">${halfLife}hr half-life · ${clearStr}</div>
    </div>
    <div class="caff-bar-track">
      <div class="caff-bar-fill" style="width:${pct}%;background:${barColor}"></div>
    </div>
    <div class="caff-amount">${inSystem}<span class="caff-unit">mg in system</span></div>
    <div class="caff-logs">
      ${logs.map(l => {
        const t = new Date(l.time);
        const timeStr = t.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit',hour12:true});
        return `<div class="caff-log-row">
          <span class="caff-log-time">${timeStr}</span>
          <span class="caff-log-amt">${l.amount}mg</span>
          <button class="caff-log-del" onclick="removeCaffeineLog('${l.id}')">×</button>
        </div>`;
      }).join('')}
    </div>
    <div class="caff-add-row">
      <input id="caff-time-inp" type="time" class="caff-inp" value="${new Date().toTimeString().slice(0,5)}"/>
      <input id="caff-amt-inp" type="number" class="caff-inp" placeholder="mg" min="0" max="1000" style="width:70px"/>
      <button class="caff-add-btn" onclick="logCaffeineFromInputs()">Log</button>
    </div>`;
}

function logCaffeineFromInputs() {
  const timeVal = $('caff-time-inp')?.value;
  const amtVal  = parseFloat($('caff-amt-inp')?.value);
  if (!timeVal || !amtVal || amtVal <= 0) return;
  const today = todayISO();
  const time = `${today}T${timeVal}:00`;
  addCaffeineLog(time, amtVal);
  const inp = $('caff-amt-inp');
  if (inp) inp.value = '';
  SFX.save();
}

// Update caffeine display every minute when journal is visible
let _caffeineInterval = null;
function startCaffeineUpdates() {
  stopCaffeineUpdates();
  renderCaffeineTracker();
  _caffeineInterval = setInterval(() => {
    if (currentSection === 'journal') renderCaffeineTracker();
  }, 60000);
}
function stopCaffeineUpdates() {
  if (_caffeineInterval) { clearInterval(_caffeineInterval); _caffeineInterval = null; }
}

// ================================================================
// 23. JOURNAL RENDER
// ================================================================
function renderJournal() {
  const day = getDay(todayISO());
  startCaffeineUpdates();
  // Energy
  renderEnergyPicker(day);
  // Prompts
  setVal('journal-how-was-today', day.journalPrompts?.howWasToday || '');
  setVal('journal-what-happened', day.journalPrompts?.whatHappened || '');
  setVal('journal-how-feeling', day.journalPrompts?.howAreYouFeeling || '');
  setVal('journal-free', day.journalFree || '');
  // Time blocks
  renderTimeTracker();
  // Auto summary
  renderDaySummary(day);
  // Quest log for today
  renderJournalQuestLog();
  // Charts
  requestAnimationFrame(() => {
    renderWeightChart();
    renderCorrelationChart();
  });
}

function renderEnergyPicker(day) {
  const container = $('energy-picker');
  if (!container) return;
  const FACES = ['😫','😔','😐','🙂','⚡'];
  container.innerHTML = FACES.map((f, i) => `
    <button class="energy-btn ${day.energyLevel === i+1 ? 'selected' : ''}" onclick="setEnergy(${i+1})">
      ${f}
    </button>`).join('');
}

function setEnergy(level) {
  const day = todayDay();
  day.energyLevel = level;
  save();
  renderEnergyPicker(day);
  SFX.tap();
}

function renderTimeTracker() {
  const container = $('time-blocks-list');
  if (!container) return;
  const day = todayDay();
  const blocks = day.timeBlocks || [];

  const runningHTML = _timeBlock ? `<div class="time-block running" id="time-tracker-running">${_timeBlock.label} 00:00</div>` : '';
  const blocksHTML = blocks.slice(-10).reverse().map(b => {
    const dur = b.duration;
    const m = Math.floor(dur/60), s = dur%60;
    return `<div class="time-block">
      <span class="tb-label">${esc(b.label)}</span>
      <span class="tb-dur">${pad(m)}:${pad(s)}</span>
    </div>`;
  }).join('');
  container.innerHTML = runningHTML + blocksHTML || '<div class="empty-hint">No time blocks yet.</div>';
}

function renderDaySummary(day) {
  const el = $('day-summary');
  if (!el) return;
  const rank = autoRank(day);
  const parts = [];
  if (day.sleep) parts.push(day.sleep + 'h sleep');
  if (day.cals)  parts.push(day.cals.toLocaleString() + ' kcal');
  if (day.trained) parts.push('Trained');
  parts.push(rank + ' rank');
  el.textContent = parts.join(' · ');
}

function renderJournalQuestLog() {
  const container = $('journal-quest-log');
  if (!container) return;
  const today = todayISO();
  const planned = S.quests.filter(q => q.due === today || q.createdAt === today);
  container.innerHTML = planned.length ? planned.map(q => `
    <div class="jql-row">
      <span class="jql-dot ${q.checked?'done':''}">${q.checked?'✓':''}</span>
      <span class="jql-content ${q.checked?'line-through':''}">${esc(q.content)}</span>
      <span class="jql-time">${q.createdAt === today ? 'Created today' : 'Due today'}</span>
    </div>`).join('')
    : '<div class="empty-hint">No quests planned for today.</div>';
}

function renderWeightChart() {
  const datasets = weightChartDatasets();
  const pts = datasets[0].points;
  if (!pts.length) return;
  // Convert date strings to index numbers for the chart
  const numPts = pts.map((p,i) => ({ x: p.x, y: p.y }));
  const goal = S.settings.weightGoal;
  const trend = calcWeightTrend();
  const proj = goal && trend ? { x: addDays(todayISO(), Math.round((goal - (pts[pts.length-1]?.y||0)) / (trend||0.01))), y: goal } : null;

  drawChart('weight-chart', [{ points: numPts, color: '#f0b323' }], {
    goalLine: goal || undefined,
    movingAvg: true,
    projectionTo: proj || undefined,
  });
}

function renderCorrelationChart() {
  // Weight vs Calories (last 30 days)
  const days = Object.values(S.days).sort((a,b) => a.date < b.date ? -1 : 1).slice(-30);
  const calPts = days.filter(d => d.cals && d.weight).map(d => ({ x: d.date, y: d.cals }));
  const wtPts  = days.filter(d => d.weight).map(d => ({ x: d.date, y: d.weight }));
  if (calPts.length < 3) return;
  // Normalize both to 0-100 for overlay
  const maxCal = Math.max(...calPts.map(p=>p.y));
  const maxWt  = Math.max(...wtPts.map(p=>p.y));
  const normCal = calPts.map(p => ({ x: p.x, y: p.y / maxCal * 100 }));
  const normWt  = wtPts.map(p => ({ x: p.x, y: p.y / maxWt * 100 }));
  drawChart('corr-chart', [
    { points: normWt,  color: '#f0b323', label: 'Weight' },
    { points: normCal, color: '#3b82f6', label: 'Calories' },
  ]);
}

// ================================================================
// 24. PM DEBRIEF
// ================================================================
function openPMDebrief() {
  const day = getDay(currentDate);
  const modal = $('modal-pm-debrief');
  if (!modal) return;

  const FACES = ['😫','😔','😐','🙂','⚡'];
  const energy = day.energyLevel;
  const rank = autoRank(day);
  const obj = S.settings.mainObjective;

  modal.querySelector('.modal-body').innerHTML = `
    <div class="debrief-header">
      <div class="debrief-rank" style="color:${rankColor(rank)}">${rank}</div>
      <div class="debrief-date">${fmtDate(currentDate).toUpperCase()}</div>
    </div>

    <div class="debrief-section">
      <div class="debrief-label">How was the day?</div>
      <div class="energy-row">
        ${FACES.map((f,i) => `<button class="energy-btn ${day.energyLevel===i+1?'selected':''}" onclick="setEnergy(${i+1});this.parentElement.querySelectorAll('.energy-btn').forEach((b,j)=>b.classList.toggle('selected',j===${i}))">${f}</button>`).join('')}
      </div>
    </div>

    ${!day.journalFree ? `
    <div class="debrief-section">
      <div class="debrief-label">How was today? <span style="color:var(--text-muted);font-size:11px;">(prompted)</span></div>
      <textarea class="debrief-textarea" placeholder="Give it a rating, a vibe..." onchange="savePrompt('howWasToday',this.value)">${day.journalPrompts?.howWasToday||''}</textarea>
      <textarea class="debrief-textarea" placeholder="What happened?" onchange="savePrompt('whatHappened',this.value)">${day.journalPrompts?.whatHappened||''}</textarea>
      <textarea class="debrief-textarea" placeholder="How are you feeling about it?" onchange="savePrompt('howAreYouFeeling',this.value)">${day.journalPrompts?.howAreYouFeeling||''}</textarea>
    </div>` : ''}

    ${obj ? `<div class="debrief-objective">Did today move you toward: <strong>${esc(obj)}</strong>?</div>` : ''}

    <div class="rank-selector">
      ${['S','A','B','C','D','E','F'].map(r => `
        <button class="rank-btn ${day.rank===r?'selected':''}" style="color:${rankColor(r)};border-color:${rankColor(r)}"
          onclick="setDayRank('${r}',this)">
          ${r}
        </button>`).join('')}
    </div>
    <div class="rank-hint">Override rank — leave empty for auto</div>

    <button class="btn-primary" style="width:100%;margin-top:16px;" onclick="savePMDebrief()">Save Debrief</button>`;

  openModal('modal-pm-debrief');
}

function savePrompt(key, val) {
  const day = getDay(currentDate);
  if (!day.journalPrompts) day.journalPrompts = {};
  day.journalPrompts[key] = val;
  save();
}

function setDayRank(rank, btn) {
  const day = getDay(currentDate);
  day.rank = (day.rank === rank) ? null : rank; // toggle
  btn.closest('.rank-selector').querySelectorAll('.rank-btn').forEach((b,i) => {
    b.classList.toggle('selected', b.textContent.trim() === day.rank);
  });
  save();
}

function savePMDebrief() {
  const day = getDay(currentDate);
  day.pmDebriefDone = true;
  day.trackingOn = true;
  save();
  closeModal('modal-pm-debrief');
  SFX.save();
  if (autoRank(day) === 'S') { SFX.rankS(); spawnParticles('⭐', 8); }
  else if (['A','B'].includes(autoRank(day))) { SFX.rankGood(); spawnParticles('✦', 4); }
  if (currentSection === 'daily') renderDaily();
}

// ================================================================
// 25. SETTINGS RENDER
// ================================================================
function renderSettings() {
  const s = S.settings;
  setVal('set-name', s.name);
  setVal('set-main-objective', s.mainObjective || '');
  setVal('set-wake', s.wakeTime);
  setVal('set-sleep-goal', s.sleepGoal);
  setVal('set-cal-goal', s.caloriesGoal);
  setVal('set-prot-goal', s.proteinGoal);
  setVal('set-steps-goal', s.stepsGoal);
  setVal('set-training-days', s.trainingDaysPerWeek);
  setVal('set-weight-goal', s.weightGoal || '');
  setVal('set-weight-pace', s.weightPace || 1);

  const bwu = $('set-body-weight-unit');
  if (bwu) bwu.value = s.bodyWeightUnit;
  const twu = $('set-training-weight-unit');
  if (twu) twu.value = s.trainingWeightUnit;
  const wsd = $('set-week-start');
  if (wsd) wsd.value = s.weekStartDay || 0;

  setToggle('tog-sounds', s.sounds);
  setToggle('tog-rest-auto', s.restTimerAuto);
  setToggle('tog-cal-badge', s.calBadgeEnabled);
  setToggle('tog-electrolyte', s.electrolyteMode);
  setToggle('tog-karma', s.karmaEnabled);
  setToggle('tog-caffeine', s.caffeineEnabled);
  setToggle('tog-caff-half-life', s.caffeineHalfLifeMode);
  setToggle('tog-share-weight', s.shareWeight);

  setVal('set-sb-url', s.supabaseUrl);
  setVal('set-sb-key', s.supabaseKey);

  // Electrolyte fields
  const eFields = document.querySelectorAll('.electrolyte-field');
  eFields.forEach(f => f.style.display = s.electrolyteMode ? '' : 'none');

  // Supplement list
  renderSupplementSettings();

  // Theme grid
  renderThemeGrid();
}

function renderSupplementSettings() {
  const container = $('supplement-settings-list');
  if (!container) return;
  const supps = S.settings.supplements || [];
  container.innerHTML = supps.map((s,i) => `
    <div class="supp-setting-row">
      <span>${esc(s.name)} (${s.step} ${s.unit}/step)</span>
      <button class="btn-ghost small" onclick="deleteSupp(${i})">×</button>
    </div>`).join('') + `
    <div class="add-supp-row">
      <input id="new-supp-name" placeholder="Name (e.g. Creatine)" />
      <input id="new-supp-unit" placeholder="Unit (g/mg/ml)" style="width:80px" />
      <input id="new-supp-step" type="number" placeholder="Step" value="5" style="width:60px" />
      <button class="btn-ghost" onclick="addSupp()">+</button>
    </div>`;
}

function addSupp() {
  const name = $('new-supp-name')?.value.trim();
  const unit = $('new-supp-unit')?.value.trim() || 'mg';
  const step = parseFloat($('new-supp-step')?.value) || 100;
  if (!name) return;
  if (!S.settings.supplements) S.settings.supplements = [];
  S.settings.supplements.push({ id: uid(), name, unit, step });
  save(true);
  renderSettings();
  SFX.save();
}

function deleteSupp(idx) {
  S.settings.supplements.splice(idx, 1);
  save(true); renderSettings();
}

const THEMES = [
  { id: 'ff7c', name: 'FF7 CLASSIC',  swatch: ['#00d4aa','#c9a84c','#0a0a12'], fonts: ['Cinzel','Rajdhani'] },
  { id: 'sl',   name: 'SOLO LVL',     swatch: ['#6c63ff','#38bdf8','#0c0c16'], fonts: ['Cinzel','Rajdhani'] },
  { id: 'ff7r', name: 'FF7 REMAKE',   swatch: ['#00c8e8','#8040c0','#080c12'], fonts: ['Cinzel','Rajdhani'] },
  { id: 'ro',   name: 'RAGNAROK',     swatch: ['#4a82b4','#c3d6f4','#f0f5ff'], fonts: ['Palatino Linotype','Tahoma'] },
  { id: 'og',   name: 'OVERGEARED',   swatch: ['#ceeeff','#d88038','#65799a'], fonts: ['Cinzel','system-ui'] },
];

function renderThemeGrid() {
  const grid = $('theme-grid');
  if (!grid) return;
  grid.innerHTML = THEMES.map(t => `
    <div class="theme-card ${S.settings.theme === t.id ? 'active' : ''}" onclick="applyTheme('${t.id}')">
      <div class="theme-swatch" style="background:linear-gradient(135deg,${t.swatch[0]},${t.swatch[1]})"></div>
      <div class="theme-name">${t.name}</div>
    </div>`).join('');
}

function applyTheme(id, fromBoot = false) {
  S.settings.theme = id;
  document.documentElement.dataset.theme = id;
  const t = THEMES.find(x => x.id === id);
  if (t) {
    document.documentElement.style.setProperty('--font-display', '"' + t.fonts[0] + '", serif');
    document.documentElement.style.setProperty('--font-ui', '"' + t.fonts[1] + '", sans-serif');
  }
  if (!fromBoot) {
    save(true);
    renderThemeGrid();
    try { SFX.tap(); } catch(e) {}
  }
}

function saveSetting(key, val) {
  S.settings[key] = val;
  save();
  if (key === 'electrolyteMode') {
    document.querySelectorAll('.electrolyte-field').forEach(f => f.style.display = val ? '' : 'none');
  }
}

function saveSettingNum(key, val) { S.settings[key] = parseFloat(val) || 0; save(); }
function saveSettingBool(key, val) { S.settings[key] = !!val; save(); }

function setToggle(id, val) {
  const el = $(id);
  if (el) el.classList.toggle('on', !!val);
}

function toggleSetting(key, el) {
  S.settings[key] = !S.settings[key];
  el.classList.toggle('on', S.settings[key]);
  save();
  if (key === 'sounds') SFX.tap();
}

// ================================================================
// 26. ONBOARDING
// ================================================================
let onboardingStep = 0;

function startOnboarding() {
  onboardingStep = 0;
  $('onboarding')?.classList.remove('hidden');
  showOnboardingStep(0);
}

function showOnboardingStep(step) {
  document.querySelectorAll('.ob-step').forEach((s,i) => s.classList.toggle('active', i === step));
  document.querySelectorAll('.ob-dot').forEach((d,i) => d.classList.toggle('active', i === step));
}

function nextOnboarding() {
  const steps = [
    { input: 'ob-name',      key: 'name',            required: true },
    { input: 'ob-objective', key: 'mainObjective',   required: false },
    { input: 'ob-wake',      key: 'wakeTime',        required: false },
  ];
  const step = steps[onboardingStep];
  if (step) {
    const val = $(step.input)?.value.trim();
    if (step.required && !val) { SFX.error(); return; }
    if (val) S.settings[step.key] = val;
  }
  onboardingStep++;
  if (onboardingStep >= steps.length) {
    S.settings.onboardingDone = true;
    save(true);
    $('onboarding')?.classList.add('hidden');
    SFX.save();
    boot();
  } else {
    showOnboardingStep(onboardingStep);
    SFX.tap();
  }
}

// ================================================================
// 27. MODALS
// ================================================================
function openModal(id) {
  const m = $(id);
  if (m) { m.classList.add('open'); m.classList.remove('hidden'); }
}

function closeModal(id) {
  const m = $(id);
  if (m) m.classList.remove('open');
}

// Click overlay to close
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ================================================================
// 28. PARTICLES
// ================================================================
function spawnParticles(emoji, count = 4) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    p.style.cssText = `left:${20 + Math.random()*60}vw;top:${30+Math.random()*30}vh;animation-delay:${i*0.07}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

// ================================================================
// 29. MISC HELPERS
// ================================================================
function setText(id, val) { const e=$(id); if(e) e.textContent = val; }
function setVal(id, val) { const e=$(id); if(e) e.value = val; }
function setBarWidth(id, pct) { const e=$(id); if(e) e.style.width = Math.max(0,Math.min(100,pct))+'%'; }

function addProject() {
  const name = $('new-project-name')?.value.trim();
  const color = $('new-project-color')?.value || '#6c63ff';
  if (!name) return;
  S.projects.push(freshProject({ name, color, itemOrder: S.projects.length }));
  save();
  closeModal('modal-add-project');
  renderQuests();
  SFX.save();
}

// ================================================================
// 30. BOOT
// ================================================================
function boot() {
  // Apply theme without triggering save/sound (no user gesture yet)
  applyTheme(S.settings.theme || 'ff7c', true);
  // Make app visible BEFORE nav so sections exist when render runs
  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.add('visible');
  // Reset currentSection so nav() always renders on first call
  currentSection = null;
  try {
    nav('daily');
  } catch(e) {
    console.error('Boot nav error:', e);
    // Show error on screen so player knows something went wrong
    if (appEl) appEl.innerHTML = '<div style="padding:40px;text-align:center;font-family:monospace;color:#f0b323;"><div style="font-size:32px;margin-bottom:12px;">⚠</div><div style="margin-bottom:8px;">INIT ERROR</div><div style="font-size:11px;color:#888;margin-bottom:20px;">' + (e.message||'unknown') + '</div><button onclick="localStorage.clear();location.reload()" style="padding:12px 24px;background:#f0b323;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:14px;">RESET & RESTART</button></div>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Load saved state — wrapped so corrupt data never freezes boot
  try { load(); } catch(e) {
    console.warn('Load error, fresh start:', e);
    localStorage.removeItem('sos_v3');
  }

  // Rotating status messages
  const messages = ['LOADING SAVE DATA...', 'SYNCING MODULES...', 'INITIALIZING SYSTEMS...', 'READY.'];
  let mi = 0;
  const statusEl = document.getElementById('boot-status');
  const msgInterval = setInterval(() => {
    if (mi < messages.length) {
      if (statusEl) statusEl.textContent = messages[mi];
      mi++;
    } else {
      clearInterval(msgInterval);
    }
  }, 580);

  // Boot after animation — 2400ms deliberate delay
  setTimeout(() => {
    clearInterval(msgInterval);

    const bs = document.getElementById('boot-screen');
    if (bs) {
      bs.style.transition = 'opacity 0.6s';
      bs.style.opacity = '0';
      bs.style.pointerEvents = 'none';
      setTimeout(() => { bs.style.display = 'none'; }, 650);
    }

    if (!S.settings.onboardingDone) {
      const ob = document.getElementById('onboarding');
      if (ob) ob.classList.remove('hidden');
    } else {
      boot();
    }
  }, 2400);
});
