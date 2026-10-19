# -*- coding: utf-8 -*-
"""Уменьшенные копии фото для srcset: name.webp -> name-480w.webp, name-800w.webp.
python3 tools/make-responsive.py

Копия делается, только если она заметно уже оригинала (меньше 85% его ширины):
800w от фото в 900 px почти ничего не экономит. Готовые копии новее оригинала
не пересобираются. Подключает их к страницам inc/images.php.
"""
import glob, os
from PIL import Image

IMG = 'theme/assets/img'
WIDTHS = (480, 800)
MIN_SRC = 760  # мелкие картинки (иконки, леттеринг, портреты) копий не получают

made = 0
for src in sorted(glob.glob(f'{IMG}/*.webp')):
    name = os.path.basename(src)[:-5]
    if name.endswith('w') and name.rsplit('-', 1)[-1][:-1].isdigit():
        continue  # это сама копия
    with Image.open(src) as im:
        w, h = im.size
        if w < MIN_SRC:
            continue
        for tw in WIDTHS:
            if tw >= w * 0.85:
                continue
            out = f'{IMG}/{name}-{tw}w.webp'
            if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
                continue
            im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
            made += 1
            print(f'{out}  {os.path.getsize(out) // 1024} KB  (оригинал {os.path.getsize(src) // 1024} KB)')
print('новых копий:', made)
