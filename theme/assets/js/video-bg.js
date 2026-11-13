/* Видео страницы аренды. Фон (.rent-bg): стартует, когда попал в экран, и ставится на паузу, когда ушёл;
   на вертикальном экране берётся вертикальная версия ролика; при «уменьшении движения» и «экономии трафика»
   остаётся постер. Плеер (.rent-player) со звуком; пока он играет, фон молчит и стоит. Без JS — постеры и controls. */
(function () {
  var bgs = document.querySelectorAll('.rent-bg video');
  var players = document.querySelectorAll('.rent-player video');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection || {}).saveData === true;
  var portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  var playing = false;

  Array.prototype.forEach.call(bgs, function (v) {
    if (portrait) {
      v.src = v.getAttribute('src').replace('hall-bg.mp4', 'hall-bg-m.mp4');
      v.poster = v.getAttribute('poster').replace('hall-bg-poster.jpg', 'hall-bg-poster-m.jpg');
    }
    v.muted = true;
    if (calm || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !playing) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    io.observe(v);
  });
  Array.prototype.forEach.call(players, function (v) {
    v.addEventListener('play', function () { playing = true; Array.prototype.forEach.call(bgs, function (b) { b.pause(); }); });
    v.addEventListener('pause', function () { playing = false; });
    v.addEventListener('ended', function () { playing = false; });
  });
})();
