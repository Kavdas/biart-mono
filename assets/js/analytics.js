/* Яндекс Метрика: цели «заявка» и «WhatsApp». Работает только если в wp-config задан BIART_METRIKA_ID
   (тег <meta name="biart-metrika">). Без него ничего не загружается и никуда не отправляется. */
(function () {
  var m = document.querySelector('meta[name="biart-metrika"]');
  var id = m && parseInt(m.content, 10);
  if (!id) return;
  (function (w, d, s) {
    w.ym = w.ym || function () { (w.ym.a = w.ym.a || []).push(arguments); };
    w.ym.l = 1 * new Date();
    var a = d.createElement(s); a.async = 1; a.src = 'https://mc.yandex.ru/metrika/tag.js'; d.head.appendChild(a);
  })(window, document, 'script');
  window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  var goal = function (name) { try { window.ym(id, 'reachGoal', name); } catch (e) { /* аналитика не должна ломать сайт */ } };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (a && !a.closest('.biart-form')) goal('whatsapp_click');
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('.biart-form');
    if (f && !f.querySelector('[aria-invalid="true"]')) goal('form_' + (f.getAttribute('data-variant') || 'ask'));
  }, true);
})();
