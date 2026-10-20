/* Карта. Виджет Яндекса тянет больше мегабайта скриптов, поэтому в разметке его нет:
   iframe подставляется, когда блок контактов доходит до экрана. Посетитель видит карту,
   а не кнопку-заглушку, при этом первую загрузку страницы виджет не утяжеляет — он
   грузится только у тех, кто долистал. Если браузер просит экономить трафик, ждём клика.
   Кнопка остаётся рабочей в любом случае. Без JS работает <noscript> с обычным iframe. */
(function () {
  var boxes = document.querySelectorAll('.map-embed.is-stub');
  if (!boxes.length) return;

  var saveData = (navigator.connection || {}).saveData === true;

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

    if (saveData || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        load(box);
      });
    }, { rootMargin: '200px' });
    io.observe(box);
  });
})();
