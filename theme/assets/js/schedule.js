/* Расписание: переключатель «Детям / Взрослым» и возрастные группы детей.
   Кнопки строит скрипт, а не разметка, — так клиент правит в редакторе обычный
   текст, а без JS страница остаётся как есть: все возрасты подряд, всё видно.
   По умолчанию открыта первая детская группа (6–10 лет). */
(function () {
  var ages = document.querySelectorAll('.schedule .sch-age');
  if (ages.length < 2) return;

  var kz = document.documentElement.lang === 'kk';
  var panels = Array.prototype.slice.call(ages);
  // «6–10 лет» -> «610»: по этому ключу вкладка открывается из адреса, например /raspisanie/#11-13
  var key = function (text) { return (text.match(/\d+/g) || []).join(''); };
  var title = function (p) { var h = p.querySelector('h2'); return h ? h.textContent : ''; };
  var isAdult = function (p) { return key(title(p)) === '18'; };

  var kids = panels.filter(function (p) { return !isAdult(p); });
  var adults = panels.filter(isAdult);

  var mkBar = function (cls, label) {
    var bar = document.createElement('div');
    bar.className = cls;
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', label);
    return bar;
  };
  var ageBar = mkBar('sch-tabs', kz ? 'Жас тобы' : 'Возрастная группа');
  var audBar = mkBar('sch-aud', kz ? 'Кімге арналған' : 'Для кого');
  var tabs = [];
  var audBtns = {};
  var current = panels.indexOf(kids[0]);

  var render = function (i, push) {
    current = i;
    var adult = isAdult(panels[i]);
    panels.forEach(function (p, n) { p.hidden = n !== i; });
    tabs.forEach(function (t) {
      var on = t.panel === panels[i];
      t.btn.classList.toggle('is-on', on);
      t.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      t.btn.tabIndex = on ? 0 : -1;
    });
    ageBar.hidden = adult;
    Object.keys(audBtns).forEach(function (k) {
      var on = (k === 'adult') === adult;
      audBtns[k].classList.toggle('is-on', on);
      audBtns[k].setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (push && window.history && history.replaceState) {
      // «6–10 лет» -> «#6-10», «Взрослые 18+» -> «#18»
      history.replaceState(null, '', '#' + (title(panels[i]).match(/\d+/g) || []).join('-'));
    }
  };

  kids.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sch-tab'; b.textContent = title(p);
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { render(panels.indexOf(p), true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (kids.indexOf(p) + d + kids.length) % kids.length;
      render(panels.indexOf(kids[n]), true); tabs[n].btn.focus();
    });
    ageBar.appendChild(b);
    tabs.push({ panel: p, btn: b });
  });

  var addAud = function (id, label, target) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sch-aud-btn'; b.textContent = label;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () {
      // возвращаясь к детям, открываем последнюю выбранную группу или первую по умолчанию
      var t = target();
      if (t) render(panels.indexOf(t), true);
    });
    audBar.appendChild(b); audBtns[id] = b;
  };
  var lastKid = kids[0];
  addAud('kids', kz ? 'Балаларға' : 'Детям', function () { return lastKid; });
  if (adults.length) addAud('adult', kz ? 'Ересектерге' : 'Взрослым', function () { return adults[0]; });

  var origRender = render;
  render = function (i, push) { if (!isAdult(panels[i])) lastKid = panels[i]; origRender(i, push); };

  panels.forEach(function (p) {
    var h = p.querySelector('h2');
    if (h) h.hidden = true;            // заголовок дублировал бы кнопку
    p.setAttribute('role', 'tabpanel');
  });

  var holder = panels[0].parentNode;
  holder.insertBefore(ageBar, panels[0]);
  holder.insertBefore(audBar, ageBar);
  document.documentElement.classList.add('has-sch-tabs');

  var wanted = key(decodeURIComponent(location.hash));
  var start = panels.indexOf(kids[0]);
  panels.forEach(function (p, i) { if (wanted && key(title(p)) === wanted) start = i; });
  render(start);
})();
