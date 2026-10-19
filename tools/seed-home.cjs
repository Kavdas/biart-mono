// Заливает контент главной (RU, ID 4) и казахской версии (/kz/). Запуск: npm run seed
require('./dns-fix.cjs');
const { execFileSync } = require('child_process');
const path = require('path');
const wpEnv = path.join(__dirname, '..', 'node_modules', '@wordpress', 'env', 'bin', 'wp-env');
const wp = (args, opts = {}) => execFileSync(process.execPath, ['-r', path.join(__dirname, 'dns-fix.cjs'), wpEnv, 'run', 'cli', 'wp', ...args], { encoding: 'utf8', ...opts });
const THEME = '/var/www/html/wp-content/themes/biart-mono';

// RU — главная (ищем по слагу: на чистой базе страницы ещё нет)
let ruId = wp(['post', 'list', '--post_type=page', '--post_status=any', '--name=home', '--field=ID']).replace(/[^\d]/g, '');
if (!ruId) {
  ruId = wp(['post', 'create', '--post_type=page', '--post_status=publish', '--post_name=home', '--post_title=Главная', '--porcelain']).replace(/[^\d]/g, '');
  console.log('created RU page', ruId);
}
wp(['post', 'update', ruId, `${THEME}/content/home.html`, '--post_title=Главная'], { stdio: 'inherit' });
// главная сайта = эта страница, иначе front-page.html показывает пустой post-content
wp(['option', 'update', 'show_on_front', 'page'], { stdio: 'inherit' });
wp(['option', 'update', 'page_on_front', ruId], { stdio: 'inherit' });

// KZ — страница /kz/ (создаём при первом запуске)
let kzId = wp(['post', 'list', '--post_type=page', '--post_status=any', '--name=kz', '--field=ID']).replace(/[^\d]/g, '');
if (!kzId) {
  kzId = wp(['post', 'create', '--post_type=page', '--post_status=publish', '--post_name=kz', '--post_title=Басты бет', '--porcelain']).replace(/[^\d]/g, '');
  console.log('created KZ page', kzId);
}
wp(['post', 'update', kzId, `${THEME}/content/home-kz.html`, '--post_title=Басты бет'], { stdio: 'inherit' });
wp(['post', 'meta', 'update', kzId, '_wp_page_template', 'page-landing-kz'], { stdio: 'inherit' });

// Договор публичной оферты — отдельная страница
let ofId = wp(['post', 'list', '--post_type=page', '--post_status=any', '--name=dogovor-publichnoj-oferty', '--field=ID']).replace(/[^\d]/g, '');
if (!ofId) {
  ofId = wp(['post', 'create', '--post_type=page', '--post_status=publish', '--post_name=dogovor-publichnoj-oferty', '--post_title=Договор публичной оферты', '--porcelain']).replace(/[^\d]/g, '');
  console.log('created oferta page', ofId);
}
wp(['post', 'update', ofId, `${THEME}/content/oferta.html`, '--post_title=Договор публичной оферты'], { stdio: 'inherit' });

// Политика конфиденциальности и оферта подарочного сертификата
const legal = [
  // слаг privacy-policy занят черновиком, который WordPress создаёт сам: если делать
  // новую страницу, слаг станет privacy-policy-2, а ссылка в подвале упрётся в черновик.
  // Поэтому берём страницу из опции wp_page_for_privacy_policy и публикуем её.
  ['privacy-policy', 'Политика конфиденциальности', 'privacy.html', 'wp_page_for_privacy_policy', null],
  ['dogovor-oferty-sertifikata', 'Договор оферты сертификата', 'oferta-sertifikat.html', null, null],
  ['raspisanie', 'Расписание по возрастам', 'schedule.html', null, null],
  ['raspisanie-kz', 'Жас бойынша кесте', 'schedule-kz.html', null, 'page-kz'],
];
for (const [slug, title, file, option, tpl] of legal) {
  let id = option ? wp(['option', 'get', option]).replace(/[^\d]/g, '') : '';
  if (!id) id = wp(['post', 'list', '--post_type=page', '--post_status=any', `--name=${slug}`, '--field=ID']).replace(/[^\d]/g, '');
  if (!id) {
    id = wp(['post', 'create', '--post_type=page', '--post_status=publish', `--post_name=${slug}`, `--post_title=${title}`, '--porcelain']).replace(/[^\d]/g, '');
    console.log('created', slug, id);
  }
  wp(['post', 'update', id, `${THEME}/content/${file}`, `--post_title=${title}`, `--post_name=${slug}`, '--post_status=publish'], { stdio: 'inherit' });
  // казахским внутренним страницам нужна своя шапка и подвал
  if (tpl) wp(['post', 'meta', 'update', id, '_wp_page_template', tpl], { stdio: 'inherit' });
}
