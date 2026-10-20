/* Фото-карусель: стрелки, перетаскивание мышью, свайп, автопрокрутка у краёв при наведении.
   Без JS — обычная горизонтальная прокрутка. */
(function () {
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.carousel-track');
    if (!track) return;
    c.classList.add('is-ready');

    // стрелки
    var mk = function (dir, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-btn car-' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = dir === 'prev'
        ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
        : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
      c.appendChild(b);
      return b;
    };
    var prev = mk('prev', 'Предыдущие фото');
    var next = mk('next', 'Следующие фото');
    var step = function () { return Math.max(240, track.clientWidth * 0.75); };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    // бесконечная лента: копии набора слева и справа, старт с «настоящего» набора
    var originals = Array.prototype.slice.call(track.children);
    var clone = function () { originals.forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('is-clone'); track.appendChild(c); }); };
    var cloneBefore = function () { originals.slice().reverse().forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('is-clone'); track.insertBefore(c, track.firstChild); }); };
    clone(); cloneBefore();
    var realW = function () { return track.scrollWidth / 3; };
    var jumping = false;
    var jump = function (delta) {
      jumping = true;
      var prevBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft += delta;
      track.style.scrollBehavior = prevBehavior;
      jumping = false;
    };
    var loop = function () {
      if (jumping) return;
      var w = realW(), sl = track.scrollLeft;
      if (sl < w * 0.35) jump(w);
      else if (sl > w * 1.65) jump(-w);
    };
    track.addEventListener('scroll', loop, { passive: true });
    // раньше здесь всем кадрам ставилось loading="eager" — браузер тянул все 39 фото сразу,
    // и даже хиро догружался секунд за тридцать. Теперь у картинок есть width/height,
    // ширина ленты считается до загрузки, и ленивые кадры подгружаются по мере прокрутки
    var placed = false;
    var place = function () { if (placed) return; placed = true; jump(realW()); };
    if (track.scrollWidth > track.clientWidth * 2) place();
    else {
      var tries = 0;
      var waitLayout = function () {
        if (placed) return;
        if (track.scrollWidth > track.clientWidth * 2 || ++tries > 20) place();
        else setTimeout(waitLayout, 100);
      };
      setTimeout(waitLayout, 50);
    }

    // счётчик и полоса прогресса: с 39 кадрами без них непонятно, где ты и сколько ещё
    var meta = document.createElement('div');
    meta.className = 'car-meta';
    var count = document.createElement('span');
    count.className = 'car-count';
    var bar = document.createElement('span');
    bar.className = 'car-bar';
    var fill = document.createElement('i');
    bar.appendChild(fill);
    meta.appendChild(count);
    meta.appendChild(bar);
    c.appendChild(meta);
    var total = originals.length;
    var pad = function (k) { return (k < 10 ? '0' : '') + k; };
    var drawRaf = null;
    var draw = function () {
      drawRaf = null;
      if (!total) return;
      // считаем по реальным позициям кадров, а не по доле скролла: с копиями по краям
      // модульная арифметика ошибается на округлении и показывает 39/39 вместо 01/39
      var kids = track.children;
      var padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var edge = track.scrollLeft + padLeft;
      var k = 0, best = Infinity;
      for (var j = 0; j < kids.length; j++) {
        var d = Math.abs(kids[j].offsetLeft - edge);
        if (d < best) { best = d; k = j; }
      }
      var i = (k % total) + 1;
      count.textContent = pad(i) + ' / ' + total;
      fill.style.width = (i / total * 100).toFixed(2) + '%';
    };
    var queueDraw = function () { if (!drawRaf) drawRaf = requestAnimationFrame(draw); };
    track.addEventListener('scroll', queueDraw, { passive: true });
    window.addEventListener('resize', queueDraw);
    setTimeout(draw, 300);
    setTimeout(draw, 1800);
    draw();

    // перетаскивание мышью
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('mousedown', function (e) {
      down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('mouseup', function () { down = false; track.classList.remove('is-dragging'); });
    track.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // автопрокрутка при наведении к краю (только мышь)
    var edge = 0, raf = null;
    var tick = function () {
      if (edge) { track.scrollLeft += edge * 4; raf = requestAnimationFrame(tick); } else { raf = null; }
    };
    track.addEventListener('mousemove', function (e) {
      if (down || !window.matchMedia('(hover: hover)').matches) return;
      var r = track.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      edge = x < 0.1 ? -1 : x > 0.9 ? 1 : 0;
      if (edge && !raf) raf = requestAnimationFrame(tick);
    });
    track.addEventListener('mouseleave', function () { edge = 0; });
    prev.addEventListener('mouseenter', function () { edge = 0; });
    next.addEventListener('mouseenter', function () { edge = 0; });
  });
})();
