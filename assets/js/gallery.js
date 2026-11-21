/* Галерея «Все помещения»: фильтры по категориям, на телефоне — 6 фото и «Ещё фото», лайтбокс (← → Esc, свайп). Без JS — просто сетка фото. */
(function () {
  var grid = document.querySelector('.gal-grid');
  if (!grid) return;
  var kk = document.documentElement.lang === 'kk';
  var t = kk ? { close: 'Жабу', prev: 'Алдыңғы', next: 'Келесі' } : { close: 'Закрыть', prev: 'Предыдущее', next: 'Следующее' };
  var items = Array.prototype.slice.call(grid.querySelectorAll('.gal-item'));
  var visible = function () { return items.filter(function (f) { return !f.hidden; }); };

  // ----- телефон: сначала 6 фото и кнопка «Ещё фото (N)»; лайтбокс всё равно листает всю категорию -----
  var LIMIT = 6, expanded = false, mq = window.matchMedia('(max-width: 781px)');
  var moreWrap = document.createElement('div');
  moreWrap.className = 'wp-block-buttons gal-more'; moreWrap.hidden = true;
  moreWrap.innerHTML = '<div class="wp-block-button is-style-outline"><button type="button" class="wp-block-button__link wp-element-button"></button></div>';
  grid.parentNode.insertBefore(moreWrap, grid.nextSibling);
  var moreBtn = moreWrap.querySelector('button');
  var collapse = function () {
    var v = visible(), on = mq.matches && !expanded && v.length > LIMIT;
    grid.classList.toggle('is-collapsed', on);
    items.forEach(function (f) { f.classList.remove('is-extra'); });
    if (on) v.slice(LIMIT).forEach(function (f) { f.classList.add('is-extra'); });
    moreWrap.hidden = !on;
    moreBtn.textContent = (kk ? 'Тағы фото' : 'Ещё фото') + ' (' + (v.length - LIMIT) + ')';
  };
  moreBtn.addEventListener('click', function () {
    var first = visible()[LIMIT];
    expanded = true; collapse();
    if (first) first.querySelector('a').focus({ preventScroll: true });
  });
  if (mq.addEventListener) mq.addEventListener('change', collapse);

  // ----- фильтры: кнопки ведут на #gal-<категория> -----
  var filter = document.querySelector('.gal-filter');
  var apply = function (cat) {
    items.forEach(function (f) { f.hidden = cat !== 'all' && !f.classList.contains('cat-' + cat); });
    if (filter) Array.prototype.forEach.call(filter.querySelectorAll('.wp-block-button'), function (b) {
      var on = b.querySelector('a').getAttribute('href') === '#gal-' + cat;
      b.classList.toggle('is-active', on); b.querySelector('a').setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    collapse();
  };
  if (filter) {
    filter.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); apply(a.getAttribute('href').replace('#gal-', ''));
    });
    apply('all');
  } else collapse();

  // ----- лайтбокс -----
  var box = document.createElement('div');
  box.className = 'gl'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button type="button" class="gl-x" aria-label="' + t.close + '">&times;</button>' +
    '<button type="button" class="gl-p" aria-label="' + t.prev + '">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="gl-n" aria-label="' + t.next + '">&#8250;</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img'), cap = box.querySelector('figcaption');
  var idx = 0, opener = null;
  var show = function (i) {
    var v = visible(); if (!v.length) return;
    idx = (i + v.length) % v.length;
    var a = v[idx].querySelector('a'), im = v[idx].querySelector('img');
    img.src = a.href; img.alt = im.alt; cap.textContent = im.alt + '  ·  ' + (idx + 1) + ' / ' + v.length;
  };
  var close = function () { box.hidden = true; img.removeAttribute('src'); document.body.classList.remove('gl-open'); if (opener) opener.focus(); };
  items.forEach(function (f) {
    var a = f.querySelector('a'); if (!a) return;
    a.addEventListener('click', function (e) {
      e.preventDefault(); opener = a;
      box.hidden = false; document.body.classList.add('gl-open');
      show(visible().indexOf(f)); box.querySelector('.gl-x').focus();
    });
  });
  box.querySelector('.gl-x').addEventListener('click', close);
  box.querySelector('.gl-p').addEventListener('click', function () { show(idx - 1); });
  box.querySelector('.gl-n').addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {
      var f = box.querySelectorAll('button'); var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
})();
