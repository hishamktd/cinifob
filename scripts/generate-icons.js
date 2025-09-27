const fs = require('fs');
const path = require('path');

const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="60"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="240" text-anchor="middle" fill="white">🎬</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach((size) => {
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(publicDir, fileName);

  const scaledSvg = svgIcon
    .replace('width="512"', `width="${size}"`)
    .replace('height="512"', `height="${size}"`);

  fs.writeFileSync(filePath, scaledSvg);
  console.log(`Generated ${fileName}`);
});

console.log('All icons generated successfully!');
