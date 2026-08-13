// Run with: node generate-icons.cjs
const fs = require('fs');
const path = require('path');

// Create simple SVG icons and save as PNG using sharp if available
// Otherwise create placeholder PNGs

const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#6366f1"/>
  <text x="${size * 0.15}" y="${size * 0.78}" font-size="${size * 0.7}" fill="white" font-family="Arial">₹</text>
</svg>`;

// Save SVGs as fallback
fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.svg'), svgIcon(192));
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.svg'), svgIcon(512));
console.log('SVG icons created. For PNG, install sharp: npm install sharp --save-dev then re-run.');

// Try to create PNG with sharp
try {
  const sharp = require('sharp');
  Promise.all([
    sharp(Buffer.from(svgIcon(192))).resize(192, 192).png().toFile(path.join(__dirname, 'public', 'icon-192.png')),
    sharp(Buffer.from(svgIcon(512))).resize(512, 512).png().toFile(path.join(__dirname, 'public', 'icon-512.png')),
  ]).then(() => console.log('PNG icons generated!')).catch(console.error);
} catch {
  // Copy SVG as fallback PNG name (browsers will handle SVG manifest icons)
  fs.copyFileSync(path.join(__dirname, 'public', 'icon-192.svg'), path.join(__dirname, 'public', 'icon-192.png'));
  fs.copyFileSync(path.join(__dirname, 'public', 'icon-512.svg'), path.join(__dirname, 'public', 'icon-512.png'));
  console.log('Using SVG as PNG fallback.');
}
