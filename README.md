# SYSTEM OS — Main Quest Life Operating System

A PWA life tracker with RPG aesthetics. Daily quests, training log, nutrition, journal, weight tracking, and data visualization.

**Live:** https://tomoncupa.github.io/lifeos

---

## Add to iPhone Home Screen

1. Open **https://tomoncupa.github.io/lifeos** in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app runs fullscreen with no browser UI.

---

## Cloud Sync Setup (Supabase)

Your data is saved locally by default. Follow these steps to enable cloud backup so your data survives reinstalls and syncs across devices.

### Step 1 — Create a Supabase account

Go to **https://supabase.com** and sign up for free.

### Step 2 — Create a new project

1. Click **New Project**
2. Name it `SystemOS`
3. Choose **Asia-Pacific** (Singapore) for best performance in the Philippines
4. Click **Generate a password** for a strong database password
5. Click **Create new project** — wait ~2 minutes for it to provision

### Step 3 — Run the database schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste the contents of `supabase-schema.sql` from this repo
4. Click **Run**

You should see: `Success. No rows returned`

### Step 4 — Get your API keys

1. Go to **Settings → API Keys** in your Supabase project
2. Copy the **Project URL** — looks like `https://xxxx.supabase.co`
3. Copy the **anon / public** key — starts with `eyJ...`

### Step 5 — Enter keys in the app

1. Open System OS on your phone
2. Go to **CONFIG** (settings tab, gear icon)
3. Scroll to **CLOUD SYNC (SUPABASE)**
4. Paste your **Project URL**
5. Paste your **Anon Key**
6. The sync dot (top right) turns **green** when connected

Your data now syncs automatically every 2 minutes when changes are detected.

---

## Themes

| Theme | Style |
|-------|-------|
| **SOLO LVL** | Dark, purple/blue — default |
| **FF7 CLS** | Dark gritty, teal/gold |
| **FF7 RMK** | Cinematic, cyan/purple |
| **RO ONLN** | Light, classic MMO, Tahoma/Palatino |
| **OVRGRD** | Steel blue, amber accent |

Switch themes in **CONFIG → THEME**.

---

## Features

- **Daily Quests** — Sleep (6.5–10hr goal), Steps, Calories, Protein, Trained, Main Quest
- **S→F Rank** — Auto-calculated daily, overridable in evening debrief
- **Streak tracking** — Rest days protected
- **Quest Log** — NLP date parsing (`today`, `next monday`, `every week`, `!1` priority)
- **Training** — Sets × Reps × Weight × RIR, last session history, personal bests, volume tracking
- **Nutrition** — Macro dashboard, TDEE auto-calculated from weight + calorie data, caffeine/creatine
- **Journal** — Mood, prompted questions, free write
- **Data viz** — Weight chart with goal line, reality trend, projection pacer. Calorie bar chart.
- **Story export** — Full-screen card, long-press image to save to Photos
- **Desktop mode** — Floating draggable panels, toggle in settings
- **5 themes** — Switchable in CONFIG

---

## File Structure

```
lifeos/
├── index.html          Main app shell
├── manifest.json       PWA manifest
├── supabase-schema.sql Run this in Supabase SQL Editor
├── css/
│   ├── themes.css      All 5 theme variable sets
│   └── main.css        Full UI styles
├── js/
│   ├── sounds.js       Web Audio dopamine engine
│   ├── data.js         State, NLP parser, TDEE, exercise DB
│   ├── charts.js       Weight/calorie charts
│   ├── export.js       Story card builder
│   ├── desktop.js      Floating panel manager
│   └── app.js          Main application logic
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
