const sharp = require('/Users/wavveros/gods-eye-view/node_modules/sharp');
const path = require('path');

(async () => {
  const composites = [];
  for (let i = 1; i <= 9; i += 1) {
    const input = path.join(__dirname, `instagram/artes/vyve-post-${String(i).padStart(2, '0')}.png`);
    composites.push({
      input: await sharp(input).resize(360, 360).png().toBuffer(),
      left: ((i - 1) % 3) * 360,
      top: Math.floor((i - 1) / 3) * 360,
    });
  }
  await sharp({create:{width:1080,height:1080,channels:3,background:'#08080a'}})
    .composite(composites)
    .jpeg({quality:92})
    .toFile(path.join(__dirname, 'instagram/preview-grid.jpg'));
  console.log('Preview criado em instagram/preview-grid.jpg');
})();
