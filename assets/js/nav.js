/* Мобильное меню: кнопка-бургер открывает панель с навигацией шапки.
   Без JS на телефоне остаются логотип, язык и CTA. */
(function () {
  /* тёмный первый экран: шапка прозрачная, пока страница не прокручена */
  if (document.querySelector('.hero')) {
    document.body.classList.add('has-dark-hero');
    var onScroll = function () {
      document.body.classList.toggle('is-scrolled', window.scrollY > 24);
      // плавающая кнопка записи появляется, когда первый экран ушёл вверх:
      // на самом хиро своя кнопка, две сразу не нужны
      document.body.classList.toggle('is-past-hero', window.scrollY > window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    // на страницах без хиро (оферта, политика, 404) конкурирующей кнопки нет — показываем сразу
    document.body.classList.add('is-past-hero');
  }
  var header = document.querySelector('.site-header');
  var nav = header && header.querySelector('.nav');
  if (!header || !nav) return;

  var isKz = document.documentElement.lang === 'kk';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'site-nav');
  btn.setAttribute('aria-label', isKz ? 'Мәзір' : 'Меню');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.id = 'site-nav';
  // кнопка встаёт в разметке ПЕРЕД меню, а вправо её двигает order в CSS:
  // если она идёт после меню, Tab из неё уходит мимо открытой панели
  header.querySelector('.wrap').insertBefore(btn, nav);

  var close = function () {
    header.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  btn.addEventListener('click', function () {
    var open = !header.classList.contains('is-open');
    header.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  // порог тот же, что у бургера в CSS: выше него меню снова в строке,
  // и открытая панель висела бы поверх неё
  window.addEventListener('resize', function () { if (window.innerWidth > 1180) close(); });
})();
