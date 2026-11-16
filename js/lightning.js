/* =========================================================
   Lightning strikes in the hero (canvas) + eye glow.
   - Light on the CPU: the canvas only animates during a strike, never idle.
   - A bolt strikes every GAP seconds; click the hero to call one down.
   - Bolts are hidden behind your photo (the photo's shape is cut out of the canvas).
   - Pauses when the hero is off screen or the tab is hidden.
   - Does nothing if the visitor prefers reduced motion.
   Tweak: GAP (seconds between strikes), THOR_MS (eye glow time), COLOR_*.
   ========================================================= */
(function () {
  'use strict';

  var hero = document.getElementById('home');
  var canvas = document.getElementById('storm');
  var photo = hero && hero.querySelector('.p-pro');
  if (!hero || !canvas || !canvas.getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

  var GAP = 4.5;                                // seconds between automatic strikes
  var THOR_MS = 1000;                           // how long the eyes glow per strike
  var COLOR_GLOW = 'rgba(56,189,248,';          // electric blue
  var COLOR_CORE = 'rgba(240,250,255,';         // white-hot core

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0;
  var bolts = [], flash = 0, drawing = false, rafId = 0;
  var visible = true, strikeTimer = 0, thorTimer = 0, stripTimer = 0;

  function resize() {
    var dpr = window.innerWidth < 821 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* midpoint-displacement zig-zag between two points */
  function path(x1, y1, x2, y2, disp, out) {
    if (disp < 5) { out.push([x2, y2]); return; }
    var mx = (x1 + x2) / 2 + (Math.random() - 0.5) * disp;
    var my = (y1 + y2) / 2 + (Math.random() - 0.5) * disp * 0.35;
    path(x1, y1, mx, my, disp / 2, out);
    path(mx, my, x2, y2, disp / 2, out);
  }

  function makeBolt(x) {
    var endX = x + (Math.random() - 0.5) * W * 0.28;
    var endY = H * (0.42 + Math.random() * 0.45);
    var main = [[x, -10]];
    path(x, -10, endX, endY, H * 0.34, main);
    var branches = [];
    for (var i = 4; i < main.length - 3; i++) {
      if (Math.random() < 0.12) {
        var p = main[i], dir = Math.random() < 0.5 ? -1 : 1;
        var seg = [[p[0], p[1]]];
        path(p[0], p[1], p[0] + dir * (60 + Math.random() * 140), p[1] + 60 + Math.random() * 130, 70, seg);
        branches.push(seg);
      }
    }
    return { main: main, branches: branches, born: performance.now(), life: 650 + Math.random() * 200 };
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
    var a = t < 0.12 ? 1 : t < 0.22 ? 0.25 : t < 0.36 ? 0.95 : t < 0.46 ? 0.35 : Math.max(0, 0.7 * (1 - (t - 0.46) / 0.54));
    /* soft glow = two wide faint strokes (cheap), then the white core */
    stroke(b.main, 14, COLOR_GLOW + (0.12 * a) + ')');
    stroke(b.main, 6, COLOR_GLOW + (0.3 * a) + ')');
    b.branches.forEach(function (br) { stroke(br, 4, COLOR_GLOW + (0.25 * a) + ')'); });
    stroke(b.main, 2.4, COLOR_CORE + a + ')');
    b.branches.forEach(function (br) { stroke(br, 1.2, COLOR_CORE + (0.85 * a) + ')'); });
    return true;
  }

  /* hide the bolts wherever your photo is, so lightning never crosses your suit */
  function cutOutPhoto() {
    if (!photo || !photo.complete || !photo.naturalWidth) return;
    var hr = hero.getBoundingClientRect(), pr = photo.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(photo, pr.left - hr.left, pr.top - hr.top, pr.width, pr.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    if (flash > 0.02) {
      var g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H));
      g.addColorStop(0, 'rgba(170,215,255,' + (0.18 * flash) + ')');
      g.addColorStop(1, 'rgba(56,120,220,' + (0.03 * flash) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      flash *= 0.9;
    }
    bolts = bolts.filter(function (b) { return drawBolt(b, now); });
    cutOutPhoto();
    if (bolts.length || flash > 0.02) { rafId = requestAnimationFrame(frame); }
    else { drawing = false; ctx.clearRect(0, 0, W, H); }
  }

  function strike(x) {
    if (typeof x !== 'number') x = W * (0.08 + Math.random() * 0.84);
    bolts.push(makeBolt(x));
    flash = 1;
    hero.classList.add('strike', 'thor');
    clearTimeout(stripTimer); stripTimer = setTimeout(function () { hero.classList.remove('strike'); }, 380);
    clearTimeout(thorTimer); thorTimer = setTimeout(function () { hero.classList.remove('thor'); }, THOR_MS);
    if (!drawing) { drawing = true; rafId = requestAnimationFrame(frame); }
  }

  function schedule(ms) {
    clearTimeout(strikeTimer);
    strikeTimer = setTimeout(function () {
      if (visible && !document.hidden) strike();
      schedule(GAP * 1000);
    }, ms);
  }
  function stop() {
    clearTimeout(strikeTimer); cancelAnimationFrame(rafId); drawing = false;
    bolts = []; flash = 0; ctx.clearRect(0, 0, W, H); hero.classList.remove('thor', 'strike');
  }
  function start() { if (visible && !document.hidden) schedule(1200); }

  resize();
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.05 }).observe(hero);
  }
  /* click or tap the hero (not buttons/links) to call down a bolt */
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    strike(e.clientX - hero.getBoundingClientRect().left);
  });
  start();
})();
