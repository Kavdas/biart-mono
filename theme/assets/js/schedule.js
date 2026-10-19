/* Расписание по возрастам: переключатель возрастных групп.
   Кнопки строит скрипт, а не разметка, — так клиент правит в редакторе обычный
   текст, а без JS страница остаётся как есть: три возраста подряд, всё видно. */
(function () {
  var ages = document.querySelectorAll('.schedule .sch-age');
  if (ages.length < 2) return;

  var kz = document.documentElement.lang === 'kk';
  var bar = document.createElement('div');
  bar.className = 'sch-tabs';
  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', kz ? 'Жас тобы' : 'Возрастная группа');

  var panels = Array.prototype.slice.call(ages);
  var tabs = [];

  // «6–10 лет» -> «610»: по этому ключу вкладка открывается из адреса,
  // например /raspisanie/#11-13 с кнопок на главной
  var key = function (text) { return (text.match(/\d+/g) || []).join(''); };

  var show = function (i, push) {
    panels.forEach(function (p, n) { p.hidden = n !== i; });
    tabs.forEach(function (b, n) {
      var on = n === i;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (push && window.history && history.replaceState) {
      // «6–10 лет» -> «#6-10», «Взрослые 18+» -> «#18»
      var n = tabs[i].textContent.match(/\d+/g) || [];
      history.replaceState(null, '', '#' + n.join('-'));
    }
  };

  panels.forEach(function (p, i) {
    var h = p.querySelector('h2');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sch-tab';
    b.textContent = h ? h.textContent : String(i + 1);
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { show(i, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tabs.length) % tabs.length;
      show(n, true); tabs[n].focus();
    });
    bar.appendChild(b);
    tabs.push(b);
    if (h) h.hidden = true;            // заголовок дублировал бы кнопку
    p.setAttribute('role', 'tabpanel');
  });

  panels[0].parentNode.insertBefore(bar, panels[0]);
  document.documentElement.classList.add('has-sch-tabs');

  var wanted = key(decodeURIComponent(location.hash));
  var start = 0;
  tabs.forEach(function (b, i) { if (wanted && key(b.textContent) === wanted) start = i; });
  show(start);
})();
