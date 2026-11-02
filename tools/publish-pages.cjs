// Публикует статичный слепок сайта на GitHub Pages: ветка gh-pages репозитория Kavdas/biart-mono.
// Запуск: node tools/publish-pages.cjs   (WordPress должен работать на :8890 — оттуда снимается слепок)
// Основной проект BIART и его демо (biart-demo) не затрагиваются.
const { execSync } = require('child_process');
const path = require('path');
const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
const REPO = 'git@github.com:Kavdas/biart-mono.git';
run('python3 tools/export-static.py');
const dist = path.join(__dirname, '..', 'dist');
// заглушки преподавателей (teachers-src/teachers.json, draft:true) на публичный сайт не пускаем
if (require('fs').readFileSync(path.join(dist, 'index.html'), 'utf8').includes('staff-card is-draft') && !process.env.ALLOW_DRAFTS) {
  console.error('Остановлено: в слепке остались заглушки преподавателей (draft). Заполните teachers-src/teachers.json или запустите с ALLOW_DRAFTS=1.');
  process.exit(2);
}
run('git init -q', dist);
run('git checkout -q -B gh-pages', dist);   // не зависит от init.defaultBranch и версии git
run('git add -A', dist);
run('git -c user.name=Kavdas -c user.email=Kavdas@users.noreply.github.com -c core.safecrlf=false commit -q -m "demo: BIART Mono"', dist);
run(`git push -f ${REPO} HEAD:refs/heads/gh-pages`, dist);
console.log('опубликовано: https://kavdas.github.io/biart-mono/ (обновится через ~1 мин)');
