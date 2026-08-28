/* Territorio — the wordmark drifts across the hero and bounces off the edges,
   DVD-screensaver style. Every bounce swaps the block shape behind it.
   Holds still for anyone who has asked for reduced motion. */
(function () {
  var hero  = document.getElementById('hero');
  var mark  = document.getElementById('hero-mark');
  var shape = document.getElementById('hero-shape');
  if (!hero || !mark || !shape) return;

  var SHAPES = ['shape--a', 'shape--b', 'shape--c'];
  var COLORS = ['--orange', '--blue', '--green', '--pink', '--yellow'];
  var si = 1, ci = 0;                 // matches the markup's starting state

  var SPEED = 150;                    // px per second, recalculated per viewport in measure()
  var x = 0, y = 0, vx = 1, vy = 1, w = 0, h = 0, bw = 0, bh = 0;
  var last = 0, raf = null, running = false;

  var foot = hero.querySelector('.hero__foot');

  function measure() {
    var r = hero.getBoundingClientRect();
    bw = r.width;
    // the travel box stops just above the tagline, so the wordmark never lands on it
    bh = foot ? (foot.getBoundingClientRect().top - r.top - 20) : r.height;
    w = mark.offsetWidth; h = mark.offsetHeight;
    // wider screens mean a longer crossing, so scale the speed to keep the pace even
    SPEED = Math.max(75, Math.min(bw * 0.115, 200));
    x = Math.min(Math.max(x, 0), Math.max(bw - w, 0));
    y = Math.min(Math.max(y, 0), Math.max(bh - h, 0));
  }

  function nextShape() {
    shape.classList.remove(SHAPES[si]);
    si = (si + 1) % SHAPES.length;
    ci = (ci + 1) % COLORS.length;
    shape.classList.add(SHAPES[si]);
    shape.style.setProperty('--accent', 'var(' + COLORS[ci] + ')');
  }

  function draw() { mark.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; }

  function frame(t) {
    if (!running) return;
    if (!last) last = t;
    var dt = Math.min((t - last) / 1000, 0.05);   // cap after a background tab
    last = t;

    x += vx * SPEED * dt;
    y += vy * SPEED * dt;

    var maxX = Math.max(bw - w, 0), maxY = Math.max(bh - h, 0), hit = false;
    if (x <= 0)    { x = 0;    vx = Math.abs(vx);  hit = true; }
    if (x >= maxX) { x = maxX; vx = -Math.abs(vx); hit = true; }
    if (y <= 0)    { y = 0;    vy = Math.abs(vy);  hit = true; }
    if (y >= maxY) { y = maxY; vy = -Math.abs(vy); hit = true; }
    if (hit) nextShape();

    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    measure();
    if (reduced.matches) { stop(); x = 0; y = 0; draw(); return; }
    // start somewhere off the corner so the first bounce isn't immediate
    x = Math.max(bw - w, 0) * 0.10;
    y = Math.max(bh - h, 0) * 0.06;
    var a = (Math.random() * 0.6 + 0.2) * Math.PI;   // avoid near-horizontal drift
    vx = Math.cos(a) >= 0 ? 0.85 : -0.85;
    vy = Math.sin(a) >= 0 ? 0.6 : -0.6;
    draw();
    start();
  }

  // only animate while the hero is actually on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (reduced.matches) return;
        e.isIntersecting ? start() : stop();
      });
    }, {threshold: 0}).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (!reduced.matches) start();
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { measure(); draw(); }, 120);
  });

  (reduced.addEventListener ? reduced.addEventListener.bind(reduced, 'change') : reduced.addListener.bind(reduced))(init);

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
