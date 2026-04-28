/* ============================================================
   SYSTEM OS — DATA ENGINE
   State, localStorage, NLP, TDEE, Exercise DB
   ============================================================ */

// ── EXERCISE DATABASE (FitNotes-inspired) ──
const EXERCISE_DB = {
  CHEST:    ['Bench Press','Incline Bench Press','Decline Bench Press','Dumbbell Press','Incline Dumbbell Press','Cable Fly','Dumbbell Fly','Pec Deck','Push-Up','Chest Dip'],
  BACK:     ['Deadlift','Pull-Up','Chin-Up','Barbell Row','Dumbbell Row','Lat Pulldown','Seated Cable Row','T-Bar Row','Face Pull','Rack Pull','Shrug'],
  LEGS:     ['Squat','Front Squat','Leg Press','Romanian Deadlift','Stiff-Leg Deadlift','Leg Curl','Leg Extension','Bulgarian Split Squat','Hack Squat','Calf Raise','Standing Calf Raise'],
  SHOULDERS:['Overhead Press','Seated Dumbbell Press','Arnold Press','Lateral Raise','Front Raise','Rear Delt Fly','Cable Lateral Raise','Upright Row','Face Pull'],
  ARMS:     ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','Incline Curl','Tricep Pushdown','Skull Crusher','Close-Grip Bench','Overhead Tricep Extension','Dips'],
  CORE:     ['Plank','Ab Wheel','Hanging Leg Raise','Cable Crunch','Sit-Up','Russian Twist','Dead Bug','Pallof Press'],
  CARDIO:   ['Treadmill Run','Cycling','Rowing Machine','Jump Rope','Stairmaster','HIIT Intervals'],
  FULL:     ['Clean & Press','Thruster','Turkish Get-Up','Kettlebell Swing','Burpee','Snatch','Power Clean']
};

function getAllExercises() {
  return [...new Set(Object.values(EXERCISE_DB).flat())].sort();
}

function getExercisesForSplit(split) {
  if (split === 'ALL') return getAllExercises();
  return EXERCISE_DB[split] || [];
}

// ── DATE UTILITIES ──
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function isOverdue(iso) {
  return iso < todayKey();
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.round((db - da) / 86400000);
}

// ── NLP DATE PARSER (Todoist-inspired) ──
const NLP_RULES = [
  { re: /\btoday\b/i,       fn: () => todayKey(),           label: 'Today' },
  { re: /\btomorrow\b/i,    fn: () => addDays(todayKey(),1), label: 'Tomorrow' },
  { re: /\bnext week\b/i,   fn: () => addDays(todayKey(),7), label: 'Next week' },
  { re: /\bnext month\b/i,  fn: () => { const d=new Date(); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); }, label: 'Next month' },
  { re: /\bin (\d+) days?\b/i, fn: m => addDays(todayKey(), parseInt(m[1])), label: null },
  { re: /\bin (\d+) weeks?\b/i, fn: m => addDays(todayKey(), parseInt(m[1])*7), label: null },
  { re: /\b(mon|monday)\b/i,    fn: () => nextWeekday(1), label: 'Monday' },
  { re: /\b(tue|tuesday)\b/i,   fn: () => nextWeekday(2), label: 'Tuesday' },
  { re: /\b(wed|wednesday)\b/i, fn: () => nextWeekday(3), label: 'Wednesday' },
  { re: /\b(thu|thursday)\b/i,  fn: () => nextWeekday(4), label: 'Thursday' },
  { re: /\b(fri|friday)\b/i,    fn: () => nextWeekday(5), label: 'Friday' },
  { re: /\b(sat|saturday)\b/i,  fn: () => nextWeekday(6), label: 'Saturday' },
  { re: /\b(sun|sunday)\b/i,    fn: () => nextWeekday(0), label: 'Sunday' },
  { re: /\bevery day\b/i,   fn: () => todayKey(), label: 'Daily', recurring: 'daily' },
  { re: /\bevery week\b/i,  fn: () => todayKey(), label: 'Weekly', recurring: 'weekly' },
  { re: /\bevery month\b/i, fn: () => todayKey(), label: 'Monthly', recurring: 'monthly' },
  { re: /\b!1\b/, fn: () => null, label: null, priority: 1 },
  { re: /\b!2\b/, fn: () => null, label: null, priority: 2 },
  { re: /\b!3\b/, fn: () => null, label: null, priority: 3 },
];

function nextWeekday(target) {
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function parseNLP(text) {
  let due = null, label = null, recurring = null, priority = 4, clean = text;
  for (const rule of NLP_RULES) {
    const m = text.match(rule.re);
    if (m) {
      if (rule.fn) {
        const d = rule.fn(m);
        if (d) { due = d; label = rule.label || formatDate(d); }
      }
      if (rule.recurring) recurring = rule.recurring;
      if (rule.priority) priority = rule.priority;
      clean = clean.replace(rule.re, '').replace(/\s+/g, ' ').trim();
    }
  }
  // Parse @tags and #quests
  const tags = [...(clean.match(/@(\w+)/g) || [])].map(t => t.slice(1));
  const quests = [...(clean.match(/#(\w+)/g) || [])].map(q => q.slice(1));
  clean = clean.replace(/@\w+/g, '').replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
  return { due, label, recurring, priority, tags, quests, clean };
}

// ── TDEE CALCULATOR ──
function calculateTDEE() {
  const weights = state.weightLog.slice(-14); // last 14 days
  const calDays = Object.entries(state.days)
    .slice(-14)
    .filter(([,d]) => d.coreQuests.calories > 0);

  if (weights.length < 7 || calDays.length < 7) return null;

  // Average daily weight change (lbs)
  const sorted = [...weights].sort((a,b) => a.date < b.date ? -1 : 1);
  const weightChange = (sorted[sorted.length-1].weight - sorted[0].weight) / (sorted.length - 1); // lbs/day
  const avgCalories = calDays.reduce((s,[,d]) => s + d.coreQuests.calories, 0) / calDays.length;

  // 1 lb of fat ≈ 3500 calories
  const deficit = weightChange * 3500; // negative = deficit
  const tdee = Math.round(avgCalories - deficit);

  return { tdee, avgCalories: Math.round(avgCalories), weightChange: weightChange * 7, dataPoints: weights.length };
}

// ── WEIGHT GOAL PROJECTION ──
function calculateProjection() {
  const s = state.settings;
  if (!s.weightGoal) return null;

  const recent = state.weightLog.slice(-7);
  if (recent.length < 2) return null;

  const currentWeight = recent[recent.length - 1].weight;
  const weeklyRate = s.weightLossPace || 0.5; // lbs/week default
  const remainingWeight = currentWeight - s.weightGoal;

  let targetDate;
  if (s.weightDeadline) {
    targetDate = s.weightDeadline;
  } else {
    const weeksNeeded = Math.abs(remainingWeight / weeklyRate);
    targetDate = addDays(todayKey(), Math.round(weeksNeeded * 7));
  }

  const requiredPace = s.weightDeadline ?
    remainingWeight / (daysBetween(todayKey(), s.weightDeadline) / 7) : weeklyRate;

  return { currentWeight, targetDate, requiredPace: Math.abs(requiredPace), remainingWeight: Math.abs(remainingWeight), targetWeight: s.weightGoal };
}

// ── ACTUAL WEIGHT TREND ──
function calculateActualTrend() {
  const logs = state.weightLog.slice(-90).sort((a,b) => a.date < b.date ? -1 : 1);
  if (logs.length < 2) return null;
  const n = logs.length;
  const xMean = (n - 1) / 2;
  const yMean = logs.reduce((s,l) => s + l.weight, 0) / n;
  let num = 0, den = 0;
  logs.forEach((l, i) => {
    num += (i - xMean) * (l.weight - yMean);
    den += (i - xMean) ** 2;
  });
  const slope = den ? num / den : 0; // lbs per day
  return { slope, slopePerWeek: slope * 7, firstDate: logs[0].date, lastDate: logs[n-1].date };
}

// ── STREAK ──
function calculateStreak() {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const day = state.days[key];
    if (!day || day.rank === null || day.rank === undefined) {
      if (key === todayKey()) { d.setDate(d.getDate() - 1); continue; }
      break;
    }
    streak++;
    d.setDate(d.getDate() - 1);
    if (streak > 999) break;
  }
  return streak;
}

// ── AUTO RANK ──
function autoRank(day) {
  if (day.rank !== null && day.rank !== undefined) return day.rank;
  const q = day.coreQuests;
  const g = state.settings;
  let score = 0;
  if (q.sleep) score += 2;
  if (q.steps >= g.stepsGoal) score += 2;
  if (q.calories > 0 && q.calories <= g.caloriesGoal) score += 2;
  if (q.protein >= g.proteinGoal) score += 2;
  if (q.trained) score += 1;
  if (q.mainQuest) score += 1;
  const customDone = (day.customQuests || []).filter(c=>c.done).length;
  const customTotal = (day.customQuests || []).length;
  if (customTotal > 0) score += Math.round((customDone / customTotal) * 1);
  const max = 10 + (customTotal > 0 ? 1 : 0);
  const pct = score / max;
  if (pct >= 1.0) return 'S';
  if (pct >= 0.82) return 'A';
  if (pct >= 0.64) return 'B';
  if (pct >= 0.46) return 'C';
  if (pct >= 0.28) return 'D';
  if (pct >= 0.1) return 'E';
  return 'F';
}

function rankColor(r) {
  const el = document.documentElement;
  const style = getComputedStyle(el);
  const map = { S:'--rank-s', A:'--rank-a', B:'--rank-b', C:'--rank-c', D:'--rank-d', E:'--rank-e', F:'--rank-f' };
  return style.getPropertyValue(map[r] || '--rank-f').trim() || '#888';
}

// ── DEFAULT STATE ──
const DEFAULT_SETTINGS = {
  name: '',
  mainQuest: '',
  wakeTime: '07:00',
  eveningTime: '21:00',
  caloriesGoal: 2400,
  proteinGoal: 175,
  stepsGoal: 10000,
  bodyWeightUnit: 'lbs',
  trainingWeightUnit: 'kg',
  weekStartDay: 0, // 0=Sunday
  sounds: true,
  theme: 'sl',
  weightGoal: null,
  weightDeadline: null,
  weightLossPace: 1.0, // lbs/week
  shareWeight: false,
  showDesktop: false,
  onboardingDone: false,
  supabaseUrl: '',
  supabaseKey: '',
};

function freshDay() {
  return {
    weight: null,
    intention: '',
    reflection: '',
    rank: null,
    isRestDay: false,
    morningDone: false,
    eveningDone: false,
    coreQuests: { sleep: false, steps: 0, calories: 0, protein: 0, trained: false, mainQuest: false },
    customQuests: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, caffeine: 0, creatine: 0, foods: [] },
    mood: null,
    journalPrompts: { howWasToday: '', whatHappened: '', howAreYouFeeling: '' },
    journalFree: ''
  };
}

// ── GLOBAL STATE ──
let state = {
  days: {},
  quests: [],
  exercises: {},
  journal: [],
  weightLog: [],
  settings: { ...DEFAULT_SETTINGS },
  _dirty: false,
};

// ── PERSISTENCE ──
function loadState() {
  try {
    const raw = localStorage.getItem('systemos_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      state = deepMerge(state, parsed);
    }
  } catch(e) { console.warn('State load error', e); }

  // Ensure today exists
  const today = todayKey();
  if (!state.days[today]) state.days[today] = freshDay();

  // Sync weightLog from days (backwards compat)
  Object.entries(state.days).forEach(([date, day]) => {
    if (day.weight !== null && !state.weightLog.find(w => w.date === date)) {
      state.weightLog.push({ date, weight: day.weight });
    }
  });
  state.weightLog.sort((a,b) => a.date < b.date ? -1 : 1);
}

function saveState() {
  try {
    localStorage.setItem('systemos_v2', JSON.stringify(state));
    state._dirty = false;
    updateSyncDot('synced');
  } catch(e) { console.warn('Save error', e); }
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const k in source) {
    if (k === '_dirty') continue;
    if (source[k] !== null && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(target[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

function getDay(dateStr) {
  if (!state.days[dateStr]) state.days[dateStr] = freshDay();
  return state.days[dateStr];
}

function updateSyncDot(status) {
  const dot = document.getElementById('sync-dot');
  if (dot) { dot.className = 'sync-dot ' + status; }
}

// ── SUPABASE SYNC (stub — activated after walkthrough) ──
let supabase = null;

function initSupabase() {
  const url = state.settings.supabaseUrl;
  const key = state.settings.supabaseKey;
  if (!url || !key || typeof window.supabase === 'undefined') return false;
  try {
    supabase = window.supabase.createClient(url, key);
    return true;
  } catch(e) { return false; }
}

async function syncToSupabase() {
  if (!supabase) return;
  try {
    updateSyncDot('pending');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_state').upsert({
      user_id: user.id,
      state_json: JSON.stringify(state),
      updated_at: new Date().toISOString()
    });
    updateSyncDot('synced');
  } catch(e) {
    updateSyncDot('offline');
    console.warn('Sync error', e);
  }
}

async function loadFromSupabase() {
  if (!supabase) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_state').select('state_json').eq('user_id', user.id).single();
    if (data?.state_json) {
      const remote = JSON.parse(data.state_json);
      state = deepMerge(state, remote);
      saveState();
    }
  } catch(e) { console.warn('Load from Supabase error', e); }
}

// Auto-sync every 2 minutes if Supabase configured
setInterval(() => { if (supabase && state._dirty) syncToSupabase(); }, 120000);

// ── RECURRING TASK HANDLER ──
function processRecurringTasks() {
  const today = todayKey();
  state.quests.forEach(q => {
    if (!q.recurring || !q.done || !q.dueCompleted) return;
    const nextDue = q.recurring === 'daily' ? addDays(q.dueCompleted, 1) :
                    q.recurring === 'weekly' ? addDays(q.dueCompleted, 7) :
                    q.recurring === 'monthly' ? (() => { const d = new Date(q.dueCompleted + 'T12:00:00'); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); })() : null;
    if (nextDue && nextDue <= today) {
      q.done = false;
      q.due = nextDue;
      q.dueCompleted = null;
    }
  });
}

// ── WEEKLY REVIEW DATA ──
function getWeekData(weekStart) {
  const days = [];
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const day = state.days[date];
    days.push({
      date, label: DAY_LABELS[(new Date(date + 'T12:00:00')).getDay()],
      rank: day ? autoRank(day) : null,
      exists: !!day
    });
  }
  const ranked = days.filter(d => d.rank);
  const rankOrder = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  const bestDay = ranked.sort((a,b) => (rankOrder[b.rank]||0) - (rankOrder[a.rank]||0))[0];
  return { days, bestDay };
}

function getCurrentWeekStart() {
  const d = new Date();
  const startDay = state.settings.weekStartDay || 0;
  const diff = (d.getDay() - startDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}
