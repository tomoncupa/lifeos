/* ============================================================
   SYSTEM OS — DOPAMINE SOUND ENGINE
   Layered Web Audio: hit + shimmer + boom, variable reward
   Neuroscience-informed: variable ratio reinforcement
   ============================================================ */

const SoundEngine = (() => {
  let ctx = null;
  let enabled = true;

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function setEnabled(v) { enabled = v; }

  // ── Core oscillator ──
  function osc(freq, type, startTime, duration, vol, attack = 0.005, decay = 0.1) {
    if (!ctx || !enabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq * 4;
    o.connect(filter); filter.connect(g); g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + attack);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    o.start(startTime);
    o.stop(startTime + duration + 0.01);
  }

  // ── Shimmer (high freq sparkle) ──
  function shimmer(baseFreq, startTime, vol = 0.06) {
    if (!ctx || !enabled) return;
    // Variable reward: slight frequency randomization
    const jitter = 1 + (Math.random() - 0.5) * 0.04;
    for (let i = 0; i < 4; i++) {
      osc(baseFreq * (1 + i * 0.25) * jitter, 'sine', startTime + i * 0.04, 0.25, vol * (1 - i * 0.2));
    }
  }

  // ── Low boom ──
  function boom(startTime, vol = 0.12) {
    if (!ctx || !enabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(80, startTime);
    o.frequency.exponentialRampToValueAtTime(30, startTime + 0.3);
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
    o.start(startTime); o.stop(startTime + 0.4);
  }

  // ── Noise burst (hit impact) ──
  function noiseBurst(startTime, vol = 0.08, dur = 0.05) {
    if (!ctx || !enabled) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filter); filter.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    src.start(startTime);
  }

  // ── Ascending melody ──
  function melody(notes, startTime, dur = 0.12, vol = 0.15, type = 'triangle') {
    if (!ctx || !enabled) return;
    notes.forEach((freq, i) => {
      if (freq > 0) osc(freq, type, startTime + i * dur, dur * 1.5, vol);
    });
  }

  const now = () => ctx ? ctx.currentTime : 0;

  // ============================================================
  // PUBLIC SOUNDS — each is distinct, escalating dopamine
  // ============================================================

  const Sounds = {
    tap() {
      init(); resume();
      // Tiny satisfying click
      noiseBurst(now(), 0.04, 0.03);
      osc(800, 'sine', now(), 0.08, 0.06);
    },

    questComplete() {
      init(); resume();
      const t = now();
      // Hit
      noiseBurst(t, 0.1, 0.04);
      // Ascending tones (variable: slight pitch randomization for novelty)
      const base = 440 * (1 + (Math.random() - 0.5) * 0.02);
      osc(base, 'triangle', t, 0.15, 0.14);
      osc(base * 1.25, 'triangle', t + 0.08, 0.18, 0.13);
      osc(base * 1.5, 'sine', t + 0.16, 0.22, 0.12);
      // Shimmer on resolution
      shimmer(base * 2, t + 0.22, 0.05);
      // Tiny boom
      boom(t, 0.06);
    },

    questUndo() {
      init(); resume();
      const t = now();
      osc(440, 'sine', t, 0.08, 0.08);
      osc(330, 'sine', t + 0.08, 0.1, 0.07);
    },

    // Rank sounds — escalating complexity and excitement
    rankD() {
      init(); resume();
      const t = now();
      melody([262, 294, 330], t, 0.1, 0.1, 'triangle');
    },

    rankC() {
      init(); resume();
      const t = now();
      melody([330, 392, 440], t, 0.1, 0.12, 'triangle');
      shimmer(880, t + 0.3, 0.04);
    },

    rankB() {
      init(); resume();
      const t = now();
      noiseBurst(t, 0.08, 0.04);
      melody([392, 494, 587, 659], t, 0.1, 0.14, 'triangle');
      shimmer(1174, t + 0.4, 0.05);
      boom(t + 0.1, 0.06);
    },

    rankA() {
      init(); resume();
      const t = now();
      noiseBurst(t, 0.12, 0.05);
      boom(t, 0.1);
      const base = 440 * (1 + (Math.random() - 0.5) * 0.015);
      melody([base, base*1.2, base*1.5, base*1.8, base*2], t, 0.1, 0.16, 'triangle');
      shimmer(base * 4, t + 0.5, 0.07);
      osc(base * 2, 'sine', t + 0.6, 0.4, 0.1);
    },

    rankS() {
      init(); resume();
      const t = now();
      // Epic S-rank fanfare — layered, variable, genuinely exciting
      // Impact hit
      noiseBurst(t, 0.18, 0.06);
      boom(t, 0.15);
      // Rising heroic melody
      const base = 523.25 * (1 + (Math.random() - 0.5) * 0.01);
      const heroMelody = [base, base*1.125, base*1.25, base*1.5, base*1.875, base*2, base*2.25];
      heroMelody.forEach((f, i) => {
        osc(f, 'triangle', t + i * 0.09, 0.28, 0.18 - i * 0.01);
        // Harmonics
        osc(f * 2, 'sine', t + i * 0.09 + 0.01, 0.2, 0.04);
      });
      // Shimmer cascade
      setTimeout(() => {
        if (!ctx || !enabled) return;
        shimmer(base * 4, ctx.currentTime, 0.09);
        shimmer(base * 5, ctx.currentTime + 0.1, 0.07);
        shimmer(base * 6, ctx.currentTime + 0.2, 0.05);
      }, 650);
      // Final resolution chord
      setTimeout(() => {
        if (!ctx || !enabled) return;
        const ft = ctx.currentTime;
        osc(base * 2, 'sine', ft, 0.5, 0.15);
        osc(base * 2.5, 'sine', ft, 0.5, 0.1);
        osc(base * 3, 'sine', ft, 0.5, 0.08);
        boom(ft, 0.12);
      }, 850);
    },

    streakMilestone() {
      init(); resume();
      const t = now();
      // Ascending fanfare for streak milestones
      noiseBurst(t, 0.12, 0.05);
      boom(t, 0.1);
      [330, 440, 550, 660, 880].forEach((f, i) => {
        osc(f, 'triangle', t + i * 0.12, 0.3, 0.15);
      });
      shimmer(1760, t + 0.6, 0.08);
    },

    streakBroken() {
      init(); resume();
      const t = now();
      // Descending, minor, loss aversion trigger
      [440, 392, 349, 294, 262].forEach((f, i) => {
        osc(f, 'sawtooth', t + i * 0.1, 0.15, 0.08 - i * 0.01);
      });
      osc(110, 'sine', t + 0.5, 0.4, 0.1);
    },

    alarm() {
      init(); resume();
      const t = now();
      [880, 880, 880].forEach((f, i) => {
        osc(f, 'square', t + i * 0.22, 0.12, 0.12);
      });
    },

    save() {
      init(); resume();
      const t = now();
      osc(600, 'sine', t, 0.08, 0.08);
      osc(800, 'sine', t + 0.07, 0.1, 0.07);
    },

    error() {
      init(); resume();
      const t = now();
      osc(220, 'sawtooth', t, 0.12, 0.1);
      osc(196, 'sawtooth', t + 0.1, 0.12, 0.09);
    },

    weeklyReview() {
      init(); resume();
      // Special review sound — contemplative, not as intense
      const t = now();
      boom(t, 0.08);
      melody([262, 330, 392, 523, 659, 784], t, 0.14, 0.12, 'sine');
      shimmer(1568, t + 0.85, 0.06);
    },

    // Play rank sound based on rank letter
    forRank(rank) {
      const map = { S: this.rankS, A: this.rankA, B: this.rankB, C: this.rankC, D: this.rankD, E: this.rankD, F: () => {} };
      (map[rank] || (() => {})).call(this);
    }
  };

  return { ...Sounds, setEnabled, init, resume };
})();
