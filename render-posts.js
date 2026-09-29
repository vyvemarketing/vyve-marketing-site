const puppeteer = require('/Users/wavveros/gods-eye-view/node_modules/puppeteer');
const path = require('path');

(async () => {
  const root = __dirname;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1080, height: 1080, deviceScaleFactor: 1});
  for (let i = 1; i <= 9; i += 1) {
    const url = `file://${path.join(root, 'instagram/fontes/posts.html')}?post=${i}`;
    await page.goto(url, {waitUntil: 'networkidle0'});
    await page.screenshot({path: path.join(root, `instagram/artes/vyve-post-${String(i).padStart(2, '0')}.png`)});
  }
  await browser.close();
  console.log('9 artes exportadas em instagram/artes');
})();
