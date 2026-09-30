const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/wavveros/gods-eye-view/node_modules/puppeteer');
const sharp = require('/Users/wavveros/gods-eye-view/node_modules/sharp');

(async () => {
  const root = __dirname;
  const outputDir = path.join(root, 'instagram/artes-v2');
  fs.mkdirSync(outputDir, {recursive:true});

  const browser = await puppeteer.launch({
    headless:true,
    executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args:['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080,height:1080,deviceScaleFactor:1});

  const composites = [];
  for (let i = 1; i <= 9; i += 1) {
    const url = `file://${path.join(root, 'instagram/fontes/posts.html')}?v=2&post=${i}`;
    const filename = `vyve-feed-${String(i).padStart(2, '0')}.png`;
    const output = path.join(outputDir, filename);
    await page.goto(url, {waitUntil:'networkidle0'});
    await page.screenshot({path:output});
    composites.push({
      input:await sharp(output).resize(360,360).png().toBuffer(),
      left:((i - 1) % 3) * 360,
      top:Math.floor((i - 1) / 3) * 360,
    });
  }
  await browser.close();

  await sharp({create:{width:1080,height:1080,channels:3,background:'#08080a'}})
    .composite(composites)
    .jpeg({quality:92})
    .toFile(path.join(root, 'instagram/preview-grid-v2.jpg'));

  console.log('9 artes V2 exportadas em instagram/artes-v2');
})();
