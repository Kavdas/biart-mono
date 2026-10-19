// Скриншот редактора страницы (для проверки, что стили темы попали в канвас).
// node tools/shot-editor.cjs <cookie.json> <postId> <out.png>
const { chromium } = require('playwright-core'); const path = require('path'); const fs = require('fs');
(async () => {
  const [cookieFile, postId = '4', out = 'editor.png'] = process.argv.slice(2);
  const c = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
  const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
  const b = await chromium.launch({ executablePath: exe });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([
    { name: c.name, value: c.value, domain: 'localhost', path: '/' },
    { name: c.auth, value: c.authv, domain: 'localhost', path: '/wp-admin' },
    { name: c.auth, value: c.authv, domain: 'localhost', path: '/wp-content/plugins' },
  ]);
  const p = await ctx.newPage();
  await p.goto(`http://localhost:8890/wp-admin/post.php?post=${postId}&action=edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  // закрыть welcome-гайд, если есть
  const close = p.locator('button[aria-label="Закрыть"], .components-modal__header button').first();
  if (await close.isVisible().catch(() => false)) await close.click();
  await p.waitForTimeout(2500);
  const frame = p.frameLocator('iframe[name="editor-canvas"]');
  await frame.locator('.hero').first().waitFor({ timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out });
  // прокрутка канваса к ценам и второй скрин
  let f = null;
  for (let i = 0; i < 20 && !f; i++) { f = p.frames().find((fr) => fr.name() === 'editor-canvas'); if (!f) await p.waitForTimeout(1000); }
  if (!f) console.error('editor-canvas iframe not found');
  for (const [i, sel] of ['.teachers', '.space', '.prices', '.faq'].entries()) {
    if (!f) break;
    await f.evaluate((q) => { const el = document.querySelector(q); const top = el.getBoundingClientRect().top + (document.scrollingElement.scrollTop || window.scrollY); document.scrollingElement.scrollTop = top; window.scrollTo(0, top); }, sel);
    await p.waitForTimeout(1200); await p.screenshot({ path: out.replace('.png', `-${i + 2}.png`) });
  }
  console.log(out); await b.close();
})();
