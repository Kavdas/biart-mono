/* Лента фото на первом экране аренды: копия плиток в конце дорожки даёт бесшовный круг (сдвиг на −50 %),
   длительность — по числу плиток, чтобы скорость не зависела от их количества. Лента стоит, когда первый экран
   ушёл с глаз или вкладка скрыта; при «уменьшении движения» — не едет вовсе. Без JS видны три первых фото. */
(function () {
  var strip = document.querySelector('.rent-strip');
  var track = strip && strip.querySelector('.rent-strip-track');
  if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tiles = Array.prototype.slice.call(track.children);
  if (tiles.length < 4) return;
  tiles.forEach(function (t) {
    var c = t.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(c.querySelectorAll('img'), function (im) { im.alt = ''; im.removeAttribute('fetchpriority'); });
    track.appendChild(c);
  });
  strip.style.setProperty('--strip-dur', tiles.length * 9 + 's');
  var onScreen = true, shown = !document.hidden;
  var sync = function () { strip.classList.toggle('is-paused', !(onScreen && shown)); };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; sync(); }).observe(strip);
  }
  document.addEventListener('visibilitychange', function () { shown = !document.hidden; sync(); });
  strip.classList.add('is-moving');
  sync();
})();
