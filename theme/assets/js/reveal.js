/* Появление секций при скролле и докрутка цифр (400+, 35+, 5000 м²).
   Без JS и при prefers-reduced-motion страница остаётся статичной — контент виден всегда. */
(function () {
  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOk || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('has-reveal');

  // 1. блоки выезжают снизу
  var targets = document.querySelectorAll(
    '.section .wrap > *, .benefit, .price, .teacher, .review, .dir-row, .ev-feat, .ev-item'
  );
  targets.forEach(function (el) { el.classList.add('reveal'); });

  var revealed = 0;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealed++;
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach(function (el) { io.observe(el); });

  // страховка: если наблюдатель за 4 секунды не показал вообще ничего — значит он
  // не работает в этой среде. Контент не должен остаться невидимым ни при каких условиях
  setTimeout(function () {
    if (revealed) return;
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }, 4000);
  window.addEventListener('beforeprint', function () {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  });

  // 2. цифры докручиваются: «400+» -> 0…400, знаки и хвост сохраняем
  var nums = document.querySelectorAll('.stat-num, .teach-facts strong');
  var numIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      numIo.unobserve(e.target);
      var el = e.target;
      var raw = el.textContent;
      // разделитель тысяч только между цифрами: иначе «5000 м²» превращалось в «5 000м²»
      var m = raw.match(/^(\D*)(\d+(?:[ \s]\d{3})*)(.*)$/);
      if (!m) return;
      var head = m[1], tail = m[3];
      var digits = m[2].replace(/[^\d]/g, '');
      var target = parseInt(digits, 10);
      if (!target || target > 100000) return;
      var grouped = /[ \s]/.test(m[2]);
      var fmt = function (v) {
        var t = String(v);
        if (grouped) t = t.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return head + t + tail;
      };
      var dur = 900, t0 = 0;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0);
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { numIo.observe(el); });
})();
