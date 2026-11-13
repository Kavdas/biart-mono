# -*- coding: utf-8 -*-
"""Страница аренды «BIART (Music Hall) Space»: theme/content/rent.html и rent-kz.html (нативные блоки).

python3 tools/build-rent.py        затем: npm run seed

Тексты — здесь. Правило раскадровки ролика: никаких цифр вместимости и характеристик, которых нет на фото
или у владельца. Подписи к снимкам берутся из tools/build-images.py (RENT).
"""
import importlib.util
import os

ROOT = os.path.join(os.path.dirname(__file__), '..')
spec = importlib.util.spec_from_file_location('bi', os.path.join(ROOT, 'tools', 'build-images.py'))
bi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bi)

TH = '/wp-content/themes/biart-mono/assets/'
WA = {'ru': 'https://wa.me/77007103300?text=Здравствуйте!%20Хочу%20арендовать%20пространство%20BIART',
      'kk': 'https://wa.me/77007103300?text=Сәлеметсіз%20бе!%20BIART%20кеңістігін%20жалға%20алғым%20келеді'}

L = {
 'ru': {
  'eyebrow': 'Аренда · Астана', 'h1': 'BIART <em>(Music Hall)</em> Space',
  'lead': 'Концертный зал, студии, классы и общие зоны школы — для конференций, концертов, спектаклей и ваших событий.',
  'b1': 'Арендовать пространство', 'b2': 'Смотреть зал',
  'stats': [('500', 'учеников обучаются в школе, ежемесячно участвуют в конкурсах и мюзиклах'), ('8+', 'лет экспертности — средний стаж работы наших преподавателей'),
            ('25+', 'преподавателей — действующие музыканты, артисты, хореографы и digital-художники'), ('5000 м²', 'собственного пространства: музыкальные студии, танцевальные залы, digital-лаборатории, своя сцена')],
  'intro': 'Для учащихся работают профессиональные студии звукозаписи, подкастинга и диджеинга. Мы готовим к международным музыкальным конкурсам и реализуем творческие проекты. Мы входим в образовательную экосистему холдинга BI Group.',
  'ev_t': 'Для каких <em>событий</em>',
  'ev': [('01', 'Конференции и QBR', 'Зал с экраном на сцене и светом — для докладов, презентаций и встреч команд.', 'r-1441'),
         ('02', 'Концерты', 'Сцена, свет и звук для концертов, сольных выступлений и творческих вечеров.', 'r-1443'),
         ('03', 'Спектакли', 'Театральные постановки и мюзиклы: сцена с кулисами, зал со зрительскими рядами.', 'r-1572'),
         ('04', 'Ваше событие', 'Студии, классы и общие зоны школы — напишите, что планируете: подберём формат и помещения.', 'r-1557')],
  'vid_t': 'Один зал — <em>три сценария</em>', 'vid_l': 'Конференция, концерт, спектакль: смотрите, как зал меняется светом и картинкой на экране сцены.',
  'vid_btn': 'Смотреть со звуком',
  'tech_t': 'Технологии и <em>устройства</em>', 'tech_l': 'Профессиональное оборудование для сцены, записи и обучения. Фото — реальные помещения школы.',
  'tech': [('r-1443', 'Сцена и экран', 'Сцена с кулисами и большим экраном, световые фермы над залом.'), ('r-1664', 'Студия звукозаписи', 'Профессиональная студия звукозаписи, подкастинга и диджеинга.'),
           ('r-1453', 'Музыкальные студии', 'Барабаны, цифровые пианино, аппаратура для репетиций.'), ('r-1620', 'Digital-лаборатории', 'Классы с компьютерами и планшетами для цифрового творчества.')],
  's360_t': '360° <em>иммерсивный звук</em>', 's360_l': 'Готовим демонстрацию объёмного звука в зале. Как только запись будет готова, она появится здесь — с возможностью послушать в наушниках.',
  's360_s': 'Скоро',
  'gal_t': 'Все <em>помещения</em>', 'gal_l': 'Нажмите на фото, чтобы рассмотреть помещение. Листать — стрелками или свайпом.',
  'cats': [('all', 'Все'), ('hall', 'Зал и сцена'), ('studio', 'Студии'), ('class', 'Классы'), ('common', 'Общие зоны')],
  'press_t': 'О нас <em>пишут</em>', 'press_l': 'Публикации СМИ о школе BIART.',
  'cta_t': 'Проведите событие <em>у нас</em>', 'cta_l': 'Оставьте заявку — менеджер свяжется с вами, обсудит дату и формат и покажет помещения.',
  'cta_b': 'Арендовать пространство',
 },
 'kk': {
  'eyebrow': 'Жалға беру · Астана', 'h1': 'BIART <em>(Music Hall)</em> Space',
  'lead': 'Концерт залы, студиялар, сыныптар және мектептің ортақ аймақтары — конференцияларға, концерттерге, спектакльдерге және сіздің іс-шараларыңызға.',
  'b1': 'Кеңістікті жалға алу', 'b2': 'Залды көру',
  'stats': [('500', 'оқушы мектепте оқиды, ай сайын байқаулар мен мюзиклдерге қатысады'), ('8+', 'жылдық сараптама — оқытушыларымыздың орташа жұмыс өтілі'),
            ('25+', 'оқытушы — жұмыс істеп жүрген музыканттар, әртістер, хореографтар және digital-суретшілер'), ('5000 м²', 'жеке кеңістік: музыка студиялары, би залдары, digital-зертханалар, өз сахнамыз')],
  'intro': 'Оқушылар үшін кәсіби дыбыс жазу, подкастинг және диджейинг студиялары жұмыс істейді. Біз халықаралық музыкалық байқауларға дайындаймыз және шығармашылық жобаларды іске асырамыз. Біз BI Group холдингінің білім беру экожүйесіне кіреміз.',
  'ev_t': 'Қандай <em>іс-шараларға</em>',
  'ev': [('01', 'Конференциялар мен QBR', 'Сахнада экраны және жарығы бар зал — баяндамаларға, презентацияларға және команда кездесулеріне.', 'r-1441'),
         ('02', 'Концерттер', 'Концерттерге, жеке өнерге және шығармашылық кештерге арналған сахна, жарық және дыбыс.', 'r-1443'),
         ('03', 'Спектакльдер', 'Театр қойылымдары мен мюзиклдер: кулисалы сахна, көрермен қатарлары бар зал.', 'r-1572'),
         ('04', 'Сіздің іс-шараңыз', 'Мектептің студиялары, сыныптары және ортақ аймақтары — не жоспарлағаныңызды жазыңыз: формат пен үй-жайларды таңдаймыз.', 'r-1557')],
  'vid_t': 'Бір зал — <em>үш сценарий</em>', 'vid_l': 'Конференция, концерт, спектакль: зал жарықпен және сахна экранындағы суретпен қалай өзгеретінін көріңіз.',
  'vid_btn': 'Дыбыспен көру',
  'tech_t': 'Технологиялар мен <em>құрылғылар</em>', 'tech_l': 'Сахнаға, жазуға және оқуға арналған кәсіби жабдық. Фото — мектептің нақты үй-жайлары.',
  'tech': [('r-1443', 'Сахна және экран', 'Кулисалары және үлкен экраны бар сахна, зал үстіндегі жарық фермалары.'), ('r-1664', 'Дыбыс жазу студиясы', 'Дыбыс жазу, подкастинг және диджейинг кәсіби студиясы.'),
           ('r-1453', 'Музыка студиялары', 'Барабандар, цифрлық фортепианолар, жаттығуға арналған аппаратура.'), ('r-1620', 'Digital-зертханалар', 'Цифрлық шығармашылыққа арналған компьютерлері мен планшеттері бар сыныптар.')],
  's360_t': '360° <em>иммерсивті дыбыс</em>', 's360_l': 'Залдағы көлемді дыбыс демонстрациясын дайындап жатырмыз. Жазба дайын болысымен осында шығады — құлаққаппен тыңдауға болады.',
  's360_s': 'Жақында',
  'gal_t': 'Барлық <em>үй-жайлар</em>', 'gal_l': 'Үй-жайды қарау үшін фотоға басыңыз. Жылжыту — көрсеткілермен немесе свайппен.',
  'cats': [('all', 'Барлығы'), ('hall', 'Зал және сахна'), ('studio', 'Студиялар'), ('class', 'Сыныптар'), ('common', 'Ортақ аймақтар')],
  'press_t': 'Біз туралы <em>жазады</em>', 'press_l': 'BIART мектебі туралы БАҚ жарияланымдары.',
  'cta_t': 'Іс-шараны <em>бізде</em> өткізіңіз', 'cta_l': 'Өтінім қалдырыңыз — менеджер сізбен байланысып, күні мен форматын талқылап, үй-жайларды көрсетеді.',
  'cta_b': 'Кеңістікті жалға алу',
 }}


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')


def para(cls, html):
    return f'<!-- wp:paragraph {{"className":"{cls}"}} --><p class="{cls}">{html}</p><!-- /wp:paragraph -->'


def head(level, cls, html):
    lv = '' if level == 2 else f'"level":{level},'
    return f'<!-- wp:heading {{{lv}"className":"{cls}"}} --><h{level} class="wp-block-heading {cls}">{html}</h{level}><!-- /wp:heading -->'


def group(cls, inner, tag=None):
    t = tag or 'div'
    tg = f'"tagName":"{tag}",' if tag else ''
    return f'<!-- wp:group {{{tg}"className":"{cls}","layout":{{"type":"default"}}}} -->\n<{t} class="wp-block-group {cls}">\n{inner}\n</{t}>\n<!-- /wp:group -->'


def section(anchor, cls, inner):
    return (f'<!-- wp:group {{"tagName":"section","anchor":"{anchor}","className":"section {cls}","layout":{{"type":"default"}},"templateLock":"contentOnly"}} -->\n'
            f'<section class="wp-block-group section {cls}" id="{anchor}">\n{inner}\n</section>\n<!-- /wp:group -->\n')


def btn(txt, href, cls='btn-primary'):
    return (f'<!-- wp:button {{"className":"{cls}"}} -->\n<div class="wp-block-button {cls}"><a class="wp-block-button__link wp-element-button" href="{href}">{txt}</a></div>\n<!-- /wp:button -->')


def buttons(cls, items):
    return f'<!-- wp:buttons {{"className":"{cls}"}} -->\n<div class="wp-block-buttons {cls}">\n' + '\n'.join(items) + '\n</div>\n<!-- /wp:buttons -->'


def photo(code_or_name, alt, cls, link=False):
    name = code_or_name if code_or_name.startswith('r-') else 'r-' + code_or_name
    from PIL import Image
    w, h = Image.open(os.path.join(ROOT, 'theme', 'assets', 'img', name + '.webp')).size
    img = f'<img width="{w}" height="{h}" decoding="async" loading="lazy" src="{TH}img/{name}.webp" alt="{esc(alt)}"/>'
    if link:
        img = f'<a href="{TH}img/{name}.webp">{img}</a>'
    return f'<!-- wp:image {{"className":"{cls}"}} -->\n<figure class="wp-block-image {cls}">{img}</figure>\n<!-- /wp:image -->'


def video(kind, **kw):
    poster = TH + 'video/hall-poster.jpg'
    src = TH + 'video/hall-1280.mp4'
    if kind == 'bg':
        bp, bs = TH + 'video/hall-bg-poster.jpg', TH + 'video/hall-bg.mp4'
        return (f'<!-- wp:video {{"loop":true,"muted":true,"playsInline":true,"poster":"{bp}","src":"{bs}","className":"rent-bg"}} -->\n'
                f'<figure class="wp-block-video rent-bg"><video loop muted playsinline preload="none" poster="{bp}" src="{bs}"></video></figure>\n<!-- /wp:video -->')
    return (f'<!-- wp:video {{"controls":true,"playsInline":true,"preload":"none","poster":"{poster}","src":"{src}","className":"rent-player"}} -->\n'
            f'<figure class="wp-block-video rent-player"><video controls playsinline preload="none" poster="{poster}" src="{src}"></video></figure>\n<!-- /wp:video -->')


def stat(n, t):
    return f'<!-- wp:column {{"className":"stat"}} -->\n<div class="wp-block-column stat">\n{para("stat-num", n)}\n{para("stat-txt", t)}\n</div>\n<!-- /wp:column -->'


def build(lang):
    t = L[lang]
    kk = lang == 'kk'
    pi = 1 if kk else 2
    gal_alt = 3 if kk else 2
    # 1. первый экран: видеофон
    hero = section('rent-top', 'rent-hero', group('rent-hero-inner', '\n'.join([
        video('bg'),
        group('rent-hero-text wrap', '\n'.join([
            para('eyebrow', t['eyebrow']), head(1, 'rent-title', t['h1']), para('rent-lead', t['lead']),
            buttons('rent-actions', [btn(t['b1'], '#rent-form'), btn(t['b2'], '#rent-video', 'is-style-outline btn-ghost')])]))])))
    # 2. цифры + текст
    stats = section('rent-about', 'rent-about', group('wrap', '\n'.join([
        para('lead is-orange', t['intro']),
        '<!-- wp:columns {"className":"stats"} -->\n<div class="wp-block-columns stats">\n' + '\n'.join(stat(n, x) for n, x in t['stats']) + '\n</div>\n<!-- /wp:columns -->'])))
    # 3. события
    cards = '\n'.join(group('rent-card', photo(code, ttl, 'rent-card-ph') + '\n' + para('rent-card-n', f'[{n}]') + '\n' + head(3, 'rent-card-t', ttl) + '\n' + para('rent-card-d', d))
                      for n, ttl, d, code in t['ev'])
    events = section('rent-events', 'rent-events', group('wrap', head(2, 'section-title', t['ev_t']) + '\n' + group('rent-cards', cards)))
    # 4. видеоплеер
    player = section('rent-video', 'rent-video', group('wrap', '\n'.join([
        head(2, 'section-title', t['vid_t']), para('section-lead', t['vid_l']), group('rent-player-wrap', video('player'))])))
    # 5. технологии
    tcards = '\n'.join(group('tech-card', photo(code, ttl, 'tech-ph') + '\n' + head(3, 'tech-t', ttl) + '\n' + para('tech-d', d)) for code, ttl, d in t['tech'])
    tech = section('rent-tech', 'rent-tech', group('wrap', head(2, 'section-title', t['tech_t']) + '\n' + para('section-lead', t['tech_l']) + '\n' + group('tech-grid', tcards)))
    # 6. 360° звук (заглушка до материалов)
    s360 = section('rent-360', 'rent-360', group('wrap', group('s360', '\n'.join([
        para('s360-badge', t['s360_s']), head(2, 'section-title', t['s360_t']), para('section-lead', t['s360_l'])]))))
    # 7. галерея
    filt = buttons('gal-filter', [btn(lbl, '#gal-' + key, 'is-style-outline') for key, lbl in t['cats']])
    figs = '\n'.join(photo(code, (cap_kz if kk else cap_ru), f'gal-item cat-{cat}', link=True) for code, cat, cap_ru, cap_kz in bi.RENT)
    gallery = section('rent-gallery', 'rent-gallery', group('wrap', head(2, 'section-title', t['gal_t']) + '\n' + para('section-lead', t['gal_l']) + '\n' + filt + '\n' + group('gal-grid', figs)))
    # 8. СМИ (скрыт, пока нет ссылок)
    press = section('rent-press', 'rent-press is-empty', group('wrap', head(2, 'section-title', t['press_t']) + '\n' + para('section-lead', t['press_l']) + '\n' + group('press-slots', para('press-slot', ''))))
    # 9. заявка
    cta = section('rent-form', 'rent-cta', group('wrap rent-cta-card', '\n'.join([
        group('rent-cta-text', head(2, 'section-title', t['cta_t']) + '\n' + para('section-lead', t['cta_l']) + '\n' + buttons('rent-actions', [btn(t['cta_b'], WA[lang])])),
        group('rent-cta-form', f'<!-- wp:shortcode -->\n[biart_form variant="rent"{" lang=\"kk\"" if kk else ""}]\n<!-- /wp:shortcode -->')])))
    return '\n'.join([hero, stats, events, player, tech, s360, gallery, press, cta])


if __name__ == '__main__':
    for lang, fn in (('ru', 'rent.html'), ('kk', 'rent-kz.html')):
        s = build(lang)
        open(os.path.join(ROOT, 'theme', 'content', fn), 'w', encoding='utf-8').write(s)
        print(fn, len(s) // 1024, 'КБ')
