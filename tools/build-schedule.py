# -*- coding: utf-8 -*-
"""Страница «Расписание по возрастам» — русская и казахская.

Снимок из системы школы BI Art (/api/schedule): 22 направления, 117 активных
групп. Берутся только название направления, возрастная категория группы и
слоты (день недели + время начала); списки учеников не читаются.

Возраст в системе заполнен у 39 групп из 117. Направления без возраста
(фортепиано, скрипка, гитара, домбыра, барабаны, виолончель, флейта,
блокфлейта, кларнет, часть вокала и иллюстрации) показаны во всех трёх
детских полосах — это решение владельца, а не выписка из системы.

Запуск: python3 tools/build-schedule.py
"""
import io
import re

NB = u'\u00a0'
DASH = u'\u2013'

# Снимок: направление § возрастная категория § «день время, день время»
# День: 0 — понедельник … 5 — суббота (нумерация системы школы).
RAW = u"""
2D анимация§11+§0 18:00,2 18:00
2D анимация§Микс§5 13:00,5 14:00
DJ ADULTS§—§1 20:00,3 20:00
Fashion-коллаж§7-10 лет§2 17:00,4 17:00
Fashion-коллаж§11+§2 18:00,4 18:00
Fashion-коллаж§Микс§5 15:00,5 16:00
stop-motion§7+§1 18:00,3 18:00
stop-motion§Микс§5 11:00,5 12:00
Изобразительное искусство§5-8 лет§0 17:00,2 17:00
спортивно-бальные танцы ADULTS§18+§1 20:00,3 20:00,5 10:00,5 11:00
K-POP§6-8 лет§1 17:00,1 18:00,3 17:00,3 18:00
K-POP§9-13 лет§1 10:00,1 19:00,3 10:00,3 19:00
K-POP§7-10 лет§1 11:00,3 11:00
Актерское мастерство§5-8 лет§1 11:00,1 17:00,3 11:00,3 17:00
Актерское мастерство§7-10 лет§1 18:00,3 18:00
Актерское мастерство§13-17 лет§1 16:00,2 16:00,3 16:00,4 16:00
Актерское мастерство§9-12 лет§1 10:00,2 17:00,3 10:00,4 17:00
Барабаны§—§0 18:00,0 19:00,1 18:00,1 20:00,2 11:00,2 18:00,3 12:00,3 18:00,3 19:00,4 11:00,5 09:00,5 10:00,5 11:00
Барабаны§8-12 лет§0 17:00,3 17:00
Барабаны§6-11 лет§1 16:00,3 16:00
Блокфлейта§—§1 17:00,3 17:00
Виолончель§—§1 15:00,5 12:00
Вокал§5-8 лет§1 11:00,3 11:00
Вокал§6-8 лет§1 14:00,3 14:00
Вокал§6-11 лет§1 10:00,3 10:00
Вокал§13-17 лет§1 15:00,3 15:00
Вокал§10-14§0 18:00,0 19:00,5 18:00,5 19:00
Вокал§—§0 11:00,0 16:00,1 16:00,1 19:00,3 16:00,3 19:00,4 11:00,5 16:00
Вокал§8-12 лет§1 17:00,3 17:00
Гитара§—§0 17:00,0 18:00,1 09:00,1 10:00,1 11:00,1 17:00,1 18:00,2 17:00,2 18:00,3 09:00,3 10:00,3 11:00,3 17:00,3 18:00
Гитара§12-15 лет§0 18:00,2 18:00
Домбыра§—§0 15:00,0 16:00,0 18:00,1 10:00,1 11:00,1 18:00,1 19:00,2 09:00,2 18:00,3 15:00,3 16:00,3 18:00,3 19:00,4 10:00,4 11:00,5 09:00
Иллюстрация§Микс§5 13:00,5 14:00
Иллюстрация§6-11 лет§1 17:00,3 17:00
Иллюстрация§—§5 11:00,5 12:00
Иллюстрация§11+§1 16:00,3 16:00
Кларнет§—§1 11:00,1 18:00,3 11:00,3 18:00
Қазақ биі§12-15 лет§2 18:00,4 18:00
Қазақ биі§5-8 лет§2 17:00,2 19:00,4 17:00,4 19:00
Қазақ биі§9-11 лет§2 10:00,4 10:00
Скрипка§—§0 10:00,0 11:00,0 12:00,0 16:00,0 17:00,0 18:00,1 09:00,2 09:00,2 16:00,3 10:00,3 11:00,3 12:00,3 16:00,3 17:00,3 18:00,4 09:00,4 16:00,5 09:00
Спортивно-бальные танцы§5-8 лет§0 18:00,1 18:00,2 18:00,3 18:00
Спортивно-бальные танцы§9-13 лет§0 19:00,1 19:00,2 19:00,3 19:00
Спортивно-бальные танцы§Микс§1 10:00,3 10:00
Спортивно-бальные танцы§12+§0 17:00,2 17:00
Спортивно-бальные танцы§5-13 лет§1 17:00,3 17:00
Флейта§—§2 17:00,5 15:00
Фортепиано§—§0 10:00,0 17:00,0 18:00,0 19:00,1 09:00,1 10:00,1 16:00,1 17:00,1 18:00,1 19:00,2 10:00,2 11:00,2 16:00,2 17:00,2 18:00,2 19:00,3 09:00,3 10:00,3 16:00,3 17:00,3 18:00,3 19:00,4 10:00,4 16:00,4 17:00,4 18:00,4 19:00,5 10:00,5 11:00
Хип-хоп§9-13 лет§0 10:00,0 19:00,4 10:00,4 19:00
Хип-хоп§6-8 лет§0 16:00,0 18:00,4 16:00,4 18:00
Хип-хоп§12+§0 17:00,4 17:00
"""

# направление в системе: (RU, KZ, блок, порядок)
DIRS = {
 u'Вокал':                     (u'Вокал', u'Вокал', 'music', 10),
 u'Фортепиано':                (u'Фортепиано', u'Фортепиано', 'music', 11),
 u'Скрипка':                   (u'Скрипка', u'Скрипка', 'music', 12),
 u'Домбыра':                   (u'Домбыра', u'Домбыра', 'music', 13),
 u'Гитара':                    (u'Гитара', u'Гитара', 'music', 14),
 u'Барабаны':                  (u'Барабаны', u'Барабан', 'music', 15),
 u'Виолончель':                (u'Виолончель', u'Виолончель', 'music', 16),
 u'Флейта':                    (u'Флейта', u'Флейта', 'music', 17),
 u'Блокфлейта':                (u'Блокфлейта', u'Блокфлейта', 'music', 18),
 u'Кларнет':                   (u'Кларнет', u'Кларнет', 'music', 19),
 u'DJ ADULTS':                 (u'DJ', u'DJ', 'music', 20),
 u'Хип-хоп':                   (u'Хип-хоп', u'Хип-хоп', 'dance', 30),
 u'K-POP':                     (u'K-POP', u'K-POP', 'dance', 31),
 u'Спортивно-бальные танцы':   (u'Спортивно-бальные танцы', u'Спорттық-бальдық билер', 'dance', 32),
 u'спортивно-бальные танцы ADULTS': (u'Спортивно-бальные танцы', u'Спорттық-бальдық билер', 'dance', 33),
 u'Қазақ биі':                 (u'Қазақ биі', u'Қазақ биі', 'dance', 34),
 u'Актерское мастерство':      (u'Актёрское мастерство', u'Актёрлік шеберлік', 'acting', 40),
 u'Иллюстрация':               (u'Иллюстрация', u'Иллюстрация', 'digital', 50),
 u'2D анимация':               (u'2D-анимация', u'2D-анимация', 'digital', 51),
 u'stop-motion':               (u'Stop-motion', u'Stop-motion', 'digital', 52),
 u'Fashion-коллаж':            (u'Fashion-коллаж', u'Fashion-коллаж', 'digital', 53),
 u'Изобразительное искусство': (u'Изобразительное искусство', u'Бейнелеу өнері', 'digital', 54),
}

BLOCKS = [
 ('music',   u'Музыкальное искусство', u'Музыка өнері'),
 ('dance',   u'Хореография', u'Хореография'),
 ('acting',  u'Актёрское мастерство', u'Актёрлік шеберлік'),
 ('digital', u'Digital &amp; Visual Arts', u'Digital &amp; Visual Arts'),
]

# полосы: 0–2 детские, 3 — взрослые
BANDS = [(6, 10), (11, 13), (14, 17), (18, 99)]


def bands_of(age, adults):
    """Возрастная категория группы -> номера полос, в которые она попадает.

    У взрослых направлений (в системе помечены ADULTS) возраст часто не
    заполнен, поэтому полосу берём из самого направления, а не из поля.
    В детских категориях «11+» значит «11 и старше», а не «и взрослые»,
    поэтому открытый верх упирается в 17 лет."""
    if adults:
        return [3]
    age = age.strip()
    if age in (u'—', u'Микс'):
        return [0, 1, 2]          # возраст не заполнен или группа смешанная
    nums = [int(n) for n in re.findall(r'\d+', age)]
    if not nums:
        return [0, 1, 2]
    lo = nums[0]
    if len(nums) > 1:
        hi = nums[1]
    elif u'+' in age:
        hi = 99 if lo >= 18 else 17
    else:
        hi = lo
    return [i for i, (a, b) in enumerate(BANDS) if lo <= b and hi >= a]


def read_raw():
    """-> {(направление, полоса): {день: множество времён}}"""
    out = {}
    for line in RAW.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
        name, age, slots = line.split(u'§')
        for band in bands_of(age, name.upper().endswith('ADULTS')):
            bucket = out.setdefault((name, band), {})
            for slot in slots.split(','):
                day, time = slot.strip().split(' ')
                bucket.setdefault(int(day), set()).add(time)
    return out


def day_chips(days, names):
    """[0,1,2,3] -> [«Пн–Чт»]; [1,3] -> [«Вт», «Чт»]. Каждый элемент — плашка."""
    days = sorted(days)
    if len(days) >= 3 and days[-1] - days[0] == len(days) - 1:
        return [names[days[0]] + DASH + names[days[-1]]]
    return [names[d] for d in days]


def when_lines(bucket, names):
    """Строки одной карточки: (плашки дней, время). Дни с одинаковым набором
    времён сводятся вместе. Если наборов больше двух или времён в наборе
    больше трёх — вместо перечисления даём окно «с… до…»: иначе карточка
    превращается в простыню, по которой всё равно ничего не выберешь."""
    clusters = {}
    for day, times in bucket.items():
        clusters.setdefault(tuple(sorted(times)), []).append(day)
    wide = len(clusters) > 2 or any(len(t) > 3 for t in clusters)
    if wide:
        all_times = sorted(t for times in clusters for t in times)
        all_days = [d for days in clusters.values() for d in days]
        return [(day_chips(all_days, names), all_times[0] + DASH + all_times[-1])]
    order = sorted(clusters.items(), key=lambda kv: min(kv[1]))
    return [(day_chips(days, names), ', '.join(times)) for times, days in order]


L = {
 'ru': {
   'days': [u'Пн', u'Вт', u'Ср', u'Чт', u'Пт', u'Сб'],
   'name': 0,
   'block': 1,
   'bands': [u'6' + DASH + u'10 лет', u'11' + DASH + u'13 лет',
             u'14' + DASH + u'17 лет', u'Взрослые 18+'],
   'lead': (u'Занятия идут два раза в неделю по 50%sминут. Выберите возраст — '
            u'покажем направления, дни и время начала. Свободные места '
            u'подскажет менеджер: расписание меняется, когда набирается '
            u'новая группа.') % NB,
   'adults': (u'Взрослые группы идут вечером и в субботу утром: DJ%s— по часу, '
              u'танцы%s— по 50%sминут. 50%s000%s₸ в месяц, два занятия в неделю.')
             % (NB, NB, NB, NB, NB),
   'cta': (u'Подобрать направление и свободное время — напишите в WhatsApp: '
           u'<a href="https://wa.me/77007103300">+7%s700%s710%s33%s00</a>.') % (NB, NB, NB, NB),
   'file': 'theme/content/schedule.html',
 },
 'kz': {
   'days': [u'Дс', u'Сс', u'Ср', u'Бс', u'Жм', u'Сб'],
   'name': 1,
   'block': 2,
   'bands': [u'6' + DASH + u'10 жас', u'11' + DASH + u'13 жас',
             u'14' + DASH + u'17 жас', u'Ересектер 18+'],
   'lead': (u'Сабақтар аптасына екі рет, 50%sминуттан өтеді. Жасты таңдаңыз — '
            u'бағыттарды, күндері мен басталу уақытын көрсетеміз. Бос орындарды '
            u'менеджер айтады: жаңа топ жиналғанда кесте өзгереді.') % NB,
   'adults': (u'Ересектер топтары кешке және сенбі таңертең өтеді: DJ%s— бір сағаттан, '
              u'билер%s— 50%sминуттан. Айына 50%s000%s₸, аптасына екі сабақ.')
             % (NB, NB, NB, NB, NB),
   'cta': (u'Бағыт пен бос уақытты таңдау үшін WhatsApp-қа жазыңыз: '
           u'<a href="https://wa.me/77007103300">+7%s700%s710%s33%s00</a>.') % (NB, NB, NB, NB),
   'file': 'theme/content/schedule-kz.html',
 },
}


def para(cls, text):
    return (u'<!-- wp:paragraph {"className":"%s"} --><p class="%s">%s</p>'
            u'<!-- /wp:paragraph -->') % (cls, cls, text)


def build(lang, data):
    t = L[lang]
    out = [u'<!-- wp:group {"className":"legal schedule","layout":{"type":"default"},"templateLock":"contentOnly"} -->',
           u'<div class="wp-block-group legal schedule">',
           para('legal-lead', t['lead'])]
    for band, title in enumerate(t['bands']):
        out.append(u'<!-- wp:group {"className":"sch-age","layout":{"type":"default"}} -->')
        out.append(u'<div class="wp-block-group sch-age">')
        out.append(u'<!-- wp:heading {"level":2,"className":"legal-h"} -->'
                   u'<h2 class="wp-block-heading legal-h">%s</h2><!-- /wp:heading -->' % title)
        if band == 3:
            out.append(para('legal-sub', t['adults']))
        for key, block_ru, block_kz in BLOCKS:
            rows = sorted(((DIRS[n][3], DIRS[n][t['name']], data[(n, band)])
                           for (n, b) in data if b == band and DIRS[n][2] == key))
            if not rows:
                continue
            cls = 'sch-group is-' + key
            out.append(u'<!-- wp:group {"className":"%s","layout":{"type":"default"}} -->' % cls)
            out.append(u'<div class="wp-block-group %s">' % cls)
            out.append(para('sch-block', block_ru if lang == 'ru' else block_kz))
            out.append(u'<!-- wp:group {"className":"sch-cards","layout":{"type":"default"}} -->')
            out.append(u'<div class="wp-block-group sch-cards">')
            for _, name, bucket in rows:
                out.append(u'<!-- wp:group {"className":"sch-card","layout":{"type":"default"}} -->')
                out.append(u'<div class="wp-block-group sch-card">')
                out.append(para('sch-dir', name))
                out.append(u'<!-- wp:group {"className":"sch-when","layout":{"type":"default"}} -->')
                out.append(u'<div class="wp-block-group sch-when">')
                for chips, times in when_lines(bucket, t['days']):
                    days = u''.join(u'<span class="sch-d">%s</span>' % c for c in chips)
                    out.append(para('sch-slot', days + u'<span class="sch-t">%s</span>' % times))
                out.append(u'</div>')
                out.append(u'<!-- /wp:group -->')
                out.append(u'</div>')
                out.append(u'<!-- /wp:group -->')
            out.append(u'</div>')
            out.append(u'<!-- /wp:group -->')
            out.append(u'</div>')
            out.append(u'<!-- /wp:group -->')
        out.append(u'</div>')
        out.append(u'<!-- /wp:group -->')
    out.append(para('legal-sub', t['cta']))
    out += [u'</div>', u'<!-- /wp:group -->']
    io.open(t['file'], 'w', encoding='utf-8', newline='\n').write(u'\n'.join(out) + u'\n')
    return t['file'], len(out)


data = read_raw()
for lang in ('ru', 'kz'):
    print('%-32s строк: %d' % build(lang, data))
