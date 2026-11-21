/* Карта. Виджет Яндекса тянет больше мегабайта скриптов и сообщает Яндексу адрес посетителя,
   поэтому в разметке его нет: iframe подставляется только по клику на «Показать карту».
   Так страница быстрее, а данные посетителя уходят третьей стороне лишь с его согласия.
   Без JS работает <noscript> с обычным iframe. */
(function () {
  var boxes = document.querySelectorAll('.map-embed.is-stub');
  if (!boxes.length) return;

  var load = function (box) {
    if (!box.classList.contains('is-stub')) return;
    var f = document.createElement('iframe');
    f.src = box.dataset.map;
    f.title = box.dataset.title || '';
    f.width = '100%';
    f.height = '600';
    f.loading = 'eager';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.classList.remove('is-stub');
    box.innerHTML = '';
    box.appendChild(f);
  };

  Array.prototype.forEach.call(boxes, function (box) {
    var btn = box.querySelector('.map-open');
    if (btn) btn.addEventListener('click', function () { load(box); });

  });
})();
