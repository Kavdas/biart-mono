// Скриншот страницы: полностраничный или одной секции.
// node tools/shot.cjs <url> <out.png> [width] [css-селектор секции]
// Браузер: CHROME_PATH, иначе chromium из ms-playwright (Windows), иначе google-chrome (Linux).
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.env.LOCALAPPDATA) {
    const win = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
    if (fs.existsSync(win)) return win;
  }
  for (const p of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Браузер не найден: задайте CHROME_PATH');
}

(async () => {
  const [url = 'http://localhost:8890/', out = 'shot.png', width = '1440', sel = ''] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  // reducedMotion выключает появление блоков и докрутку цифр: в кадр попадают конечные значения
  const page = await browser.newPage({ viewport: { width: +width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async (s) => {
    // на сайте картинки ленивые — для съёмки подгружаем все
    document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    const el = s && document.querySelector(s);
    window.scrollTo(0, el ? el.getBoundingClientRect().top + window.scrollY - 120 : 0);
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  }, sel);
  await page.waitForTimeout(600);
  await page.screenshot({ path: out, fullPage: !sel });
  console.log(out);
  await browser.close();
})();
