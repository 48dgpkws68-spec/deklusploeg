/* De Klusploeg: intro-film, bouwvonken, reveals, tilt, magnet, tellers, matcher */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = document, H = D.documentElement;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }

  // ---------- intro film (alleen home, 1x per sessie) ----------
  var box = $('.intro');
  function goHero() { D.body.classList.add('go'); }
  if (box) {
    var seen = false; try { seen = sessionStorage.getItem('kpIntro') === '1'; } catch (e) {}
    if (RM || seen) { box.hidden = true; goHero(); }
    else { H.classList.add('lock'); playIntro(); }
  } else goHero();

  function playIntro() {
    var cv = $('canvas', box), cx = cv.getContext('2d'), W, Ht, M, dpr = Math.min(devicePixelRatio || 1, 2), t0 = performance.now(), done = false;
    function size() { W = innerWidth; Ht = innerHeight; M = Math.min(W, Ht); cv.width = W * dpr; cv.height = Ht * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var OR = '#FF5A1F', YL = '#FFD60A', PA = '#F3EFE6';
    var words = ['SCHILDER', 'ELEKTRICIEN', 'BOUWVAKKER', 'GEVELREINIGER', 'LOODGIETER', 'VOCHTSPECIALIST'];
    function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function eo(t) { return 1 - Math.pow(1 - cl(t), 4); }
    function finish() {
      if (done) return; done = true; box.classList.add('out'); H.classList.remove('lock');
      try { sessionStorage.setItem('kpIntro', '1'); } catch (e) {}
      goHero(); setTimeout(function () { box.hidden = true; }, 1000);
    }
    $('.skip', box).addEventListener('click', finish);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
    D.fonts && D.fonts.load('900 40px Unbounded');
    var sparks = [];
    function frame(now) {
      if (done) return;
      var t = (now - t0) / 1000;
      cx.fillStyle = '#000'; cx.fillRect(0, 0, W, Ht);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      // scène 1 (0-1.1s): meetlint schiet over het scherm
      if (t < 1.1) {
        var p = eo(t / .9), y = Ht / 2;
        cx.fillStyle = YL; cx.fillRect(0, y - 14, W * p, 28);
        cx.fillStyle = '#000';
        for (var x = 0; x < W * p; x += 12) { var h = (x / 12) % 10 === 0 ? 16 : (x / 12) % 5 === 0 ? 11 : 6; cx.fillRect(x, y - 14, 1.5, h); }
        cx.font = '500 ' + Math.round(M * .022) + 'px "JetBrains Mono", monospace'; cx.fillStyle = PA; cx.globalAlpha = cl(t * 2);
        cx.fillText('DE KLUSPLOEG · REGIO UTRECHT · 2026', W / 2, y + 50); cx.globalAlpha = 1;
      }
      // scène 2 (1.1-3.5s): vakken flitsen, harde cuts
      else if (t < 3.5) {
        var i = Math.min(words.length - 1, Math.floor((t - 1.1) / .4)), lt = ((t - 1.1) % .4) / .4;
        var inv = i % 2 === 1;
        cx.fillStyle = inv ? OR : '#000'; cx.fillRect(0, 0, W, Ht);
        var fs = Math.min(W / (words[i].length * .78), M * .2);
        cx.font = '900 ' + Math.round(fs) + 'px Unbounded, "Arial Black", sans-serif';
        cx.fillStyle = inv ? '#000' : PA; cx.save(); cx.translate(W / 2, Ht / 2); cx.scale(1 + lt * .06, 1 + lt * .06); cx.fillText(words[i], 0, 0); cx.restore();
        cx.font = '500 ' + Math.round(M * .02) + 'px "JetBrains Mono", monospace'; cx.fillStyle = inv ? '#000' : OR;
        cx.fillText('0' + (i + 1) + ' / 06', W / 2, Ht / 2 + fs * .8);
      }
      // scène 3 (3.5-5.6s): logo slaat in met vonken
      else if (t < 5.6) {
        var s = t - 3.5, k = eo(s / .45), sc = 2.6 - 1.6 * k;
        if (s < .05) for (var n = 0; n < 160; n++) { var a = Math.random() * 6.28, v = 2 + Math.random() * 12; sparks.push({ x: W / 2, y: Ht / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, l: 1 }); }
        sparks.forEach(function (q) { q.x += q.vx; q.y += q.vy; q.vy += .35; q.vx *= .97; q.l -= .015; if (q.l > 0) { cx.fillStyle = q.l > .5 ? YL : OR; cx.globalAlpha = q.l; cx.fillRect(q.x, q.y, 2.5, 2.5); } });
        cx.globalAlpha = 1;
        var bs = M * .22 * sc; cx.save(); cx.translate(W / 2, Ht / 2 - M * .08);
        cx.fillStyle = OR; cx.shadowColor = OR; cx.shadowBlur = 60; roundRect(-bs / 2, -bs / 2, bs, bs, bs * .22); cx.fill(); cx.shadowBlur = 0;
        cx.fillStyle = '#000'; cx.font = '900 ' + Math.round(bs * .4) + 'px Unbounded, sans-serif'; cx.fillText('KP', 0, bs * .02); cx.restore();
        cx.globalAlpha = cl((s - .4) * 3); cx.fillStyle = PA; cx.font = '900 ' + Math.round(Math.min(M * .09, W * .08)) + 'px Unbounded, sans-serif';
        cx.fillText('DE KLUSPLOEG', W / 2, Ht / 2 + M * .14);
        cx.font = 'italic 400 ' + Math.round(M * .05) + 'px "Instrument Serif", serif'; cx.fillStyle = OR;
        cx.globalAlpha = cl((s - .8) * 3); cx.fillText('vriendengroepen, elk vak', W / 2, Ht / 2 + M * .24); cx.globalAlpha = 1;
      } else { finish(); return; }
      requestAnimationFrame(frame);
    }
    function roundRect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    requestAnimationFrame(frame);
  }

  // ---------- nav ----------
  var nav = $('.nav'), lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY; if (nav) nav.classList.toggle('hide', y > 300 && y > lastY && !D.body.classList.contains('mopen')); lastY = y;
    H.style.setProperty('--p', y / Math.max(1, H.scrollHeight - innerHeight));
  }, { passive: true });
  var bg = $('.burger'); if (bg) bg.addEventListener('click', function () { D.body.classList.toggle('mopen'); });

  // ---------- hero: bouwvonken/stofdeeltjes + blauwdrukpunten ----------
  $$('.hero-field').forEach(function (cv) {
    if (RM) return;
    var cx = cv.getContext('2d'), W, Ht, dpr = Math.min(devicePixelRatio || 1, 2), ps = [], mx = -999, my = -999, vis = true;
    var col = getComputedStyle(cv.parentElement).getPropertyValue('--c').trim() || '#FF5A1F';
    function size() { W = cv.clientWidth; Ht = cv.clientHeight; cv.width = W * dpr; cv.height = Ht * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var N = innerWidth < 700 ? 50 : 120;
    for (var i = 0; i < N; i++) ps.push({ x: Math.random(), y: Math.random(), v: .0004 + Math.random() * .0016, r: .5 + Math.random() * 1.8, w: Math.random() * 6.28, hot: Math.random() < .25 });
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(cv);
    (function loop() {
      requestAnimationFrame(loop); if (!vis) return;
      cx.clearRect(0, 0, W, Ht);
      for (var i = 0; i < ps.length; i++) {
        var q = ps[i]; q.y -= q.v; q.w += .015; if (q.y < -.05) { q.y = 1.05; q.x = Math.random(); }
        var px = q.x * W + Math.sin(q.w) * 14, py = q.y * Ht, dx = px - mx, dy = py - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) { px += dx / d * (140 - d) * .5; py += dy / d * (140 - d) * .5; }
        cx.globalAlpha = (q.hot ? .9 : .35) * Math.min(1, q.y * 2);
        cx.fillStyle = q.hot ? col : '#F3EFE6'; cx.beginPath(); cx.arc(px, py, q.r, 0, 6.28); cx.fill();
        if (q.hot) { cx.globalAlpha *= .25; cx.beginPath(); cx.arc(px, py, q.r * 4, 0, 6.28); cx.fill(); }
      }
      // lijnen tussen nabije deeltjes rond de muis: blauwdruk-effect
      cx.strokeStyle = col; cx.lineWidth = .6;
      for (i = 0; i < ps.length; i++) {
        var a = ps[i], ax = a.x * W, ay = a.y * Ht; if (Math.abs(ax - mx) > 200 || Math.abs(ay - my) > 200) continue;
        for (var j = i + 1; j < ps.length; j++) { var b = ps[j], bx = b.x * W, by = b.y * Ht, dd = Math.hypot(ax - bx, ay - by); if (dd < 110) { cx.globalAlpha = (1 - dd / 110) * .5; cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx, by); cx.stroke(); } }
      }
      cx.globalAlpha = 1;
    })();
  });

  // ---------- roterend vak in kop ----------
  var rot = $$('.rot b');
  if (rot.length) { var ri = 0; rot[0].classList.add('on'); if (!RM) setInterval(function () { rot[ri].classList.remove('on'); rot[ri].classList.add('out'); var p = rot[ri]; setTimeout(function () { p.classList.remove('out'); }, 700); ri = (ri + 1) % rot.length; rot[ri].classList.add('on'); }, 2000); }

  // ---------- reveals + tellers ----------
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
      var c = $('.count', e.target) || (e.target.classList.contains('count') ? e.target : null);
      if (c) { var to = +c.dataset.to, s = performance.now(); (function tick(n) { var p = Math.min(1, (n - s) / 1600); c.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(s); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });

  // ---------- stappenlijn vult bij scrollen ----------
  var sl = $('.steps-line');
  if (sl) addEventListener('scroll', function () { var r = sl.parentElement.getBoundingClientRect(); sl.style.setProperty('--sp', Math.max(0, Math.min(1, (innerHeight * .8 - r.top) / (r.height + innerHeight * .3)))); }, { passive: true });

  // ---------- parallax ----------
  var px = $$('.parallax');
  if (px.length && !RM) addEventListener('scroll', function () { px.forEach(function (el) { el.style.transform = 'translateY(' + scrollY * (+el.dataset.speed) + 'px)'; }); }, { passive: true });

  // ---------- tilt + glow-spot ----------
  if (!RM && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(900px) rotateX(' + (.5 - y) * 8 + 'deg) rotateY(' + (x - .5) * 10 + 'deg) translateY(-4px)';
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('.magnet').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .2 + 'px,' + (e.clientY - r.top - r.height / 2) * .3 + 'px)'; });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    var cur = $('.cursor');
    if (cur) {
      addEventListener('pointermove', function (e) { cur.classList.add('on'); cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });
      D.addEventListener('pointerover', function (e) { cur.classList.toggle('big', !!e.target.closest('a,button,label,summary')); });
    }
  }

  // ---------- klusmatcher ----------
  var m = $('.matcher');
  if (m) {
    var V = JSON.parse(m.dataset.vakken), who = $('.m-who b', m), pr = $('.m-price', m), go = $('.m-go', m);
    $$('.m-opts button', m).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.m-opts button', m).forEach(function (x) { x.classList.toggle('on', x === b); });
        var v = V.filter(function (x) { return x.s === b.dataset.v; })[0];
        who.style.opacity = 0;
        setTimeout(function () { who.textContent = v.w + ' pakken het op'; who.style.opacity = 1; }, 180);
        m.style.setProperty('--mc', v.c); pr.textContent = v.n + ' · ' + v.p; go.href = '/offerte/?vak=' + v.s;
      });
    });
  }

  // ---------- offerteformulier: vak uit url voorselecteren ----------
  var q = new URLSearchParams(location.search).get('vak');
  if (q) $$('.chip input').forEach(function (i) { var map = {}; $$('.chip input').forEach(function (x) { map[x.dataset.s] = x.value; }); if (i.value === map[q]) i.checked = true; });
  $$('.file input').forEach(function (f) { f.addEventListener('change', function () { $('span', f.parentElement).firstChild.textContent = '📷 ' + f.files.length + ' foto(s) gekozen '; }); });
})();
