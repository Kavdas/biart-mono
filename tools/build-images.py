# -*- coding: utf-8 -*-
"""Пересборка всех картинок темы из оригиналов (theme/assets/img).

python3 tools/build-images.py            # всё
python3 tools/build-images.py photos     # только фото (photos | illus | logo | icons | og)

Почему так. Раньше сайт показывал уменьшенные копии (900–1000 px) в карточках, которые
на экране с плотностью 2–3× требуют 1200–2000 px, и фото выглядели мыльными. Теперь каждое
фото собирается ИЗ ОРИГИНАЛА набором ширин 480–2000 px (WebP, без увеличения сверх оригинала),
а иллюстрации — из векторных 4500-пиксельных PNG бренд-пакета. Вертикальные кадры афиши режутся
CSS из горизонтальных, поэтому сайт берёт для них ширину с запасом (см. sizes в inc/assets.php).

Источники (по умолчанию — соседний основной проект ../BIART, путь меняется ASSETS_ROOT):
  Photos/            — оригиналы 3000–6000 px;
  photos-src/        — JPEG 1400–2560 px (кадры, которых нет в Photos: фасад, команда);
  Visual assets/     — иллюстрации и логотип брендбука.
"""
import glob
import os
import re
import subprocess
import sys

from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.abspath(os.environ.get('ASSETS_ROOT', os.path.join(os.path.dirname(__file__), '..', '..', 'BIART')))
PHOTOS = os.path.join(ROOT, 'Photos')
SRC = os.path.join(ROOT, 'photos-src')
VIS = os.path.join(ROOT, 'Visual assets')
OUT = os.path.join(os.path.dirname(__file__), '..', 'theme', 'assets', 'img')
WIDTHS = (480, 800, 1200, 1600, 2000)
Q = 82

# имя в теме -> оригинал
PHOTO_MAP = {
    # залы (3000×2000)
    'g1441': PHOTOS + '/0DAN1441.jpg', 'g1443': PHOTOS + '/0DAN1443.jpg', 'g1620': PHOTOS + '/0DAN1620.jpg', 'g1628': PHOTOS + '/0DAN1628.jpg',
    'g1591': PHOTOS + '/0DAN1591.jpg', 'g1457': PHOTOS + '/0DAN1457.jpg', 'g1512': PHOTOS + '/0DAN1512.jpg', 'g1453': PHOTOS + '/0DAN1453.jpg',
    'g1461': PHOTOS + '/0DAN1461.jpg', 'g1557': PHOTOS + '/0DAN1557.jpg', 'g1560': PHOTOS + '/0DAN1560.jpg',
    # события (4096–6000 px)
    'ev-drama': PHOTOS + '/drama.jpg', 'ev-poster': PHOTOS + '/fromivent.jpg', 'ev-piano': PHOTOS + '/piano.jpg', 'ev-final': PHOTOS + '/theend.jpg',
    'ev-chgk-main': PHOTOS + '/4a84a22dfee1db10ae4ca0017aa5f88f.jpg', 'ev-chgk-stage': PHOTOS + '/dfbc4f589db72f88b03f62bfea134acb.jpg',
    'ev-chgk-team': PHOTOS + '/103b104f22f9846b5545126ddd14c5bd.jpg', 'ev-chgk-think': PHOTOS + '/537e9a1d2a3f506e684df8eac77cd65b.jpg',
    # кадры, которых нет в Photos (1920 px — максимум, что есть)
    'ph-facade': SRC + '/hero-facade.jpg',
    # команда (1707×2560)
    'team-ibraev': SRC + '/team-ibraev.jpg', 'team-bekmadieva': SRC + '/team-bekmadieva.jpg',
    'team-usmanov': SRC + '/team-usmanov.jpg', 'team-musina': SRC + '/team-musina.jpg',
}
# кадрирование долей оригинала (x0, y0, x1, y1): в полный рост Расул рядом с портретами по грудь выглядел бы крошечным
PHOTO_CROP = {'team-usmanov': (0.145, 0.17, 0.825, 0.805)}
# иллюстрации: имя -> страница 4500×5000 бренд-пакета
ILLU_MAP = {'illu-music': 1, 'illu-dance': 2, 'illu-digital': 3, 'illu-acting': 4,
            'char-music': 6, 'char-dance': 7, 'char-digital': 8, 'char-acting': 9}
ILLU_WIDTHS = (360, 640, 1000, 1600)


def sharpen(im):
    # после уменьшения Lanczos снимает лёгкую мягкость; радиус мал, чтобы не появились ореолы
    return im.filter(ImageFilter.UnsharpMask(radius=0.7, percent=45, threshold=2))


def photos():
    made = 0
    for name, path in PHOTO_MAP.items():
        if not os.path.exists(path):
            print('нет оригинала:', path)
            continue
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode != 'RGB':
                im = im.convert('RGB')
            if name in PHOTO_CROP:
                fx0, fy0, fx1, fy1 = PHOTO_CROP[name]
                im = im.crop((round(fx0 * im.width), round(fy0 * im.height), round(fx1 * im.width), round(fy1 * im.height)))
            w, h = im.size
            for old in glob.glob(f'{OUT}/{name}-*w.webp') + [f'{OUT}/{name}.webp']:
                if os.path.exists(old):
                    os.remove(old)
            widths = sorted({min(x, w) for x in WIDTHS})
            if widths[-1] < WIDTHS[-1] and w > widths[-1]:
                widths.append(w)
            top = widths[-1]
            for tw in widths:
                th = round(h * tw / w)
                r = im if tw == w else sharpen(im.resize((tw, th), Image.LANCZOS))
                dest = f'{OUT}/{name}.webp' if tw == top else f'{OUT}/{name}-{tw}w.webp'
                r.save(dest, 'WEBP', quality=Q, method=6)
                made += 1
            print(f'{name}: {w}×{h} -> {widths} (основной {top}w, {os.path.getsize(f"{OUT}/{name}.webp") // 1024} KB)')
    print('фото, файлов:', made)


def illus():
    for name, page in ILLU_MAP.items():
        src = f'{VIS}/illustrations/png/illustrations+lettering-{page:02d}.png'
        if not os.path.exists(src):
            print('нет иллюстрации:', src)
            continue
        with Image.open(src) as im:
            im = im.convert('RGBA')
            bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
            pad = round(max(im.size) * 0.004)
            bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
            im = im.crop(bbox)
            w, h = im.size
            for old in glob.glob(f'{OUT}/{name}-*w.webp') + [f'{OUT}/{name}.webp']:
                if os.path.exists(old):
                    os.remove(old)
            for tw in ILLU_WIDTHS:
                th = round(h * tw / w)
                r = im.resize((tw, th), Image.LANCZOS)
                dest = f'{OUT}/{name}.webp' if tw == ILLU_WIDTHS[-1] else f'{OUT}/{name}-{tw}w.webp'
                r.save(dest, 'WEBP', quality=90, alpha_quality=100, method=6)
            print(f'{name}: {w}×{h} -> {ILLU_WIDTHS} ({os.path.getsize(f"{OUT}/{name}.webp") // 1024} KB)')


def logo():
    """Векторный логотип из PDF брендбука: белые контуры букв B I A R T -> logo.svg (чёрный) и logo-white.svg."""
    pdf = f'{VIS}/logotype/BIART_logo.pdf'
    tmp = '/tmp/biart_logo_raw.svg'
    subprocess.run(['pdftocairo', '-svg', pdf, tmp], check=True)
    s = open(tmp, encoding='utf-8').read()
    paths = re.findall(r'<path fill-rule="nonzero" fill="rgb\(100%, 100%, 100%\)" fill-opacity="1" d="([^"]+)"', s)[:5]
    xs, ys = [], []
    for d in paths:
        nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
        xs += nums[0::2]
        ys += nums[1::2]
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    vb = f'{x0:.2f} {y0:.2f} {x1 - x0:.2f} {y1 - y0:.2f}'
    for name, color in (('logo', '#000000'), ('logo-white', '#ffffff')):
        body = ''.join(f'<path fill="{color}" d="{d}"/>' for d in paths)
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="BIART">{body}</svg>\n'
        open(f'{OUT}/{name}.svg', 'w', encoding='utf-8').write(svg)
        print(f'{name}.svg {len(svg) // 1024 or 1} KB viewBox {vb}')
    # растровый логотип для микроразметки (JSON-LD просит PNG/JPG): чёрная версия брендбука
    src = f'{VIS}/logotype/png/BIART_logotype-02.png'
    if os.path.exists(src):
        with Image.open(src) as im:
            im = im.convert('RGBA')
            im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())
            im = im.resize((800, round(im.height * 800 / im.width)), Image.LANCZOS)
            im.save(f'{OUT}/logo.png', optimize=True)
            print('logo.png', im.size)


# картинки школы с детьми (иллюстрации, не фото): исходные PNG лежат в photos-src/ копии проекта
KIDS_MAP = {
    'il-creative': 'Дети в творческом пространстве BIART.png', 'il-corridor': 'Дети в ярком арт-коридоре школы.png',
    'il-dance': 'Дети на занятии в танцевальной студии.png', 'il-music': 'Дети на музыкальной репетиции в студии.png',
    'il-ensemble': 'Казахский ансамбль в музыкальном классе.png', 'il-guitars': 'Музыкальный урок среди ярких гитар.png',
    'il-hall': 'Холл диван_resized.jpg', 'il-violin': 'Юная скрипачка на фоне музыкального мурала.png',
}


def kids():
    import unicodedata
    base = os.path.join(os.path.dirname(__file__), '..', 'photos-src')
    files = {unicodedata.normalize('NFC', f): f for f in os.listdir(base)}
    for name, fn in KIDS_MAP.items():
        f = files.get(unicodedata.normalize('NFC', fn))
        if not f:
            print('нет файла:', fn)
            continue
        with Image.open(os.path.join(base, f)) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            w, h = im.size
            for old in glob.glob(f'{OUT}/{name}*.webp'):
                os.remove(old)
            widths = sorted({min(x, w) for x in (480, 800, 1200, 1500)})
            for tw in widths:
                r = im if tw == w else sharpen(im.resize((tw, round(h * tw / w)), Image.LANCZOS))
                dest = f'{OUT}/{name}.webp' if tw == widths[-1] else f'{OUT}/{name}-{tw}w.webp'
                r.save(dest, 'WEBP', quality=84, method=6)
            print(f'{name}: {w}×{h} -> {widths}, {os.path.getsize(f"{OUT}/{name}.webp") // 1024} KB')


def icons():
    """Значки сайта — фирменные цветные, из основного проекта."""
    for f in ('favicon.ico', 'favicon-32.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'):
        src = os.path.join(ROOT, 'theme', 'assets', 'img', f)
        if os.path.exists(src):
            open(f'{OUT}/{f}', 'wb').write(open(src, 'rb').read())
            print('значок', f)


def og():
    """Картинка для превью ссылки 1200×630: белая карточка, оранжевый курсив, цветные персонажи."""
    from PIL import ImageDraw, ImageFont
    fonts = os.path.join(os.path.dirname(__file__), '..', 'fonts-src')
    f_caps = ImageFont.truetype(f'{fonts}/InterTight-900.ttf', 132)
    f_it = ImageFont.truetype(f'{fonts}/PlayfairItalic-400.ttf', 150)
    f_mono = ImageFont.truetype(f'{fonts}/JetBrainsMono-500.ttf', 21)
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), '#ffffff')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((24, 24, W - 24, H - 24), radius=44, outline='#000000', width=3)
    d.rounded_rectangle((78, 70, 78 + 560, 70 + 46), radius=23, outline='#242c6c', width=2)
    d.rectangle((98, 89, 106, 97), fill='#242c6c')
    d.text((122, 80), 'ШКОЛА КРЕАТИВНЫХ ИНДУСТРИЙ · АСТАНА', font=f_mono, fill='#242c6c')
    d.text((74, 160), 'НАЙДИ СВОЙ', font=f_caps, fill='#000000')
    d.text((80, 292), 'голос!', font=f_it, fill='#db4d37')
    d.text((80, 520), 'BIART  ·  музыка · танец · театр · digital', font=f_mono, fill='#5d5d5d')
    art = Image.open(f'{OUT}/char-acting-640w.webp').convert('RGBA')
    art = art.resize((520, round(art.height * 520 / art.width)), Image.LANCZOS)
    im.paste(art, (W - art.width - 56, H - art.height - 26), art)
    im.save(f'{OUT}/og.jpg', quality=90, optimize=True, progressive=True)
    print('og.jpg 1200×630')


if __name__ == '__main__':
    steps = sys.argv[1:] or ['photos', 'illus', 'logo', 'icons', 'og', 'kids']
    for s in steps:
        {'photos': photos, 'illus': illus, 'logo': logo, 'icons': icons, 'og': og, 'kids': kids}[s]()
