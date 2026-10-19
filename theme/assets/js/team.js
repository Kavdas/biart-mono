/* Карточки команды: клик по фото открывает биографию поверх страницы.
   Текст лежит в самой карточке (.teacher-bio) — клиент правит его обычным редактором,
   JS только показывает. Без JS биография видна прямо в карточке. */
(function () {
  var cards = document.querySelectorAll('.teacher');
  if (!cards.length) return;
  var isKz = document.documentElement.lang === 'kk';
  var t = isKz
    ? { close: 'Жабу', prev: 'Алдыңғы', next: 'Келесі' }
    : { close: 'Закрыть', prev: 'Предыдущий', next: 'Следующий' };

  document.documentElement.classList.add('has-team-modal');

  var box = document.createElement('div');
  box.className = 'tm';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'tm-name');
  box.hidden = true;
  box.innerHTML =
    '<div class="tm-box">' +
      '<button type="button" class="tm-close" aria-label="' + t.close + '">&times;</button>' +
      '<div class="tm-photo"><img alt=""></div>' +
      '<div class="tm-text">' +
        '<p class="tm-role"></p>' +
        '<h3 class="tm-name" id="tm-name"></h3>' +
        '<div class="tm-bio"></div>' +
        '<div class="tm-nav">' +
          '<button type="button" class="tm-prev">&#8249; ' + t.prev + '</button>' +
          '<button type="button" class="tm-next">' + t.next + ' &#8250;</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(box);

  var el = {
    img: box.querySelector('.tm-photo img'),
    name: box.querySelector('.tm-name'),
    role: box.querySelector('.tm-role'),
    bio: box.querySelector('.tm-bio'),
    close: box.querySelector('.tm-close'),
    prev: box.querySelector('.tm-prev'),
    next: box.querySelector('.tm-next')
  };

  var list = Array.prototype.slice.call(cards).filter(function (c) {
    return c.querySelector('.teacher-bio');
  });
  if (!list.length) return;
  var index = 0, opener = null;

  var show = function (i) {
    index = (i + list.length) % list.length;
    var c = list[index];
    var photo = c.querySelector('.portrait img');
    var name = c.querySelector('h3');
    var role = c.querySelector('.teacher-role');
    var bio = c.querySelector('.teacher-bio');
    if (photo) { el.img.src = photo.currentSrc || photo.src; el.img.alt = photo.alt || ''; }
    el.name.textContent = name ? name.textContent : '';
    el.role.textContent = role ? role.textContent : '';
    el.bio.innerHTML = bio ? bio.innerHTML : '';
    el.prev.hidden = el.next.hidden = list.length < 2;
    box.querySelector('.tm-box').scrollTop = 0;
  };

  var open = function (i, from) {
    opener = from;
    box.hidden = false;
    document.body.classList.add('tm-open');
    show(i);
    el.close.focus();
  };
  var close = function () {
    box.hidden = true;
    el.img.removeAttribute('src');
    document.body.classList.remove('tm-open');
    if (opener) opener.focus();
  };

  list.forEach(function (c, i) {
    var hits = [c.querySelector('.portrait'), c.querySelector('.teacher-more')];
    hits.forEach(function (h) {
      if (!h) return;
      h.setAttribute('role', 'button');
      h.setAttribute('tabindex', '0');
      h.setAttribute('aria-haspopup', 'dialog');
      // у фото нет собственного текста: без имени скринридер читает просто «кнопка»
      if (!h.textContent.trim()) {
        var who = c.querySelector('h3');
        h.setAttribute('aria-label', (isKz ? 'Толығырақ: ' : 'Подробнее: ') + (who ? who.textContent : ''));
      }
      h.classList.add('is-clickable');
      h.addEventListener('click', function () { open(i, h); });
      h.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, h); }
      });
    });
  });

  el.close.addEventListener('click', close);
  el.prev.addEventListener('click', function () { show(index - 1); });
  el.next.addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    // фокус не должен уходить из открытого окна на страницу под ним
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(
        box.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'),
        function (n) { return !n.hidden && n.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
})();
