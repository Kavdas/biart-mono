/* Лайтбокс для фото событий: картинки в .ev-mosaic — ссылки на полноразмерный файл,
   JS открывает их поверх страницы (стрелки, Esc, свайп). Без JS ссылка просто открывает фото. */
(function () {
  var groups = document.querySelectorAll('.ev-mosaic');
  if (!groups.length) return;
  var isKz = document.documentElement.lang === 'kk';
  var t = isKz ? { close: 'Жабу', prev: 'Алдыңғы', next: 'Келесі' } : { close: 'Закрыть', prev: 'Предыдущее', next: 'Следующее' };

  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.hidden = true;
  box.innerHTML =
    '<button type="button" class="lb-close" aria-label="' + t.close + '">&times;</button>' +
    '<button type="button" class="lb-prev" aria-label="' + t.prev + '">&#8249;</button>' +
    '<figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button type="button" class="lb-next" aria-label="' + t.next + '">&#8250;</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img');
  var cap = box.querySelector('.lb-cap');
  var items = [], index = 0, opener = null;

  var show = function (i) {
    index = (i + items.length) % items.length;
    var a = items[index];
    img.src = a.href;
    img.alt = a.querySelector('img') ? a.querySelector('img').alt : '';
    cap.textContent = img.alt;
    box.querySelector('.lb-prev').hidden = box.querySelector('.lb-next').hidden = items.length < 2;
  };
  var open = function (list, i, el) {
    items = list; opener = el;
    box.hidden = false;
    document.body.classList.add('lb-open');
    show(i);
    box.querySelector('.lb-close').focus();
  };
  var close = function () {
    box.hidden = true;
    img.removeAttribute('src');
    document.body.classList.remove('lb-open');
    if (opener) opener.focus();
  };

  groups.forEach(function (g) {
    var links = Array.prototype.slice.call(g.querySelectorAll('a[href]'));
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        open(links, i, a);
      });
    });
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });
})();
