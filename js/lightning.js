/* =========================================================
   Lightning strikes in the hero (canvas).
   - A bolt strikes every few seconds; click the hero to call one down.
   - Pauses when the hero is off screen or the tab is hidden.
   - Does nothing if the visitor prefers reduced motion.
   Tweak: MIN_GAP / MAX_GAP (seconds between strikes), COLOR_* below.
   ========================================================= */
(function () {
  'use strict';

  var hero = document.getElementById('home');
  var canvas = document.getElementById('storm');
  if (!hero || !canvas || !canvas.getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

  var MIN_GAP = 4.5, MAX_GAP = 4.5;             // seconds between automatic strikes (4.5 = every 4.5s)
  var THOR_MS = 1000;                           // how long the Thor costume shows per strike
  var COLOR_GLOW = 'rgba(56,189,248,';          // electric blue
  var COLOR_CORE = 'rgba(240,250,255,';         // white-hot core

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var bolts = [];          // active bolts
  var flash = 0;           // screen flash 0..1
  var thorTimer = 0, running = false, visible = true, rafId = 0, nextStrike = 0, last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* midpoint-displacement zig-zag between two points */
  function path(x1, y1, x2, y2, disp, out) {
    if (disp < 4) { out.push([x2, y2]); return; }
    var mx = (x1 + x2) / 2 + (Math.random() - 0.5) * disp;
    var my = (y1 + y2) / 2 + (Math.random() - 0.5) * disp * 0.35;
    path(x1, y1, mx, my, disp / 2, out);
    path(mx, my, x2, y2, disp / 2, out);
  }

  function makeBolt(x) {
    var startX = x, startY = -10;
    var endX = x + (Math.random() - 0.5) * W * 0.28;
    var endY = H * (0.42 + Math.random() * 0.45);
    var main = [[startX, startY]];
    path(startX, startY, endX, endY, H * 0.34, main);
    var branches = [];
    for (var i = 4; i < main.length - 3; i++) {
      if (Math.random() < 0.13) {
        var p = main[i], dir = Math.random() < 0.5 ? -1 : 1;
        var bx = p[0] + dir * (60 + Math.random() * 160), by = p[1] + 60 + Math.random() * 150;
        var seg = [[p[0], p[1]]];
        path(p[0], p[1], bx, by, 70, seg);
        branches.push(seg);
      }
    }
    return { main: main, branches: branches, born: performance.now(), life: 650 + Math.random() * 250 };
  }

  function strike(x) {
    if (typeof x !== 'number') x = W * (0.08 + Math.random() * 0.84);
    bolts.push(makeBolt(x));
    flash = 1;
    hero.classList.add('strike');
    setTimeout(function () { hero.classList.remove('strike'); }, 380);
    hero.classList.add('thor');
    clearTimeout(thorTimer);
    thorTimer = setTimeout(function () { hero.classList.remove('thor'); }, THOR_MS);
    /* sometimes a quick second strike */
    if (MIN_GAP !== MAX_GAP && Math.random() < 0.35) setTimeout(function () { if (running) { bolts.push(makeBolt(x + (Math.random() - 0.5) * 220)); flash = Math.max(flash, 0.7); } }, 140);
  }

  function stroke(points, width, color) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke();
  }

  function drawBolt(b, now) {
    var t = (now - b.born) / b.life;
    if (t >= 1) return false;
    /* flicker: bright, dip, bright, fade */
    var a = t < 0.12 ? 1 : t < 0.22 ? 0.25 : t < 0.36 ? 0.95 : t < 0.46 ? 0.35 : Math.max(0, 0.7 * (1 - (t - 0.46) / 0.54));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.shadowColor = COLOR_GLOW + '1)'; ctx.shadowBlur = 28;
    stroke(b.main, 7, COLOR_GLOW + (0.35 * a) + ')');
    b.branches.forEach(function (br) { stroke(br, 3.5, COLOR_GLOW + (0.3 * a) + ')'); });
    ctx.shadowBlur = 12;
    stroke(b.main, 2.6, COLOR_CORE + a + ')');
    b.branches.forEach(function (br) { stroke(br, 1.3, COLOR_CORE + (0.85 * a) + ')'); });
    ctx.shadowBlur = 0;
    return true;
  }

  function frame(now) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    if (flash > 0.01) {
      var g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H));
      g.addColorStop(0, 'rgba(170,215,255,' + (0.20 * flash) + ')');
      g.addColorStop(1, 'rgba(56,120,220,' + (0.04 * flash) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      flash *= 0.9;
    }
    bolts = bolts.filter(function (b) { return drawBolt(b, now); });
    if (now >= nextStrike) { strike(); nextStrike = now + (MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP)) * 1000; }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible || document.hidden) return;
    running = true;
    if (!nextStrike || nextStrike < performance.now()) nextStrike = performance.now() + 1200;
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; hero.classList.remove('thor', 'strike'); cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); bolts = []; flash = 0; }

  resize();
  window.addEventListener('resize', function () { resize(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.05 }).observe(hero);
  }
  /* click or tap the hero (not buttons/links) to call down a bolt */
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    var r = hero.getBoundingClientRect();
    if (running) strike(e.clientX - r.left);
  });
  start();
})();
