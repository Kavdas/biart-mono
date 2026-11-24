/* Точки под горизонтальной лентой на телефоне (абонементы): показывают, сколько карточек и какая сейчас видна;
   нажатие на точку листает к карточке. На широком экране лента — обычная сетка, точки скрыты CSS. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.price-grid'), function (grid) {
    var cards = Array.prototype.slice.call(grid.children);
    if (cards.length < 2) return;
    var kk = document.documentElement.lang === 'kk';
    var nav = document.createElement('div');
    nav.className = 'swipe-dots';
    nav.setAttribute('aria-hidden', 'true');
    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.title = (kk ? 'Тариф ' : 'Тариф ') + (i + 1);
      b.addEventListener('click', function () { grid.scrollTo({ left: c.offsetLeft - grid.offsetLeft - parseFloat(getComputedStyle(grid).paddingLeft), behavior: 'smooth' }); });
      nav.appendChild(b);
    });
    grid.parentNode.insertBefore(nav, grid.nextSibling);
    var dots = nav.children;
    var sync = function () {
      var mid = grid.scrollLeft + grid.clientWidth / 2, best = 0, bd = Infinity;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - grid.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle('is-on', i === best); });
    };
    grid.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    sync();
  });
})();
