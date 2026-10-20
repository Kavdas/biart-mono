# -*- coding: utf-8 -*-
"""Статичный слепок сайта для демо (GitHub Pages / Netlify / Artifact).
python tools/export-static.py  ->  dist/index.html (RU), dist/kz/index.html (KZ), dist/assets, dist/style.css
"""
import glob, os, re, shutil, stat, urllib.request

BASE = 'http://localhost:8890'
# публичный адрес демо: нужен для og:url / og:image. Меняется переменной SITE_URL
SITE = os.environ.get('SITE_URL', 'https://kavdas.github.io/biart-mono/')
THEME = '/wp-content/themes/biart-mono/'
OUT = 'dist'
# Скрипты темы одним куском. Список собирается из папки, а не руками:
# дважды забывал дописать сюда новый файл, и на демо не работало то,
# что локально работало.
THEME_JS = sorted(glob.glob('theme/assets/js/*.js'))
CAROUSEL_JS = chr(10).join(open(f, encoding='utf-8').read() for f in THEME_JS)


# Версия стилей в адресе: без неё вернувшийся посетитель видит старый CSS
# из кэша браузера. На самом WordPress это делает ?ver=filemtime в functions.php,
# а в статичном слепке ссылка была голой.
CSS_VER = str(int(os.path.getmtime('theme/style.css')))
CSS = None  # текст стилей, снимается с первой страницы


def export(path, out_file, prefix):
    """prefix — относительный путь к корню dist от страницы ('' для корня, '../' для /kz/)."""
    html = urllib.request.urlopen(BASE + path).read().decode('utf-8')

    # стили темы — одним <link>, стили WP уже инлайновые; скрипты и служебные <link> не нужны.
    # WordPress отдаёт сжатую копию style.css из uploads (inc/assets.php) — её и берём.
    global CSS
    m = re.search(r"<link rel='stylesheet' id='biart-style-css' href='([^']+)'", html)
    if CSS is None and m:
        CSS = urllib.request.urlopen(m.group(1).replace('&#038;', '&')).read().decode('utf-8')
    html = re.sub(r"<link rel='stylesheet' id='biart-style-css'[^>]*/>",
                  '<link rel="stylesheet" href="%sstyle.css?v=%s">' % (prefix, CSS_VER), html)
    html = re.sub(r"<link rel='stylesheet'[^>]*/>", '', html)
    # JSON-LD оставляем: это данные для поиска, а не исполняемый скрипт
    html = re.sub(r'<script\b(?![^>]*application/ld\+json)[^>]*>.*?</script>', '', html, flags=re.S)
    # скрипт фото-карусели — инлайном перед </body> (внешние скрипты WP не нужны)
    html = html.replace('</body>', '<script>' + chr(10) + CAROUSEL_JS + chr(10) + '</script>' + chr(10) + '</body>')
    # rel=alternate у WP — это oEmbed и JSON API, но им же помечены hreflang-ссылки:
    # отбрасываем только те, у которых нет hreflang
    html = re.sub(r'<link(?![^>]*hreflang)[^>]+rel=["\']?(preload|modulepreload|dns-prefetch|EditURI|alternate|wlwmanifest|https://api\.w\.org/)[^>]*>', '', html)

    # переключатель языка и логотип -> относительные ссылки между страницами
    html = html.replace('href="%s/kz/"' % BASE, 'href="%s"' % ('./' if prefix else 'kz/'))
    html = html.replace('href="/kz/"', 'href="%s"' % ('./' if prefix else 'kz/'))
    html = html.replace('href="%s/"' % BASE, 'href="%s"' % (prefix or './'))
    html = html.replace('href="/"', 'href="%s"' % (prefix or './'))
    html = html.replace('href="/privacy-policy/"', 'href="%sprivacy-policy/"' % (prefix or './'))
    html = html.replace('href="/dogovor-oferty-sertifikata/"', 'href="%sdogovor-oferty-sertifikata/"' % (prefix or './'))
    html = html.replace('href="/dogovor-publichnoj-oferty/"', 'href="%sdogovor-publichnoj-oferty/"' % (prefix or './'))
    # без закрывающей кавычки: адрес бывает и с якорем — /raspisanie/#11-13
    html = html.replace('href="/raspisanie/', 'href="%sraspisanie/' % (prefix or './'))
    html = html.replace('href="/raspisanie-kz/', 'href="%sraspisanie-kz/' % (prefix or './'))
    # якоря меню абсолютные, чтобы работать с внутренних страниц
    html = re.sub(r'href="/kz/#', 'href="%skz/#' % (prefix or './'), html)
    html = re.sub(r'href="/#', 'href="%s#' % (prefix or './'), html)

    # ассеты темы -> относительные
    html = html.replace(BASE + THEME, prefix).replace(THEME, prefix)
    html = html.replace(BASE + '/', prefix or './').replace(BASE, prefix or './')

    # превью ссылки (Telegram, WhatsApp, соцсети) требует абсолютных адресов
    page_url = SITE + path.lstrip('/')
    html = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + page_url, html)
    html = re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*', lambda m: m.group(1) + SITE + 'assets/img/og.jpg', html)
    if 'rel="canonical"' not in html:
        html = html.replace('</head>', '<link rel="canonical" href="%s">\n</head>' % page_url, 1)

    os.makedirs(os.path.dirname(out_file) or '.', exist_ok=True)
    open(out_file, 'w', encoding='utf-8').write(html)


def _rw(func, path, _):  # read-only файлы .git на Windows
    os.chmod(path, stat.S_IWRITE)
    func(path)


if os.path.exists(OUT):
    shutil.rmtree(OUT, onerror=_rw)
os.makedirs(OUT)
export('/', f'{OUT}/index.html', '')
export('/kz/', f'{OUT}/kz/index.html', '../')
export('/dogovor-publichnoj-oferty/', f'{OUT}/dogovor-publichnoj-oferty/index.html', '../')
export('/privacy-policy/', f'{OUT}/privacy-policy/index.html', '../')
export('/dogovor-oferty-sertifikata/', f'{OUT}/dogovor-oferty-sertifikata/index.html', '../')
export('/raspisanie/', f'{OUT}/raspisanie/index.html', '../')
export('/raspisanie-kz/', f'{OUT}/raspisanie-kz/index.html', '../')
shutil.copytree('theme/assets', f'{OUT}/assets')
# пути в сжатой копии от корня сайта (/wp-content/themes/biart-mono/assets/…) -> от dist/style.css
open(f'{OUT}/style.css', 'w', encoding='utf-8').write(CSS.replace(THEME, '') if CSS else open('theme/style.css', encoding='utf-8').read())
open(f'{OUT}/.nojekyll', 'w').close()

size = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs) // 1024
print('dist ready:', size, 'KB')
