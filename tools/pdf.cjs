// PDF-слепок страницы одной длинной полосой: node tools/pdf.cjs <url> <out.pdf> <width>
const { chromium } = require('playwright-core'); const path = require('path');
(async () => {
  const [url = 'http://localhost:8890/', out = 'page.pdf', width = '1440'] = process.argv.slice(2);
  const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: +width, height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    document.querySelectorAll('details').forEach((d) => { d.open = true; }); // FAQ раскрыт для печати
    document.querySelector('.site-header').style.position = 'static';
  });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.emulateMedia({ media: 'screen' });
  await p.pdf({ path: out, width: `${width}px`, height: `${h}px`, printBackground: true, pageRanges: '1' });
  console.log(out, h); await b.close();
})();
