// Публикует статичный слепок сайта на GitHub Pages: ветка gh-pages репозитория Kavdas/biart-mono.
// Запуск: node tools/publish-pages.cjs   (WordPress должен работать на :8890 — оттуда снимается слепок)
// Основной проект BIART и его демо (biart-demo) не затрагиваются.
const { execSync } = require('child_process');
const path = require('path');
const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
const REPO = 'git@github.com:Kavdas/biart-mono.git';
run('python3 tools/export-static.py');
const dist = path.join(__dirname, '..', 'dist');
run('git init -q -b gh-pages', dist);
run('git add -A', dist);
run('git -c user.name=Kavdas -c user.email=nurdauletsadvakas@gmail.com -c core.safecrlf=false commit -q -m "demo: BIART Mono"', dist);
run(`git push -f ${REPO} gh-pages`, dist);
console.log('опубликовано: https://kavdas.github.io/biart-mono/ (обновится через ~1 мин)');
