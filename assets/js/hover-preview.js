/* Показ фото по наведению: строки «Пространство» и «Направления» держат фото скрытым,
   а у курсора плавно едет превью (как в списках проектов на студийных сайтах).
   На сенсорных экранах фото раскрывается тапом по строке. Без JS миниатюры видны сразу. */
(function () {
  var rows = document.querySelectorAll('.space-row, .dir-row');
  if (!rows.length) return;
  document.documentElement.classList.add('has-hpv');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var imgOf = function (r) { return r.querySelector('.space-ph img, .dir-photo img'); };

  if (!fine) {
    rows.forEach(function (r) {
      if (!imgOf(r)) return;
      r.classList.add('is-tappable');
      r.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        r.classList.toggle('is-open');
      });
    });
    return;
  }

  var pv = document.createElement('div');
  pv.className = 'hpv';
  pv.setAttribute('aria-hidden', 'true');
  var im = document.createElement('img');
  im.alt = '';
  pv.appendChild(im);
  document.body.appendChild(pv);

  var x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  var loop = function () {
    x += (tx - x) * 0.16; y += (ty - y) * 0.16;
    pv.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    raf = (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) ? requestAnimationFrame(loop) : 0;
  };
  rows.forEach(function (r) {
    var img = imgOf(r);
    if (!img) return;
    r.addEventListener('pointerenter', function (e) {
      im.src = img.src;
      tx = x = e.clientX; ty = y = e.clientY;
      pv.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      pv.classList.add('is-on');
    });
    r.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    r.addEventListener('pointerleave', function () { pv.classList.remove('is-on'); });
  });
  window.addEventListener('scroll', function () { pv.classList.remove('is-on'); }, { passive: true });
})();
