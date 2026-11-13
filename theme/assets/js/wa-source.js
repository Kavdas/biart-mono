/* Пометка «пришёл с сайта» во всех сообщениях WhatsApp: к тексту каждой ссылки wa.me дописывается
   раздел страницы, откуда нажали. Формы заявок (form.js) уже пишут источник сами и сюда не попадают. */
(function () {
  var kk = document.documentElement.lang === 'kk';
  var tag = kk ? ' (BIART сайтынан' : ' (с сайта BIART';
  var section = function (a) {
    var s = a.closest('section[id], header, footer');
    var id = s ? (s.id || s.tagName.toLowerCase()) : 'page';
    return id.replace(/[^a-z0-9-]/gi, '');
  };
  Array.prototype.forEach.call(document.querySelectorAll('a[href*="wa.me/"]'), function (a) {
    if (a.closest('.biart-form') || a.dataset.src) return;
    var u;
    try { u = new URL(a.href); } catch (e) { return; }
    var text = u.searchParams.get('text') || (kk ? 'Сәлеметсіз бе! BIART туралы сұрағым бар.' : 'Здравствуйте! У меня вопрос о BIART.');
    if (text.indexOf('BIART)') > -1 || text.indexOf('сайтынан') > -1) return;
    u.searchParams.set('text', text + tag + ', ' + (kk ? 'бөлім: ' : 'раздел: ') + section(a) + ')');
    a.href = u.toString();
    a.dataset.src = '1';
  });
})();
