/* ============================================================
   Shared prototype engine — used by both Retail App and CMS.
   Handles screen show/hide, top-bar frame label, history for
   Back buttons, and the flow-map overlay.
   ============================================================ */

(function () {
  const screens = Array.from(document.querySelectorAll('.screen'));
  const frameIdEl = document.getElementById('frameId');
  const history = [];

  // Map of screen id -> human label + frame code (read from data attrs)
  function meta(id) {
    const el = document.getElementById(id);
    return {
      label: el ? el.dataset.label || id : id,
      code: el ? el.dataset.code || '' : ''
    };
  }

  function showScreen(id, opts) {
    opts = opts || {};
    const target = document.getElementById(id);
    if (!target) return;

    // push current onto history unless this is a back/replace move
    const current = document.querySelector('.screen.active');
    if (current && current.id !== id && !opts.back && !opts.replace) {
      history.push(current.id);
    }

    screens.forEach(s => s.classList.remove('active'));
    target.classList.add('active');

    // update top bar frame id
    const m = meta(id);
    if (frameIdEl) frameIdEl.textContent = m.code ? m.code + '  ·  ' + m.label : m.label;

    // sync CMS sidebar current state, if present
    document.querySelectorAll('[data-nav-for]').forEach(a => {
      a.classList.toggle('current', a.dataset.navFor === id);
    });

    // scroll device screen to top
    const scroller = target.closest('.device-screen');
    if (scroller) scroller.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // fire optional per-screen hook (e.g. idle loop, sku detection)
    if (typeof window.onScreenEnter === 'function') window.onScreenEnter(id);
  }

  function goBack() {
    const prev = history.pop();
    if (prev) showScreen(prev, { back: true });
  }

  // Expose for inline handlers
  window.showScreen = showScreen;
  window.goBack = goBack;

  // ---- Flow overlay ----
  const overlay = document.getElementById('flowOverlay');
  const flowBtn = document.getElementById('flowBtn');
  if (flowBtn && overlay) {
    flowBtn.addEventListener('click', () => overlay.classList.add('open'));
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.classList.contains('close-x')) {
        overlay.classList.remove('open');
      }
    });
    overlay.querySelectorAll('[data-goto]').forEach(li => {
      li.addEventListener('click', () => {
        showScreen(li.dataset.goto);
        overlay.classList.remove('open');
      });
    });
  }

  // Keyboard: Esc closes overlay
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay) overlay.classList.remove('open');
  });

  // Initialise: activate the first screen marked data-start, else the first screen
  const start = document.querySelector('.screen[data-start]') || screens[0];
  if (start) showScreen(start.id, { replace: true });
})();
