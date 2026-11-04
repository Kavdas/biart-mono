/* Карточки команды: клик по фото открывает биографию поверх страницы.
   Текст лежит в самой карточке (.teacher-bio) — клиент правит его обычным редактором,
   JS только показывает. Без JS биография видна прямо в карточке. */
(function () {
  var cards = document.querySelectorAll('.teacher:not(.teacher-count)');
  if (!cards.length) return;
  var isKz = document.documentElement.lang === 'kk';
  var t = isKz
    ? { close: 'Жабу', prev: 'Алдыңғы', next: 'Келесі', all: 'Барлығы', allTitle: 'BIART оқытушылары', allLead: 'Бағыттар бойынша: әр оқытушының жанында — оның арт-кураторы.', cur: 'Арт-куратор: ', allLabel: 'Барлық оқытушыларды көрсету' }
    : { close: 'Закрыть', prev: 'Предыдущий', next: 'Следующий', all: 'Все', allTitle: 'Преподаватели BIART', allLead: 'По направлениям — у каждой группы указан арт-куратор.', cur: 'Арт-куратор: ', allLabel: 'Показать всех преподавателей' };

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
      '<div class="tm-staff" hidden></div>' +
    '</div>';
  document.body.appendChild(box);

  var el = {
    img: box.querySelector('.tm-photo img'),
    name: box.querySelector('.tm-name'),
    role: box.querySelector('.tm-role'),
    bio: box.querySelector('.tm-bio'),
    staff: box.querySelector('.tm-staff'),
    close: box.querySelector('.tm-close'),
    prev: box.querySelector('.tm-prev'),
    next: box.querySelector('.tm-next')
  };

  var list = Array.prototype.slice.call(cards).filter(function (c) {
    return c.querySelector('.teacher-bio');
  });
  if (!list.length) return;
  var index = 0, opener = null;

  // Преподаватели направления лежат внутри биографии куратора (.staff) — переносим их под текст
  // на всю ширину окна; если карточек много, добавляем фильтр по предмету
  var renderStaff = function () {
    var staff = el.bio.querySelector('.staff');
    el.staff.innerHTML = '';
    el.staff.hidden = !staff;
    box.querySelector('.tm-box').classList.toggle('has-staff', !!staff);
    if (!staff) return;
    staff.parentNode.removeChild(staff);
    el.staff.appendChild(staff);
    staff.querySelectorAll('.staff-group').forEach(function (g) {
      var cards = g.querySelectorAll('.staff-card');
      var roles = [];
      cards.forEach(function (c) {
        var r = (c.querySelector('.staff-role') || {}).textContent;
        r = r && r.trim();
        if (r && roles.indexOf(r) < 0) roles.push(r);
      });
      if (cards.length < 5 || roles.length < 2) return;
      var bar = document.createElement('div');
      bar.className = 'staff-filter';
      var pick = function (role, btn) {
        bar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var r = ((c.querySelector('.staff-role') || {}).textContent || '').trim();
          c.hidden = !!role && r !== role;
        });
      };
      [''].concat(roles).forEach(function (role, n) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = role || t.all;
        b.addEventListener('click', function () { pick(role, b); });
        bar.appendChild(b);
        if (!n) b.classList.add('is-on');
      });
      g.insertBefore(bar, g.querySelector('.staff-grid'));
    });
  };

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
    renderStaff();
    el.prev.hidden = el.next.hidden = list.length < 2;
    box.querySelector('.tm-box').scrollTop = 0;
  };

  var open = function (i, from) {
    opener = from;
    box.hidden = false;
    document.body.classList.add('tm-open');
    box.querySelector('.tm-box').classList.remove('is-all');
    show(i);
    el.close.focus();
  };
  var close = function () {
    box.hidden = true;
    el.img.removeAttribute('src');
    document.body.classList.remove('tm-open');
    if (opener) opener.focus();
  };

  // плитка «25+ преподавателей»: показывает всех преподавателей школы, сгруппировав по направлениям
  var showAll = function (from) {
    opener = from;
    var wrap = document.createElement('div');
    var lead = document.createElement('p');
    lead.className = 'tm-all-lead';
    lead.textContent = t.allLead;
    wrap.appendChild(lead);
    var total = 0;
    list.forEach(function (c) {
      var bio = c.querySelector('.teacher-bio');
      var who = c.querySelector('h3');
      if (!bio) return;
      bio.querySelectorAll('.staff-group').forEach(function (g) {
        var copy = g.cloneNode(true);
        total += copy.querySelectorAll('.staff-card').length;
        var dir = copy.querySelector('.staff-dir');
        if (dir && who) {
          var cur = document.createElement('span');
          cur.className = 'tm-all-cur';
          cur.textContent = ' · ' + t.cur + who.textContent;
          dir.appendChild(cur);
        }
        wrap.appendChild(copy);
      });
    });
    el.bio.innerHTML = '';
    el.name.textContent = t.allTitle;
    el.role.textContent = '';
    el.staff.innerHTML = '';
    var title = document.createElement('h4');
    title.className = 'staff-title';
    title.textContent = t.allTitle + (total ? ' · ' + total : '');
    el.staff.appendChild(title);
    el.staff.appendChild(wrap);
    el.staff.hidden = false;
    var bx = box.querySelector('.tm-box');
    bx.classList.add('has-staff', 'is-all');
    el.prev.hidden = el.next.hidden = true;
    box.hidden = false;
    document.body.classList.add('tm-open');
    bx.scrollTop = 0;
    el.close.focus();
  };
  var countCard = document.querySelector('.teacher-count');
  if (countCard) {
    countCard.setAttribute('role', 'button');
    countCard.setAttribute('tabindex', '0');
    countCard.setAttribute('aria-haspopup', 'dialog');
    countCard.setAttribute('aria-label', t.allLabel);
    countCard.addEventListener('click', function () { showAll(countCard); });
    countCard.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showAll(countCard); }
    });
  }

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
    else if (box.querySelector('.tm-box').classList.contains('is-all')) return;
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
})();
