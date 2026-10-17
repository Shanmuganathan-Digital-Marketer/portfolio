/* =========================================================
   Shanmuganathan S - Portfolio scripts
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  /* ---------- Theme (saved in localStorage when available) ---------- */
  function getSaved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem('theme', v); } catch (e) {} }
  var saved = getSaved();
  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    save(next);
  });

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Header shadow + active link ---------- */
  var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    var pos = window.scrollY + 140, current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Rotating hero line (edit the roles below) ---------- */
  var roles = ['Digital Marketer', 'E-Commerce Specialist', 'WordPress Developer'];
  var typedEl = document.getElementById('typed');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.Typed && !reduceMotion) {
    new Typed('#typed', { strings: roles, typeSpeed: 60, backSpeed: 35, backDelay: 1600, startDelay: 500, smartBackspace: false, loop: true });
  } else if (typedEl) {
    typedEl.textContent = roles[0];
  }

  /* ---------- AOS scroll animations ---------- */
  if (window.AOS) { AOS.init({ duration: 700, once: true, offset: 70, easing: 'ease-out-cubic' }); }

  /* ---------- Count-up numbers ---------- */
  var counters = document.querySelectorAll('.count');
  function runCounter(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(to * p) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-to') + (c.getAttribute('data-suffix') || ''); });
  }

  /* ---------- Contact form (opens the visitor's email app) ----------
     To receive messages without an email app, point the form at a
     service such as Formspree or Web3Forms (see README). */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var TO_EMAIL = 'shanmuganathan251102@gmail.com';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    var subject = form.subject.value.trim() || 'Portfolio enquiry from ' + name;
    [form.name, form.email, form.message].forEach(function (f) { f.classList.remove('invalid'); });
    var bad = [];
    if (!name) bad.push(form.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(form.email);
    if (!msg) bad.push(form.message);
    if (bad.length) {
      bad.forEach(function (f) { f.classList.add('invalid'); });
      note.className = 'form-note error';
      note.textContent = 'Please fill in your name, a valid email and a message.';
      bad[0].focus();
      return;
    }
    var body = msg + '\n\n- ' + name + ' (' + email + ')';
    window.location.href = 'mailto:' + TO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.className = 'form-note ok';
    note.textContent = 'Opening your email app. If nothing opens, write to ' + TO_EMAIL + '.';
    form.reset();
  });

  /* ---------- Footer year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
