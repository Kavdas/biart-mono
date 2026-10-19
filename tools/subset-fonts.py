# -*- coding: utf-8 -*-
"""Урезает фирменные шрифты до нужных символов: латиница, кириллица (включая
казахские буквы), пунктуация, стрелки, тенге. Всё остальное — греческий, иврит,
вьетнамский, пиктограммы — выбрасывается.

Исходники: fonts-src/*.woff2 (в сборку сайта не попадают)
Результат: theme/assets/fonts/*.woff2

Запуск: python tools/subset-fonts.py   (нужны fonttools и brotli)
"""
import os
import glob

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'fonts-src'
OUT = 'theme/assets/fonts'

# U+0400-04FF покрывает и русский, и казахский: ә ғ қ ң ө ұ ү һ і
UNICODES = (
    'U+0020-007E,'      # латиница, цифры, базовая пунктуация
    'U+00A0-00FF,'      # неразрывный пробел, «», °, ², ·, ×, акцентированная латиница
    'U+0400-04FF,'      # кириллица целиком
    'U+2010-2027,'      # тире, кавычки, многоточие, маркер списка
    'U+2030-203A,'      # ‰, ‹ ›
    'U+20B8,'           # ₸
    'U+2122,'           # ™
    'U+2190-2193'       # ← ↑ → ↓
)
FEATURES = 'kern,liga,clig,calt,locl,ccmp,mark,mkmk,rlig,onum,tnum,frac,sups'


# Вариативный шрифт несёт оси, которых на сайте нет: курсив, наклон, оптический
# размер. Курсивом не набираем нигде, оптический размер фиксируем под текстовые
# кегли, вес оставляем в используемом диапазоне — файл худеет втрое.
PIN = {'ital': 0, 'slnt': 0, 'opsz': 14, 'wght': (300, 800)}


def pin_axes(path: str) -> None:
    font = TTFont(path)
    if 'fvar' not in font:
        return
    have = {a.axisTag for a in font['fvar'].axes}
    pins = {k: v for k, v in PIN.items() if k in have}
    if not pins:
        return
    out = instancer.instantiateVariableFont(font, pins, inplace=False)
    out.flavor = 'woff2'
    out.save(path)


def main() -> None:
    files = sorted(glob.glob(os.path.join(SRC, '*.woff2')))
    if not files:
        raise SystemExit('Нет исходников в %s — положите туда полные woff2' % SRC)
    os.makedirs(OUT, exist_ok=True)
    was = now = 0
    for src in files:
        dst = os.path.join(OUT, os.path.basename(src))
        args = [
            src,
            '--output-file=' + dst,
            '--flavor=woff2',
            '--unicodes=' + UNICODES,
            '--layout-features=' + FEATURES,
            '--drop-tables+=DSIG',
            '--recalc-bounds',
            '--no-hinting',
        ]
        subset.main(args)
        pin_axes(dst)
        was += os.path.getsize(src)
        now += os.path.getsize(dst)
        print('%-22s %4d КБ → %3d КБ' % (os.path.basename(src),
                                         os.path.getsize(src) // 1024,
                                         os.path.getsize(dst) // 1024))
    print('итого: %d КБ → %d КБ (−%.0f%%)' % (was // 1024, now // 1024, 100 * (1 - now / was)))


if __name__ == '__main__':
    main()
