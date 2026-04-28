/* ============================================================
   SYSTEM OS — FOOD DATABASE
   Local: Filipino staples + gym foods + common items (~350)
   Remote: USDA FoodData Central fallback for anything else
   ============================================================ */

// ── LOCAL FOOD DATABASE ──
// Format: [name, calories, protein, carbs, fat, servingSize, servingUnit]
const FOOD_DB = [

  // ── FILIPINO STAPLES ──
  ['White Rice (1 cup cooked)',          206, 4,  45, 0,  186, 'g'],
  ['Sinangag (garlic fried rice)',        250, 5,  48, 5,  190, 'g'],
  ['Pandesal (1 piece)',                  145, 4,  27, 3,  60,  'g'],
  ['Tapsilog (tapa+sinangag+itlog)',      650, 38, 52, 28, 350, 'g'],
  ['Longsilog',                           620, 30, 50, 30, 330, 'g'],
  ['Tocilog',                             680, 32, 55, 32, 340, 'g'],
  ['Adobo Chicken (1 serving)',           320, 28, 8,  18, 200, 'g'],
  ['Adobo Pork (1 serving)',              380, 26, 7,  26, 200, 'g'],
  ['Sinigang na Baboy (1 bowl)',          280, 22, 14, 14, 350, 'g'],
  ['Sinigang na Hipon',                   180, 20, 12, 5,  300, 'g'],
  ['Kare-Kare (1 serving)',               420, 28, 18, 26, 300, 'g'],
  ['Lechon Kawali (100g)',                350, 22, 2,  28, 100, 'g'],
  ['Bistek Tagalog',                      290, 26, 10, 16, 200, 'g'],
  ['Tinola (1 bowl)',                     190, 20, 8,  8,  350, 'g'],
  ['Bulalo (1 bowl)',                     380, 30, 5,  26, 400, 'g'],
  ['Pinakbet',                            180, 8,  16, 10, 200, 'g'],
  ['Laing',                               280, 8,  12, 22, 150, 'g'],
  ['Chicken Inasal (1 pc thigh)',         280, 32, 2,  16, 180, 'g'],
  ['Grilled Bangus (1 medium)',           250, 30, 0,  14, 200, 'g'],
  ['Siomai (1 piece)',                    60,  4,  6,  2,  30,  'g'],
  ['Lumpia Shanghai (1 piece)',           80,  4,  7,  4,  30,  'g'],
  ['Pancit Canton (1 serving)',           380, 16, 52, 12, 200, 'g'],
  ['Palabok (1 serving)',                 420, 18, 58, 14, 250, 'g'],
  ['Nilaga (1 bowl)',                     260, 24, 12, 12, 350, 'g'],
  ['Caldereta (1 serving)',               380, 28, 16, 22, 250, 'g'],
  ['Menudo (1 serving)',                  340, 24, 18, 18, 200, 'g'],
  ['Mechado (1 serving)',                 360, 26, 16, 20, 200, 'g'],
  ['Dinuguan (1 serving)',                320, 22, 8,  22, 200, 'g'],
  ['Tortang Talong (1 piece)',            180, 10, 8,  12, 120, 'g'],
  ['Tofu Guisado',                        160, 12, 8,  10, 150, 'g'],
  ['Ampalaya con Carne',                  220, 16, 10, 14, 200, 'g'],

  // ── FILIPINO SNACKS / BREADS ──
  ['Skyflakes (1 pack)',                  150, 3,  25, 4,  33,  'g'],
  ['Chippy (1 pack)',                     160, 2,  20, 8,  35,  'g'],
  ['Banana Cue (1 piece)',                180, 1,  42, 2,  100, 'g'],
  ['Turon (1 piece)',                     220, 2,  48, 3,  100, 'g'],
  ['Puto (1 piece)',                      90,  2,  18, 1,  50,  'g'],
  ['Bibingka (1 piece)',                  280, 5,  48, 7,  150, 'g'],
  ['Maja Blanca (1 piece)',               200, 3,  38, 4,  100, 'g'],
  ['Biko (1 piece)',                      220, 3,  44, 4,  100, 'g'],
  ['Halo-Halo (1 glass)',                 300, 5,  58, 6,  350, 'ml'],
  ['Mais con Hielo (1 glass)',            220, 4,  48, 2,  300, 'ml'],
  ['Coke 1.5L',                           630, 0,  162,0,  1500,'ml'],
  ['Coke Regular (330ml can)',            139, 0,  35, 0,  330, 'ml'],
  ['Royal Tru-Orange (330ml)',            152, 0,  38, 0,  330, 'ml'],

  // ── PROTEIN SOURCES (GYM STAPLES) ──
  ['Chicken Breast (cooked, 100g)',       165, 31, 0,  3.6, 100, 'g'],
  ['Chicken Thigh (cooked, 100g)',        209, 26, 0,  11,  100, 'g'],
  ['Eggs (1 large)',                      72,  6,  0.4,5,  50,  'g'],
  ['Egg Whites (3)',                      51,  11, 1,  0,   99,  'g'],
  ['Ground Beef 80/20 (100g)',            254, 17, 0,  20,  100, 'g'],
  ['Ground Beef 90/10 (100g)',            196, 20, 0,  12,  100, 'g'],
  ['Beef Sirloin (100g)',                 207, 26, 0,  10,  100, 'g'],
  ['Pork Tenderloin (100g)',              143, 22, 0,  5,   100, 'g'],
  ['Pork Belly (100g)',                   518, 9,  0,  53,  100, 'g'],
  ['Salmon (100g)',                       208, 20, 0,  13,  100, 'g'],
  ['Tilapia (100g)',                      96,  20, 0,  2,   100, 'g'],
  ['Bangus/Milkfish (100g)',              148, 20, 0,  7,   100, 'g'],
  ['Tuna in Water (1 can, 130g)',         120, 28, 0,  1,   130, 'g'],
  ['Tuna in Oil (1 can, 130g)',           220, 26, 0,  12,  130, 'g'],
  ['Sardines in Tomato Sauce (1 can)',    190, 18, 4,  11,  155, 'g'],
  ['Tofu Firm (100g)',                    76,  8,  2,  4,   100, 'g'],
  ['Tempeh (100g)',                       193, 19, 10, 11,  100, 'g'],
  ['Whey Protein (1 scoop, 30g)',         120, 24, 3,  2,   30,  'g'],
  ['Casein Protein (1 scoop)',            110, 22, 4,  1,   30,  'g'],
  ['Greek Yogurt Plain (100g)',           97,  9,  4,  5,   100, 'g'],
  ['Cottage Cheese (100g)',               98,  11, 3,  4,   100, 'g'],
  ['Low-fat Milk (1 cup)',                102, 8,  12, 2,   240, 'ml'],
  ['Whole Milk (1 cup)',                  149, 8,  12, 8,   240, 'ml'],

  // ── CARB SOURCES ──
  ['Brown Rice (1 cup cooked)',           216, 5,  45, 2,   195, 'g'],
  ['Oats (100g dry)',                     389, 17, 66, 7,   100, 'g'],
  ['Oatmeal cooked (1 cup)',              158, 6,  27, 3,   240, 'g'],
  ['Sweet Potato (100g)',                 86,  2,  20, 0,   100, 'g'],
  ['Bread White (1 slice)',               79,  3,  15, 1,   30,  'g'],
  ['Bread Wheat (1 slice)',               69,  4,  12, 1,   30,  'g'],
  ['Pasta (100g dry)',                    371, 13, 75, 2,   100, 'g'],
  ['Pasta cooked (1 cup)',                220, 8,  43, 1,   140, 'g'],
  ['Banana (1 medium)',                   105, 1,  27, 0,   118, 'g'],
  ['Apple (1 medium)',                    95,  0.5,25, 0,   182, 'g'],
  ['Mango (1 cup)',                       107, 1,  28, 0,   165, 'g'],
  ['Watermelon (1 cup)',                  46,  1,  11, 0,   152, 'g'],
  ['Potato (100g boiled)',                87,  2,  20, 0,   100, 'g'],
  ['Corn (1 ear)',                        123, 5,  27, 2,   150, 'g'],

  // ── VEGETABLES ──
  ['Broccoli (100g)',                     34,  3,  7,  0,   100, 'g'],
  ['Spinach (100g)',                      23,  3,  4,  0,   100, 'g'],
  ['Kangkong (100g)',                     19,  2,  3,  0,   100, 'g'],
  ['Pechay (100g)',                       13,  2,  2,  0,   100, 'g'],
  ['Monggo (mung beans, 100g cooked)',    105, 7,  19, 0,   100, 'g'],
  ['Kamote Tops (100g)',                  45,  4,  8,  0,   100, 'g'],
  ['Carrot (100g)',                       41,  1,  10, 0,   100, 'g'],
  ['Cabbage (100g)',                      25,  1,  6,  0,   100, 'g'],
  ['Tomato (1 medium)',                   22,  1,  5,  0,   123, 'g'],
  ['Onion (100g)',                        40,  1,  9,  0,   100, 'g'],

  // ── FATS / NUTS / OILS ──
  ['Olive Oil (1 tbsp)',                  119, 0,  0,  14,  14,  'ml'],
  ['Coconut Oil (1 tbsp)',                121, 0,  0,  14,  14,  'ml'],
  ['Peanut Butter (2 tbsp)',              190, 8,  6,  16,  32,  'g'],
  ['Almonds (1 oz / 28g)',                164, 6,  6,  14,  28,  'g'],
  ['Peanuts (1 oz)',                      161, 7,  5,  14,  28,  'g'],
  ['Avocado (100g)',                      160, 2,  9,  15,  100, 'g'],
  ['Butter (1 tbsp)',                     102, 0,  0,  12,  14,  'g'],

  // ── FAST FOOD / COMMON CHAINS (PH) ──
  ['Jollibee Chickenjoy (1 pc thigh)',    320, 22, 12, 20,  145, 'g'],
  ['Jollibee Jolly Spaghetti',            500, 14, 72, 18,  250, 'g'],
  ['Jollibee Yumburger',                  270, 13, 30, 11,  110, 'g'],
  ['McDo McChicken Burger',               370, 15, 40, 17,  160, 'g'],
  ['McDo Big Mac',                        508, 25, 46, 26,  214, 'g'],
  ['McDo McSpaghetti',                    380, 11, 62, 11,  250, 'g'],
  ['KFC Original (1 pc chicken)',         320, 22, 11, 20,  145, 'g'],
  ['Chowking Siopao Asado',               280, 10, 42, 8,   130, 'g'],
  ['Chowking Fried Rice',                 330, 7,  58, 8,   200, 'g'],
  ['Greenwich Lasagna',                   420, 18, 48, 18,  250, 'g'],
  ['Mang Inasal Chicken Inasal (thigh)', 280, 32, 2,  16,  180, 'g'],
  ['Mang Inasal Rice (unlimited)',        206, 4,  45, 0,   186, 'g'],

  // ── SUPPLEMENTS / DRINKS ──
  ['Black Coffee (1 cup)',                2,   0,  0,  0,   240, 'ml'],
  ['Coffee with milk + sugar',            90,  2,  16, 2,   240, 'ml'],
  ['3-in-1 Coffee (1 sachet)',            65,  1,  12, 2,   18,  'g'],
  ['Sports Drink (Gatorade 500ml)',       130, 0,  34, 0,   500, 'ml'],
  ['Protein Bar (generic)',               200, 20, 22, 6,   60,  'g'],
  ['Banana Protein Shake (1 scoop+1 banana)', 225, 25, 30, 3, 400, 'ml'],

  // ── COMMON GLOBAL ──
  ['Pizza (1 slice cheese)',              272, 12, 33, 10,  107, 'g'],
  ['Hamburger (plain)',                   295, 17, 24, 14,  130, 'g'],
  ['French Fries (medium)',               365, 4,  48, 17,  154, 'g'],
  ['Fried Chicken (100g)',                320, 22, 12, 20,  100, 'g'],
  ['Caesar Salad (1 serving)',            470, 11, 22, 38,  300, 'g'],
  ['Ramen (1 bowl)',                      436, 18, 55, 16,  400, 'g'],
  ['Sushi (salmon, 1 piece)',             60,  4,  8,  1,   28,  'g'],
  ['Shawarma (1 wrap)',                   550, 28, 52, 24,  280, 'g'],
];

// ── FOOD SEARCH ──
const FoodDB = {
  // Build searchable index on first use
  _index: null,

  _buildIndex() {
    if (this._index) return;
    this._index = FOOD_DB.map((f, i) => ({
      id: i,
      name: f[0],
      calories: f[1],
      protein: f[2],
      carbs: f[3],
      fat: f[4],
      servingSize: f[5],
      servingUnit: f[6],
      searchKey: f[0].toLowerCase()
    }));
  },

  search(query, limit = 12) {
    this._buildIndex();
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    // Score: exact name match > starts with > all terms found > partial match
    const scored = this._index.map(food => {
      let score = 0;
      const key = food.searchKey;
      if (key === q) score = 100;
      else if (key.startsWith(q)) score = 80;
      else if (terms.every(t => key.includes(t))) score = 60;
      else if (terms.some(t => key.includes(t))) score = 20;
      return { food, score };
    }).filter(x => x.score > 0);

    return scored.sort((a,b) => b.score - a.score).slice(0, limit).map(x => x.food);
  },

  getById(id) {
    this._buildIndex();
    return this._index[id] || null;
  },

  // Search user's personal log for autocomplete
  searchUserHistory(query, limit = 5) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const deleted = state._deletedFoodHistory || [];
    const allFoods = [];
    Object.values(state.days).forEach(day => {
      (day.nutrition?.foods || []).forEach(f => {
        if (!allFoods.find(x => x.name === f.name) && !deleted.includes(f.name)) {
          allFoods.push(f);
        }
      });
    });
    return allFoods
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, limit)
      .map(f => ({ ...f, fromHistory: true }));
  },

  // USDA FoodData Central search (free, no API key needed for basic)
  async searchUSDA(query) {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=SR%20Legacy,Survey%20(FNDDS)&pageSize=8&api_key=DEMO_KEY`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.foods || []).map(f => {
        const getN = nutrientId => {
          const n = (f.foodNutrients || []).find(x => x.nutrientId === nutrientId);
          return Math.round(n?.value || 0);
        };
        return {
          name: f.description,
          calories: getN(1008),
          protein: getN(1003),
          carbs: getN(1005),
          fat: getN(1004),
          servingSize: 100,
          servingUnit: 'g',
          fromUSDA: true
        };
      });
    } catch(e) {
      return [];
    }
  }
};

// ── CAL/PROTEIN SYNC TO DAILY QUESTS ──
// Called whenever nutrition totals change
function syncNutritionToQuests() {
  const today = todayKey();
  const day = getDay(today);
  const n = day.nutrition;
  const s = state.settings;

  // Sync calories to daily quest
  const prevCal = day.coreQuests.calories;
  day.coreQuests.calories = n.calories;

  // Sync protein to daily quest
  const prevProt = day.coreQuests.protein;
  day.coreQuests.protein = n.protein;

  // Celebrate if newly hitting goals
  const calGoalHit = n.calories > 0 && n.calories <= s.caloriesGoal;
  const protGoalHit = n.protein >= s.proteinGoal;
  const prevCalHit = prevCal > 0 && prevCal <= s.caloriesGoal;
  const prevProtHit = prevProt >= s.proteinGoal;

  if (calGoalHit && !prevCalHit) {
    SoundEngine.questComplete();
    spawnParticles('🔥', 4);
  }
  if (protGoalHit && !prevProtHit) {
    SoundEngine.questComplete();
    spawnParticles('💪', 4);
  }

  // If on daily section, refresh it
  if (currentSection === 'daily') renderDaily();
}

// ── GOOGLE SHEETS EXPORT ──
const SheetsExport = {
  // Build a data object matching the sheet's structure
  buildExportData(dateRange = 30) {
    const rows = [];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - dateRange);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const day = state.days[key];
      const wLog = state.weightLog.find(w => w.date === key);
      if (!day && !wLog) continue;

      const cq = day?.coreQuests || {};
      const n = day?.nutrition || {};
      const rank = day ? autoRank(day) : '';

      rows.push({
        date: key,
        rank: rank,
        sleep: cq.sleepHours || '',
        steps: cq.steps || '',
        calories: n.calories || cq.calories || '',
        protein: n.protein || cq.protein || '',
        carbs: n.carbs || '',
        fat: n.fat || '',
        weight: wLog?.weight || day?.weight || '',
        trained: cq.trained ? 1 : 0,
        mainQuest: cq.mainQuest ? 1 : 0,
        mood: day?.mood || '',
        intention: day?.intention || '',
        reflection: day?.reflection || '',
        caffeine: n.caffeine || '',
        creatine: n.creatine || ''
      });
    }
    return rows;
  },

  // Export as CSV (simple, works with Sheets import)
  exportCSV(dateRange = 90) {
    const rows = this.buildExportData(dateRange);
    const headers = ['Date','Rank','Sleep (hrs)','Steps','Calories','Protein (g)','Carbs (g)','Fat (g)','Weight','Trained','Main Quest','Mood','Intention','Reflection','Caffeine (mg)','Creatine (g)'];
    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      csvRows.push([
        r.date, r.rank, r.sleep, r.steps, r.calories, r.protein,
        r.carbs, r.fat, r.weight, r.trained, r.mainQuest, r.mood,
        `"${(r.intention||'').replace(/"/g,'""')}"`,
        `"${(r.reflection||'').replace(/"/g,'""')}"`,
        r.caffeine, r.creatine
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SystemOS_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Weekly summary for monthly overview tab
  buildWeeklySummary() {
    const weeks = [];
    const allDates = Object.keys(state.days).sort();
    if (!allDates.length) return weeks;

    // Group by week
    const weekMap = {};
    allDates.forEach(date => {
      const d = new Date(date + 'T12:00:00');
      const day = d.getDay();
      const diff = (day - (state.settings.weekStartDay || 0) + 7) % 7;
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - diff);
      const wKey = weekStart.toISOString().slice(0,10);
      if (!weekMap[wKey]) weekMap[wKey] = [];
      weekMap[wKey].push(date);
    });

    Object.entries(weekMap).forEach(([weekStart, dates]) => {
      const dayData = dates.map(d => state.days[d]).filter(Boolean);
      const weights = dates.map(d => state.weightLog.find(w=>w.date===d)?.weight).filter(Boolean);
      const ranks = dayData.map(d => autoRank(d)).filter(Boolean);
      const rankOrder = {S:7,A:6,B:5,C:4,D:3,E:2,F:1};
      const avgRankNum = ranks.length ? ranks.reduce((s,r)=>s+(rankOrder[r]||0),0)/ranks.length : 0;
      const avgRank = ['F','F','E','D','C','B','A','S'][Math.round(avgRankNum)] || '—';

      weeks.push({
        weekStart,
        weekEnd: dates[dates.length-1],
        avgRank,
        trainedDays: dayData.filter(d=>d.coreQuests?.trained).length,
        avgCalories: dayData.length ? Math.round(dayData.reduce((s,d)=>s+(d.nutrition?.calories||d.coreQuests?.calories||0),0)/dayData.length) : '',
        avgProtein: dayData.length ? Math.round(dayData.reduce((s,d)=>s+(d.nutrition?.protein||d.coreQuests?.protein||0),0)/dayData.length) : '',
        avgWeight: weights.length ? (weights.reduce((s,w)=>s+w,0)/weights.length).toFixed(1) : '',
        startWeight: weights[0] || '',
        endWeight: weights[weights.length-1] || '',
        weightChange: weights.length >= 2 ? (weights[weights.length-1]-weights[0]).toFixed(1) : ''
      });
    });

    return weeks;
  }
};
