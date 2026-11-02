// Проверка вёрстки: ищет наложения текста друг на друга и обрезанные подписи на 8 ширинах (360–1920).
// node tools/qa-layout.cjs [url]   по умолчанию http://localhost:8890/
// Считает реальные границы глифов (Range.getClientRects), а не рамки блоков: так видно, когда курсивный
// хвост цифры заезжает на подпись. Скрытые элементы (закрытые <details>, свёрнутое меню) пропускаются.
const { chromium } = require('playwright-core');
const url = process.argv[2] || 'http://localhost:8890/';

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  let bad = 0;
  for (const w of [1920, 1440, 1180, 1024, 820, 600, 390, 360]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'header.wp-block-template-part{position:static!important}.wa-float{display:none!important}' });
    await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')));
    const res = await p.evaluate(() => {
      const skip = '.hero-ghost,.ticker-line,.hpv,.hero-art,.carousel,.tm,.hero-ticker';
      const hid = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const c = getComputedStyle(n); if (c.visibility === 'hidden' || c.display === 'none' || c.opacity === '0') return true; } return false; };
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && !hid(e) && !e.closest(skip) && cs.position !== 'fixed' && !(e.closest('details:not([open])') && !e.closest('summary')); };
      const els = [...document.querySelectorAll('h1,h2,h3,p,summary,figcaption,.wp-block-button__link,li,em,strong,label,input,select,button')].filter(vis);
      const rects = (e) => { const out = []; const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.width > 1 && q.height > 1) out.push(q); } return out; };
      const data = els.map((e) => ({ e, r: rects(e) })).filter((d) => d.r.length);
      const hits = [];
      for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
        const a = data[i], c = data[j]; if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
        let hit = null;
        for (const x of a.r) { for (const y of c.r) { const ow = Math.min(x.right, y.right) - Math.max(x.left, y.left), oh = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top); if (ow > 4 && oh > 4) { hit = [ow | 0, oh | 0]; break; } } if (hit) break; }
        if (hit) hits.push([hit.join('x'), (a.e.className || a.e.tagName) + ':' + a.e.textContent.trim().slice(0, 28), (c.e.className || c.e.tagName) + ':' + c.e.textContent.trim().slice(0, 28)]);
      }
      const clipped = [...document.querySelectorAll('body *')].filter((e) => vis(e) && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.children.length === 0 && e.textContent.trim()).slice(0, 5).map((e) => (e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 20));
      return { hits: hits.slice(0, 12), n: hits.length, clipped, sw: document.documentElement.scrollWidth };
    });
    const flag = res.n || res.clipped.length || res.sw > w ? '  ✗' : '';
    if (flag) bad++;
    console.log(w, 'scrollWidth', res.sw, 'наложений', res.n + flag);
    res.hits.forEach((h) => console.log('   ', JSON.stringify(h)));
    if (res.clipped.length) console.log('    обрезано:', res.clipped);
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
