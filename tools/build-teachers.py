# -*- coding: utf-8 -*-
"""Преподаватели в окне арт-куратора: teachers-src/teachers.json (+ фото) -> блоки в theme/content/home*.html.

python3 tools/build-teachers.py        затем: npm run seed

Скрипт идемпотентен: прежний блок «staff» внутри биографии куратора заменяется целиком.
Фото собираются в WebP (320/640/960 px) в theme/assets/img/teachers/. Нет фото — карточка с инициалами.
"""
import glob
import json
import os
import re
import unicodedata

from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'teachers-src')
OUT = os.path.join(ROOT, 'theme', 'assets', 'img', 'teachers')
TH = '/wp-content/themes/biart-mono/assets/img/teachers/'
CURATORS = {'bekmadieva': 'Мадина Бекмадиева', 'usmanov': 'Расул Усманов', 'musina': 'Дана Мусина'}
WIDTHS = (320, 640, 960, 1280)
T = {
    'ru': {'title': 'Преподаватели', 'more': 'Подробнее и преподаватели', 'old_more': 'Читать подробнее'},
    'kk': {'title': 'Оқытушылар', 'more': 'Толығырақ және оқытушылар', 'old_more': 'Толығырақ оқу'},
}


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def balanced(txt, start):
    depth = 0
    for m in re.finditer(r'<!-- (/?)wp:group[ \-]', txt[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return txt.index('-->', start + m.end()) + 3


def resolve(filename):
    if not filename:
        return ''
    want = unicodedata.normalize('NFC', filename)
    for f in os.listdir(SRC):
        if unicodedata.normalize('NFC', f) == want:
            return os.path.join(SRC, f)
    return ''


def photo_files(slug, idx, filename):
    """Собирает WebP-копии фото преподавателя, возвращает (имя без суффикса, ширина основной копии, высота) или None."""
    path = resolve(filename)
    if not path:
        if filename:
            print('НЕТ ФАЙЛА:', filename)
        return None
    os.makedirs(OUT, exist_ok=True)
    name = f't-{slug}-{idx:02d}'
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        w, h = im.size
        for old in glob.glob(f'{OUT}/{name}*.webp'):
            os.remove(old)
        widths = sorted({min(x, w) for x in WIDTHS})
        for tw in widths:
            r = im if tw == w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
            dest = f'{OUT}/{name}.webp' if tw == widths[-1] else f'{OUT}/{name}-{tw}w.webp'
            r.save(dest, 'WEBP', quality=84, method=6)
        top = Image.open(f'{OUT}/{name}.webp').size
    return name, top[0], top[1]


def initials(name):
    parts = [p for p in re.split(r'\s+', name.strip()) if p]
    return ''.join(p[0] for p in parts[:2]).upper() or '·'


def card_html(slug, idx, t, kk):
    pick = lambda k: (t.get(k + '_kz') if kk and t.get(k + '_kz') else t.get(k)) or ''
    name, role = pick('name'), pick('role')
    regalia = (t.get('regalia_kz') if kk and t.get('regalia_kz') else t.get('regalia')) or []
    draft = ' is-draft' if t.get('draft') else ''
    focus = t.get('focus')
    ph = photo_files(slug, idx, t.get('photo', ''))
    if ph:
        base, w, h = ph
        photo = (f'<!-- wp:image {{"className":"staff-photo"}} -->\n<figure class="wp-block-image staff-photo"><img width="{w}" height="{h}" decoding="async" loading="lazy" '
                 f'src="{TH}{base}.webp" alt="{esc(name)}"' + (f' style="object-position:{esc(focus)}"' if focus else '') + '/></figure>\n<!-- /wp:image -->')
    else:
        photo = f'<!-- wp:paragraph {{"className":"staff-photo is-empty"}} --><p class="staff-photo is-empty" aria-hidden="true">{esc(initials(name))}</p><!-- /wp:paragraph -->'
    items = ''.join(f'<!-- wp:list-item --><li>{esc(r)}</li><!-- /wp:list-item -->' for r in regalia)
    lst = f'<!-- wp:list {{"className":"staff-regalia"}} --><ul class="wp-block-list staff-regalia">{items}</ul><!-- /wp:list -->' if items else ''
    inner = '\n'.join([
        photo,
        f'<!-- wp:heading {{"level":5,"className":"staff-name"}} --><h5 class="wp-block-heading staff-name">{esc(name)}</h5><!-- /wp:heading -->',
        f'<!-- wp:paragraph {{"className":"staff-role"}} --><p class="staff-role">{esc(role)}</p><!-- /wp:paragraph -->',
        lst,
    ])
    return (f'<!-- wp:group {{"className":"staff-card{draft}","layout":{{"type":"default"}}}} -->\n<div class="wp-block-group staff-card{draft}">\n{inner}\n</div>\n<!-- /wp:group -->')


def staff_html(slug, cur, kk):
    lang = 'kk' if kk else 'ru'
    groups = []
    idx = 0
    for g in cur['groups']:
        title = (g.get('title_kz') if kk and g.get('title_kz') else g.get('title')) or ''
        cards = []
        for t in g['teachers']:
            idx += 1
            cards.append(card_html(slug, idx, t, kk))
        groups.append('<!-- wp:group {"className":"staff-group","layout":{"type":"default"}} -->\n<div class="wp-block-group staff-group">\n'
                      f'<!-- wp:paragraph {{"className":"staff-dir"}} --><p class="staff-dir">{esc(title)}</p><!-- /wp:paragraph -->\n'
                      '<!-- wp:group {"className":"staff-grid","layout":{"type":"default"}} -->\n<div class="wp-block-group staff-grid">\n'
                      + '\n'.join(cards) + '\n</div>\n<!-- /wp:group -->\n</div>\n<!-- /wp:group -->')
    return ('<!-- wp:group {"className":"staff","layout":{"type":"default"}} -->\n<div class="wp-block-group staff">\n'
            f'<!-- wp:heading {{"level":4,"className":"staff-title"}} --><h4 class="wp-block-heading staff-title">{T[lang]["title"]}</h4><!-- /wp:heading -->\n'
            + '\n'.join(groups) + '\n</div>\n<!-- /wp:group -->')


def apply(path, kk, data):
    s = open(path, encoding='utf-8').read()
    lang = 'kk' if kk else 'ru'
    for slug, name in CURATORS.items():
        cur = data['curators'].get(slug)
        i = s.find(f'<h3 class="wp-block-heading">{name}</h3>')
        if i < 0:
            print('нет карточки', name, 'в', os.path.basename(path)); continue
        b0 = s.find('<!-- wp:group {"className":"teacher-bio"', i)
        b1 = balanced(s, b0)
        bio = s[b0:b1]
        # убрать прежний блок staff
        j = bio.find('<!-- wp:group {"className":"staff"')
        if j >= 0:
            bio = bio[:j].rstrip('\n') + '\n' + bio[balanced(bio, j):].lstrip('\n')
        if cur and cur.get('groups') and any(g.get('teachers') for g in cur['groups']):
            close = bio.rindex('</div>\n<!-- /wp:group -->')
            bio = bio[:close] + staff_html(slug, cur, kk) + '\n' + bio[close:]
            # подпись на карточке: куратор — не только биография
            card_end = b0
            k = s.rfind('<p class="teacher-more">', 0, b0)
            if k >= 0:
                kend = s.index('</p>', k)
                label = T[lang]['more']
                s = s[:k] + f'<p class="teacher-more">{label}' + s[kend:]
                shift = len(f'<p class="teacher-more">{label}') - (kend - k)
                b0 += shift; b1 += shift
        s = s[:b0] + bio + s[b1:]
    open(path, 'w', encoding='utf-8').write(s)


def main():
    data = json.load(open(os.path.join(SRC, 'teachers.json'), encoding='utf-8'))
    apply(os.path.join(ROOT, 'theme', 'content', 'home.html'), False, data)
    apply(os.path.join(ROOT, 'theme', 'content', 'home-kz.html'), True, data)
    drafts = sum(1 for c in data['curators'].values() for g in c['groups'] for t in g['teachers'] if t.get('draft'))
    total = sum(len(g['teachers']) for c in data['curators'].values() for g in c['groups'])
    print(f'готово: преподавателей {total}, из них заглушек {drafts}')


if __name__ == '__main__':
    main()
