/* Движение от прокрутки: цвет росчерка в углу секции и параллакс фотографий.
   Оба эффекта считаются в одном цикле на один слушатель scroll — отдельные
   слушатели на каждый эффект дали бы лишние проходы по странице в 15 экранов.
   В цикле только чтение getBoundingClientRect и запись custom property,
   ничего, что вызывает пересчёт раскладки.
   Без JS и при prefers-reduced-motion всё остаётся таким, каким задал CSS. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* --- росчерк: ступени цвета и их число живут в CSS --- */
  var secs = Array.prototype.map.call(
    document.querySelectorAll('.section-deco'),
    function (el) {
      return {
        el: el,
        steps: parseInt(getComputedStyle(el).getPropertyValue('--deco-steps'), 10) || 3,
        shown: -1
      };
    }
  );

  /* --- параллакс: кадр внутри рамки едет медленнее страницы --- */
  var PAR = '.about-photo img, .dir-media .dir-photo img, .ev-ph a img';
  var RANGE = 0.065;   // ход вверх-вниз, доля высоты кадра; запас даёт --zoom: 1.14
  var pars = Array.prototype.slice.call(document.querySelectorAll(PAR));
  if (pars.length) document.documentElement.classList.add('has-par');

  var tick = function () {
    var vh = window.innerHeight || document.documentElement.clientHeight;

    for (var i = 0; i < secs.length; i++) {
      var s = secs[i], r = s.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      var p = (vh - r.top) / (vh + r.height);          // 0 — показалась снизу, 1 — ушла вверх
      var step = Math.min(s.steps - 1, Math.max(0, Math.floor(p * s.steps)));
      if (step === s.shown) continue;
      s.shown = step;
      s.el.style.setProperty('--deco', 'var(--deco-' + (step + 1) + ')');
      // небольшой доворот: смена цвета читается как движение, а не как мигание
      s.el.style.setProperty('--deco-rot', (step % 2 ? 5 : -5) + 'deg');
    }

    for (var j = 0; j < pars.length; j++) {
      var img = pars[j], b = img.getBoundingClientRect();
      if (b.bottom < -200 || b.top > vh + 200) {
        if (img.style.willChange) img.style.willChange = '';
        continue;
      }
      img.style.willChange = 'transform';
      var q = (vh - b.top) / (vh + b.height);
      q = q < 0 ? 0 : q > 1 ? 1 : q;
      // размах считаем от НЕувеличенной высоты: getBoundingClientRect возвращает
      // уже отмасштабированный бокс, и кадр уходил за край рамки
      img.style.setProperty('--par', ((q - 0.5) * 2 * RANGE * img.offsetHeight).toFixed(1) + 'px');
    }
  };

  var queued = false;
  var onScroll = function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; tick(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
})();
