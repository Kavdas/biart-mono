/* «Направления»: вкладки «Детям / Взрослым» и выбор возраста.
   Состояние живёт в data-v на секции (all | 6-10 | 11-13 | 14-17 | adult); показ вариантов — в CSS.
   Без JS и по умолчанию открыта группа 6–10 лет. Ссылки вида #aud-adults / #age-6-10 открывают нужную вкладку. */
(function () {
  var sec = document.querySelector('.directions');
  if (!sec) return;
  var links = sec.querySelectorAll('.dir-aud a, .dir-ages a');
  if (!links.length) return;
  var aud = 'kids', age = '6-10';

  var apply = function () {
    sec.setAttribute('data-v', aud === 'adults' ? 'adult' : age);
    sec.setAttribute('data-aud', aud);
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      var on = id === 'aud-' + aud || (aud === 'kids' && id === 'age-' + age);
      a.parentNode.classList.toggle('is-active', on);
      a.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').replace('#', '');
      if (id.indexOf('aud-') === 0) aud = id.slice(4);
      else if (id.indexOf('age-') === 0) { aud = 'kids'; age = id.slice(4); }
      else return;
      e.preventDefault();
      apply();
    });
  });
  var h = location.hash.replace('#', '');
  if (h === 'aud-adults') aud = 'adults';
  else if (/^age-/.test(h)) age = h.slice(4);
  apply();
})();
