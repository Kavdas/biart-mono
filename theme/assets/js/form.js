/* Форма заявки («Возникли вопросы?» и «Оставить заявку»).
   Данные никуда не отправляются и нигде не хранятся: после проверки полей собирается
   текст и открывается WhatsApp менеджера с уже написанным сообщением. */
(function () {
  var forms = document.querySelectorAll('.biart-form');
  if (!forms.length) return;

  var MSG = {
    ru: {
      name: 'Введите имя (от 2 букв)', phone: 'Введите номер телефона полностью', consent: 'Нужно согласие на обработку данных',
      ok: 'Готово! Откроется WhatsApp — отправьте сообщение, и менеджер перезвонит.', link: 'Открыть WhatsApp',
      hi: 'Здравствуйте! Меня зовут ', tel: 'Телефон: ', age: 'Возраст: ', dir: 'Направление: ', q: 'Вопрос: ', end: 'Прошу перезвонить.'
    },
    kk: {
      name: 'Атыңызды енгізіңіз (кемінде 2 әріп)', phone: 'Телефон нөмірін толық енгізіңіз', consent: 'Деректерді өңдеуге келісім қажет',
      ok: 'Дайын! WhatsApp ашылады — хабарламаны жіберіңіз, менеджер қоңырау шалады.', link: 'WhatsApp ашу',
      hi: 'Сәлеметсіз бе! Менің атым ', tel: 'Телефон: ', age: 'Жасы: ', dir: 'Бағыт: ', q: 'Сұрақ: ', end: 'Қоңырау шалуыңызды сұраймын.'
    }
  };

  // служебные символы и лишние пробелы вычищаем: текст уходит в ссылку
  var clean = function (v, max) { return String(v || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); };

  var digitsOf = function (v) { return String(v || '').replace(/\D/g, ''); };
  var fmtPhone = function (v) {
    var d = digitsOf(v);
    if (!d) return '';
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d.charAt(0) !== '7') return '+' + d.slice(0, 15);        // иностранный номер — без маски
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  };

  forms.forEach(function (form) {
    var lang = form.getAttribute('data-lang') === 'kk' ? 'kk' : 'ru';
    var m = MSG[lang];
    var wa = String(form.getAttribute('data-wa') || '').replace(/\D/g, '');
    var f = form.elements;
    var status = form.querySelector('.bf-status');
    var btn = form.querySelector('.bf-submit');

    var setErr = function (el, text) {
      var box = el.closest('.bf-field, .bf-consent-wrap');
      var out = box && box.querySelector('.bf-error');
      if (out) out.textContent = text || '';
      el.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (box) box.classList.toggle('has-error', !!text);
    };
    var validate = function () {
      var ok = true, first = null;
      var check = function (el, bad, text) {
        setErr(el, bad ? text : '');
        if (bad) { ok = false; if (!first) first = el; }
      };
      var name = clean(f.name.value, 60);
      check(f.name, name.length < 2 || /^[\d\s+()-]+$/.test(name), m.name);
      var d = digitsOf(f.phone.value);
      check(f.phone, d.length < 10 || d.length > 15 || (d.charAt(0) === '7' && d.length !== 11), m.phone);
      check(f.consent, !f.consent.checked, m.consent);
      if (first) first.focus();
      return ok;
    };

    f.phone.addEventListener('input', function () {
      var pos = f.phone.selectionStart, atEnd = pos === f.phone.value.length;
      f.phone.value = fmtPhone(f.phone.value);
      if (atEnd) f.phone.setSelectionRange(f.phone.value.length, f.phone.value.length);
    });
    ['name', 'phone', 'consent'].forEach(function (k) {
      f[k].addEventListener('input', function () { setErr(f[k], ''); });
      f[k].addEventListener('change', function () { setErr(f[k], ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      if (!validate()) return;

      var parts = [m.hi + clean(f.name.value, 60) + '.', m.tel + fmtPhone(f.phone.value) + '.'];
      if (f.age && f.age.value) parts.push(m.age + clean(f.age.value, 40) + '.');
      if (f.direction && f.direction.value) parts.push(m.dir + clean(f.direction.value, 60) + '.');
      var q = clean(f.message.value, 500);
      if (q) parts.push(m.q + q);
      parts.push(m.end);
      var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(parts.join(' '));

      // ссылка-кнопка надёжнее window.open: с 'noopener' он всегда возвращает null и блокировку не определить
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = m.link;
      a.style.display = 'none';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      status.textContent = m.ok + ' ';
      var again = document.createElement('a');          // если браузер не открыл вкладку сам
      again.href = url; again.target = '_blank'; again.rel = 'noopener noreferrer'; again.textContent = m.link;
      status.appendChild(again);
      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; }, 4000);
      form.reset();
    });
  });
})();
