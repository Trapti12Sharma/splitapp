// Run with: node generate-icons.cjs
//
// Regenerates every favicon/app-icon file in public/ from one SVG template.
// Previously this fell back to literally copying the .svg file to a .png
// path when `sharp` wasn't installed — Chrome's installability check reads
// the manifest icons as real PNGs, so a mislabeled SVG silently failed it
// and the "install app" prompt never appeared. `sharp` is now a devDependency
// so that fallback path is gone; this always rasterizes for real.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;

const PUBLIC_DIR = path.join(__dirname, 'public');

// Same gradient as the in-app logo badge (`.gradient-primary` in index.css)
// and the Wallet icon in the sidebar/navbar, so the icon on a phone's home
// screen or Chrome's taskbar matches the app itself instead of being a flat
// one-off colour.
const svgIcon = (size) => {
    // Keep the ₹ glyph inside the ~80% centre safe-zone that Android's
    // maskable-icon masks (circle/squircle/rounded-square) can crop to,
    // instead of sizing it to the full canvas.
    const fontSize = size * 0.56;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#d946ef"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
  <text x="50%" y="50%" font-size="${fontSize}" font-weight="700" fill="white" font-family="Arial, sans-serif"
        text-anchor="middle" dominant-baseline="central">₹</text>
</svg>`;
};

const write = (file, contents) => fs.writeFileSync(path.join(PUBLIC_DIR, file), contents);

async function main() {
    // SVG sources — kept around as the <link rel="icon" type="image/svg+xml">
    // favicon (crisp at any size, and the one most browsers prefer when
    // offered alongside a PNG) and as the manifest's scalable fallback.
    write('favicon.svg', svgIcon(100));
    write('icon-192.svg', svgIcon(192));
    write('icon-512.svg', svgIcon(512));

    // Real raster PNGs — required by the Web App Manifest spec and by
    // Chrome's installability check (SVG manifest icons aren't accepted).
    const renders = [
        [192, 'icon-192.png'],
        [512, 'icon-512.png'],
        [180, 'apple-touch-icon.png'], // iOS home-screen icon size
        [32, 'favicon-32.png'],
        [16, 'favicon-16.png'],
    ];

    for (const [size, file] of renders) {
        await sharp(Buffer.from(svgIcon(size))).resize(size, size).png().toFile(path.join(PUBLIC_DIR, file));
    }

    // .ico for browsers/OSes that still ask for one specifically (pinned
    // Windows tiles, old IE/Edge, some crawlers).
    const icoBuffer = await pngToIco([
        path.join(PUBLIC_DIR, 'favicon-16.png'),
        path.join(PUBLIC_DIR, 'favicon-32.png'),
    ]);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);

    console.log('Icons generated: favicon.ico, favicon-16.png, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png (+ .svg sources)');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
