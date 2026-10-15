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
    var cv = $('canvas', box), cx = cv.getContext('2d'), W, Ht, M, dpr = Math.min(devicePixelRatio || 1, 2), t0 = 0, done = false;
    function size() { W = innerWidth; Ht = innerHeight; M = Math.min(W, Ht); cv.width = W * dpr; cv.height = Ht * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var OR = '#FF5A1F', YL = '#FFD60A', PA = '#F3EFE6', INK = '#0B0B0C';
    var DISP = '900 X Unbounded, "Arial Black", sans-serif', MONO = '500 X "JetBrains Mono", Menlo, monospace', SER = 'italic 400 X "Instrument Serif", Georgia, serif';
    var words = ['SCHILDERS', 'ELEKTRICIENS', 'LOODGIETERS', 'HOVENIERS', 'DAKDEKKERS', 'TEGELZETTERS', 'STUKADOORS', 'BOUWPLOEGEN'];
    function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function eo(t) { return 1 - Math.pow(1 - cl(t), 4); }
    function ebk(t) { t = cl(t); var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    // tekst die altijd binnen maxW past: lettergrootte schaalt mee met de breedte
    function fit(txt, tpl, maxW, maxPx) {
      cx.font = tpl.replace('X', maxPx + 'px'); var w = cx.measureText(txt).width;
      var px = w > maxW ? Math.floor(maxPx * maxW / w) : maxPx; cx.font = tpl.replace('X', px + 'px'); return px;
    }
    function finish() {
      if (done) return; done = true; box.classList.add('out'); H.classList.remove('lock');
      try { sessionStorage.setItem('kpIntro', '1'); } catch (e) {}
      goHero(); setTimeout(function () { box.hidden = true; }, 1000);
    }
    $('.skip', box).addEventListener('click', finish);
    box.addEventListener('click', function (e) { if (e.target === cv) finish(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
    function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    function hud(col) { // dunne kaderhoeken zoals een camera-zoeker
      var p = Math.max(14, M * .04), l = Math.max(14, M * .05); cx.strokeStyle = col; cx.lineWidth = 1.5; cx.globalAlpha = .6;
      [[p, p, 1, 1], [W - p, p, -1, 1], [p, Ht - p, 1, -1], [W - p, Ht - p, -1, -1]].forEach(function (c) { cx.beginPath(); cx.moveTo(c[0], c[1] + l * c[3]); cx.lineTo(c[0], c[1]); cx.lineTo(c[0] + l * c[2], c[1]); cx.stroke(); });
      cx.globalAlpha = 1;
    }
    var sparks = [], tiles = [];
    for (var n = 0; n < 24; n++) tiles.push({ d: Math.random() * .5 });
    var pad = function () { return Math.max(20, W * .07); };
    function frame(now) {
      if (done) return;
      if (!t0) { var hs = /introT=([\d.]+)/.exec(location.hash); t0 = now - (hs ? +hs[1] * 1000 : 0); }
      if (/introFreeze/.test(location.hash) && t0 && now - t0 > 0) t0 += 0;
      var t = (now - t0) / 1000, mw = W - pad() * 2;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000'; cx.fillRect(0, 0, W, Ht);
      // scène 1 (0-1.0s): meetlint schiet het beeld in
      if (t < 1.0) {
        var p = eo(t / .7), y = Ht / 2, bh = Math.max(22, M * .045);
        cx.fillStyle = YL; cx.fillRect(0, y - bh / 2, W * p, bh);
        cx.fillStyle = '#000';
        for (var x = 0, k = 0; x < W * p; x += 10, k++) cx.fillRect(x, y - bh / 2, 1.5, k % 10 === 0 ? bh * .7 : k % 5 === 0 ? bh * .45 : bh * .25);
        cx.globalAlpha = cl((t - .25) * 3); cx.fillStyle = PA;
        fit('DE KLUSPLOEG · REGIO UTRECHT', MONO, mw, Math.round(M * .03)); cx.fillText('DE KLUSPLOEG · REGIO UTRECHT', W / 2, y + bh * 1.6);
        cx.globalAlpha = 1; hud(YL);
      }
      // scène 2 (1.0-3.8s): vakken flitsen met harde cuts en een wipe
      else if (t < 3.8) {
        var dur = 2.8 / words.length, i = Math.min(words.length - 1, Math.floor((t - 1) / dur)), lt = ((t - 1) % dur) / dur, inv = i % 2 === 1;
        cx.fillStyle = inv ? OR : INK; cx.fillRect(0, 0, W, Ht);
        // wipe-balk die over het beeld trekt
        cx.fillStyle = inv ? INK : OR; cx.fillRect(-W * .2 + W * 1.4 * eo(lt), 0, W * .06, Ht);
        var px = fit(words[i], DISP, mw, Math.round(M * .2));
        cx.save(); cx.translate(W / 2, Ht / 2); var sc = 1 + lt * .05; cx.scale(sc, sc);
        cx.fillStyle = inv ? INK : PA; cx.fillText(words[i], 0, 0); cx.restore();
        cx.fillStyle = inv ? INK : OR; fit('MEERDERE PLOEGEN PER VAK', MONO, mw, Math.round(M * .026));
        cx.fillText('MEERDERE PLOEGEN PER VAK', W / 2, Ht / 2 + px * .9 + 10);
        cx.textAlign = 'left'; fit('0' + (i + 1) + ' / 24', MONO, mw, Math.round(M * .024)); cx.fillText(('0' + (i + 1)).slice(-2) + ' / 24', pad(), pad() + 6);
        cx.textAlign = 'center'; hud(inv ? INK : PA);
      }
      // scène 3 (3.8-4.9s): 24 tegels vullen het raster, één per vak
      else if (t < 4.9) {
        var s3 = t - 3.8, cols = W > Ht ? 8 : 4, rows = 24 / cols, gap = Math.max(6, M * .012);
        var gw = Math.min(W - pad() * 2, W * .62, (Ht * .42) * cols / rows), cw = (gw - gap * (cols - 1)) / cols, gx = (W - gw) / 2, gy = Ht / 2 - (cw * rows + gap * (rows - 1)) / 2 - M * .04;
        for (var q = 0; q < 24; q++) {
          var c = q % cols, r = Math.floor(q / cols), k3 = ebk((s3 - tiles[q].d * .6) / .35);
          if (k3 <= 0) continue;
          var cxp = gx + c * (cw + gap) + cw / 2, cyp = gy + r * (cw + gap) + cw / 2, ss = cw * k3;
          cx.fillStyle = q % 7 === 0 ? YL : q % 3 === 0 ? OR : '#1D1D21'; rr(cxp - ss / 2, cyp - ss / 2, ss, ss, ss * .18); cx.fill();
        }
        cx.globalAlpha = cl((s3 - .4) * 4); cx.fillStyle = PA;
        var py = gy + rows * (cw + gap) + M * .07;
        var vp = fit('24 VAKKEN', DISP, mw, Math.round(M * .1)); cx.fillText('24 VAKKEN', W / 2, py);
        cx.fillStyle = OR; var ap = fit('één aanspreekpunt', SER, mw, Math.round(M * .07)); cx.fillText('één aanspreekpunt', W / 2, py + vp * .75 + ap * .6);
        cx.globalAlpha = 1; hud(OR);
      }
      // scène 4 (4.9-7.0s): logo slaat in met vonken
      else if (t < 7.0) {
        var s = t - 4.9, kk = eo(s / .45), scl = 2.4 - 1.4 * kk, bsF = Math.min(M * .22, W * .3), LY = Ht / 2 - bsF * .8;
        if (!sparks.length) for (var m = 0; m < (W < 700 ? 90 : 170); m++) { var an = Math.random() * 6.28, v = (2 + Math.random() * 11) * M / 800; sparks.push({ x: W / 2, y: LY, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 3 * M / 800, l: 1 }); }
        if (s > .3) sparks.forEach(function (o) { o.x += o.vx; o.y += o.vy; o.vy += .3 * M / 800; o.vx *= .97; o.l -= .016; if (o.l > 0) { cx.fillStyle = o.l > .5 ? YL : OR; cx.globalAlpha = o.l; cx.fillRect(o.x, o.y, 2.5, 2.5); } });
        cx.globalAlpha = 1;
        // schokgolf-ring bij de inslag
        if (s > .35 && s < 1.1) { var rg = (s - .35) / .75; cx.strokeStyle = OR; cx.globalAlpha = 1 - rg; cx.lineWidth = 3; cx.beginPath(); cx.arc(W / 2, LY, M * .1 + rg * M * .5, 0, 6.28); cx.stroke(); cx.globalAlpha = 1; }
        var bs = bsF * scl; cx.save(); cx.translate(W / 2, LY);
        cx.fillStyle = OR; cx.shadowColor = OR; cx.shadowBlur = 60; rr(-bs / 2, -bs / 2, bs, bs, bs * .22); cx.fill(); cx.shadowBlur = 0;
        cx.fillStyle = INK; cx.font = DISP.replace('X', Math.round(bs * .4) + 'px'); cx.fillText('KP', 0, bs * .03); cx.restore();
        cx.globalAlpha = cl((s - .45) * 3); cx.fillStyle = PA;
        var lp = fit('DE KLUSPLOEG', DISP, mw, Math.round(M * .1)); var ly = Ht / 2 + bsF * .5 + lp * .3;
        cx.fillText('DE KLUSPLOEG', W / 2, ly);
        cx.globalAlpha = cl((s - .8) * 3); cx.fillStyle = OR;
        fit('vriendengroepen, elk vak', SER, mw, Math.round(M * .06)); cx.fillText('vriendengroepen, elk vak', W / 2, ly + lp * .6 + M * .05);
        cx.globalAlpha = 1; hud(OR);
      } else { finish(); return; }
      // voortgangsbalk onderin
      cx.fillStyle = OR; cx.fillRect(0, Ht - 3, W * cl(t / 7), 3);
      requestAnimationFrame(frame);
    }
    // wacht kort op de fonts zodat het filmpje meteen in de juiste letter start
    var go = function () { requestAnimationFrame(frame); };
    if (D.fonts && D.fonts.load) Promise.race([Promise.all([D.fonts.load('900 40px Unbounded'), D.fonts.load('500 20px "JetBrains Mono"'), D.fonts.load('italic 40px "Instrument Serif"')]), new Promise(function (r) { setTimeout(r, 900); })]).then(go, go);
    else go();
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
