const puppeteer = require('/Users/wavveros/gods-eye-view/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const results = [];
  for (const view of [
    {name:'desktop',width:1440,height:1000},
    {name:'mobile',width:390,height:844},
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport({width:view.width,height:view.height,deviceScaleFactor:1});
    const response = await page.goto('http://127.0.0.1:8019', {waitUntil:'networkidle0'});
    if (view.name === 'mobile') {
      await page.click('.menu-button');
      const expanded = await page.$eval('.menu-button', (button) => button.getAttribute('aria-expanded'));
      if (expanded !== 'true') errors.push('Menu mobile não abriu');
      await page.click('.menu a');
    }
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += Math.floor(innerHeight * .72)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    await page.screenshot({
      path:path.join(__dirname, `site-${view.name}.png`),
      fullPage:true,
    });
    results.push({view:view.name,status:response.status(),title:await page.title(),errors});
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results,null,2));
})();
