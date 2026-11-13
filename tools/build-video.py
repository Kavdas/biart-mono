# -*- coding: utf-8 -*-
"""Веб-версии роликов страницы аренды: theme/assets/video/.

python3 tools/build-video.py

Исходники (60 fps, ~16 Мбит/с, по ~95 МБ) в сайт не годятся: страница тянула бы их целиком.
Делаем H.264 (CRF 27, 30 fps, +faststart — старт без полной загрузки), AAC 96 к, и постеры.
Источники — папка hall/ соседнего основного проекта (ASSETS_ROOT, по умолчанию ../BIART);
ffmpeg берётся из hall/node_modules/ffmpeg-static, если системного нет (FFMPEG).
"""
import os
import shutil
import subprocess

ROOT = os.path.abspath(os.environ.get('ASSETS_ROOT', os.path.join(os.path.dirname(__file__), '..', '..', 'BIART')))
OUT = os.path.join(os.path.dirname(__file__), '..', 'theme', 'assets', 'video')
FF = os.environ.get('FFMPEG') or shutil.which('ffmpeg') or os.path.join(ROOT, 'hall', 'node_modules', 'ffmpeg-static', 'ffmpeg')

JOBS = [
    # (источник, результат, высота кадра по короткой/длинной стороне, фильтр)
    ('hall/BIART_hall_v2_16x9.mp4', 'hall-1280.mp4', 'scale=1280:720', 27),
    ('hall/BIART_hall_v2_9x16.mp4', 'hall-m.mp4', 'scale=720:1280', 28),
]


def run(args):
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y'] + args, check=True)


def bg():
    """Фон первого экрана: ролик без интро/аутро и без нижней четверти кадра (там вшиты титры ролика, они бы
    наложились на заголовок страницы). Без звука — вдвое легче."""
    for src, dst, scale, crf, poster in (('hall/BIART_hall_v2_16x9.mp4', 'hall-bg.mp4', 'crop=iw:ih*0.72:0:0,scale=1280:-2', 29, 'hall-bg-poster.jpg'),
                                         ('hall/BIART_hall_v2_9x16.mp4', 'hall-bg-m.mp4', 'crop=iw:ih*0.72:0:0,scale=720:-2', 30, 'hall-bg-poster-m.jpg')):
        d = os.path.join(OUT, dst)
        run(['-ss', '13', '-t', '30', '-i', os.path.join(ROOT, src), '-vf', f'{scale},fps=30', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
             '-pix_fmt', 'yuv420p', '-movflags', '+faststart', d])
        run(['-ss', '14', '-i', os.path.join(ROOT, src), '-frames:v', '1', '-vf', scale.replace('1280', '1600'), '-q:v', '4', os.path.join(OUT, poster)])
        print(f'{dst}: {os.path.getsize(d) / 1024 / 1024:.1f} МБ')


def main():
    os.makedirs(OUT, exist_ok=True)
    for src, dst, scale, crf in JOBS:
        s = os.path.join(ROOT, src)
        d = os.path.join(OUT, dst)
        run(['-i', s, '-vf', f'{scale},fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p',
             '-profile:v', 'high', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', d])
        print(f'{dst}: {os.path.getsize(d) / 1024 / 1024:.1f} МБ')
    # постеры: кадр с залом (≈ 18-я секунда, свет включён) — для первого экрана до старта видео
    for src, name, t, scale in (('hall/BIART_hall_v2_16x9.mp4', 'hall-poster.jpg', '18', 'scale=1600:-2'),
                                ('hall/BIART_hall_v2_9x16.mp4', 'hall-poster-m.jpg', '18', 'scale=720:-2')):
        d = os.path.join(OUT, name)
        run(['-ss', t, '-i', os.path.join(ROOT, src), '-frames:v', '1', '-vf', scale, '-q:v', '4', d])
        print(f'{name}: {os.path.getsize(d) // 1024} КБ')


if __name__ == '__main__':
    main()
    bg()
