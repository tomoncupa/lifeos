/* ============================================================
   SYSTEM OS — DESKTOP PANEL MANAGER
   Draggable, resizable floating panels (manhwa OS style)
   ============================================================ */

const DesktopOS = (() => {
  let panels = {};
  let zCounter = 10;
  let clockInterval = null;

  const PANEL_CONFIGS = [
    { id: 'daily', title: 'DAILY QUESTS', icon: '⚔', defaultPos: { x: 20, y: 20, w: 380, h: 500 } },
    { id: 'quests', title: 'QUEST LOG', icon: '📜', defaultPos: { x: 420, y: 20, w: 360, h: 500 } },
    { id: 'training', title: 'TRAINING', icon: '💪', defaultPos: { x: 800, y: 20, w: 400, h: 550 } },
    { id: 'nutrition', title: 'NUTRITION', icon: '🍖', defaultPos: { x: 20, y: 540, w: 380, h: 420 } },
    { id: 'journal', title: 'JOURNAL', icon: '📓', defaultPos: { x: 420, y: 540, w: 360, h: 420 } },
    { id: 'settings', title: 'SETTINGS', icon: '⚙', defaultPos: { x: 800, y: 590, w: 360, h: 370 } },
  ];

  function init() {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    // Load panel positions from storage
    const saved = JSON.parse(localStorage.getItem('systemos_panels') || '{}');

    PANEL_CONFIGS.forEach(config => {
      const pos = saved[config.id] || config.defaultPos;
      createPanel(config, pos);
    });

    renderTaskbar();
    updateDesktopTopbar();
  }

  function updateClock() {
    const el = document.getElementById('desktop-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  }

  function updateDesktopTopbar() {
    const rank = autoRank(getDay(todayKey()));
    const streak = calculateStreak();
    const el = document.getElementById('desktop-rank');
    if (el) { el.textContent = rank; el.className = 'desktop-rank c-' + rank.toLowerCase(); }
    const sel = document.getElementById('desktop-streak');
    if (sel) sel.textContent = `🔥 ${streak}`;
    const name = document.getElementById('desktop-name-label');
    if (name) name.textContent = state.settings.name || 'SYSTEM OS';
  }

  function createPanel(config, pos) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'panel-' + config.id;
    panel.style.cssText = `left:${pos.x}px;top:${pos.y}px;width:${pos.w}px;height:${pos.h}px;z-index:${zCounter++};`;

    panel.innerHTML = `
      <div class="panel-titlebar" data-panel="${config.id}">
        <div class="panel-dots">
          <div class="panel-dot close" onclick="DesktopOS.closePanel('${config.id}')"></div>
          <div class="panel-dot min" onclick="DesktopOS.minimizePanel('${config.id}')"></div>
          <div class="panel-dot max" onclick="DesktopOS.maximizePanel('${config.id}')"></div>
        </div>
        <div class="panel-title">${config.icon} ${config.title}</div>
      </div>
      <div class="panel-body" id="panel-body-${config.id}"></div>
      <div class="panel-resize" data-panel="${config.id}"></div>`;

    document.getElementById('desktop-canvas').appendChild(panel);
    panels[config.id] = { el: panel, config, pos: { ...pos }, minimized: false, maximized: false };

    makeDraggable(panel, panel.querySelector('.panel-titlebar'));
    makeResizable(panel, panel.querySelector('.panel-resize'));

    panel.addEventListener('mousedown', () => focusPanel(config.id));

    // Render section content into panel body
    const body = panel.querySelector('.panel-body');
    const src = document.getElementById('section-' + config.id);
    if (src) {
      body.innerHTML = src.innerHTML;
    }
  }

  function focusPanel(id) {
    if (!panels[id]) return;
    panels[id].el.style.zIndex = ++zCounter;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('focused'));
    panels[id].el.classList.add('focused');
    document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active-panel'));
    const btn = document.getElementById('taskbar-' + id);
    if (btn) btn.classList.add('active-panel');
  }

  function closePanel(id) {
    if (!panels[id]) return;
    panels[id].el.style.display = 'none';
    const btn = document.getElementById('taskbar-' + id);
    if (btn) btn.classList.remove('active-panel');
  }

  function minimizePanel(id) {
    if (!panels[id]) return;
    const p = panels[id];
    if (!p.minimized) {
      p._savedHeight = p.el.style.height;
      p.el.style.height = '32px';
      p.el.style.overflow = 'hidden';
      p.minimized = true;
    } else {
      p.el.style.height = p._savedHeight || '400px';
      p.el.style.overflow = '';
      p.minimized = false;
    }
  }

  function maximizePanel(id) {
    if (!panels[id]) return;
    const p = panels[id];
    if (!p.maximized) {
      p._savedPos = { left: p.el.style.left, top: p.el.style.top, width: p.el.style.width, height: p.el.style.height };
      p.el.style.cssText += ';left:0;top:0;width:100%;height:calc(100% - 76px);border-radius:0;';
      p.maximized = true;
    } else {
      Object.assign(p.el.style, p._savedPos);
      p.el.style.borderRadius = '';
      p.maximized = false;
    }
  }

  function showPanel(id) {
    if (!panels[id]) return;
    panels[id].el.style.display = '';
    focusPanel(id);
  }

  function renderTaskbar() {
    const bar = document.getElementById('desktop-taskbar');
    if (!bar) return;
    bar.innerHTML = '';
    PANEL_CONFIGS.forEach(config => {
      const btn = document.createElement('button');
      btn.className = 'taskbar-btn';
      btn.id = 'taskbar-' + config.id;
      btn.textContent = config.icon + ' ' + config.title;
      btn.onclick = () => {
        if (panels[config.id]?.el.style.display === 'none') showPanel(config.id);
        else focusPanel(config.id);
      };
      bar.appendChild(btn);
    });

    // Layout toggle
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'taskbar-btn';
    mobileBtn.style.marginLeft = 'auto';
    mobileBtn.textContent = '📱 MOBILE';
    mobileBtn.onclick = () => switchLayout('mobile');
    bar.appendChild(mobileBtn);
  }

  function makeDraggable(panel, handle) {
    let dragging = false, startX, startY, startL, startT;
    handle.addEventListener('mousedown', e => {
      if (e.target.classList.contains('panel-dot')) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startL = parseInt(panel.style.left) || 0;
      startT = parseInt(panel.style.top) || 0;
      panel.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      panel.style.left = Math.max(0, startL + e.clientX - startX) + 'px';
      panel.style.top = Math.max(0, startT + e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; panel.classList.remove('dragging'); savePanelPositions(); }
    });

    // Touch drag
    handle.addEventListener('touchstart', e => {
      if (e.target.classList.contains('panel-dot')) return;
      dragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      startL = parseInt(panel.style.left) || 0;
      startT = parseInt(panel.style.top) || 0;
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (!dragging) return;
      panel.style.left = Math.max(0, startL + e.touches[0].clientX - startX) + 'px';
      panel.style.top = Math.max(0, startT + e.touches[0].clientY - startY) + 'px';
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (dragging) { dragging = false; savePanelPositions(); }
    });
  }

  function makeResizable(panel, handle) {
    let resizing = false, startX, startY, startW, startH;
    handle.addEventListener('mousedown', e => {
      resizing = true;
      startX = e.clientX; startY = e.clientY;
      startW = panel.offsetWidth; startH = panel.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      panel.style.width = Math.max(240, startW + e.clientX - startX) + 'px';
      panel.style.height = Math.max(160, startH + e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (resizing) { resizing = false; savePanelPositions(); }
    });
  }

  function savePanelPositions() {
    const saved = {};
    Object.entries(panels).forEach(([id, p]) => {
      saved[id] = {
        x: parseInt(p.el.style.left) || 0,
        y: parseInt(p.el.style.top) || 0,
        w: p.el.offsetWidth,
        h: p.el.offsetHeight
      };
    });
    localStorage.setItem('systemos_panels', JSON.stringify(saved));
  }

  function destroy() {
    if (clockInterval) clearInterval(clockInterval);
    const canvas = document.getElementById('desktop-canvas');
    if (canvas) canvas.innerHTML = '';
    panels = {};
  }

  return { init, destroy, closePanel, minimizePanel, maximizePanel, showPanel, updateDesktopTopbar };
})();

function switchLayout(mode) {
  const isMobile = mode === 'mobile';
  document.body.classList.toggle('desktop-mode', !isMobile);
  state.settings.showDesktop = !isMobile;
  saveState();
  if (!isMobile) {
    DesktopOS.init();
  } else {
    DesktopOS.destroy();
  }
}
