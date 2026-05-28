const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const publicDir = path.join(__dirname, 'public');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 }
];

async function generate() {
  console.log('Generating PNG icons from icon.svg...');
  for (const item of sizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(svgPath)
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
    console.log(`Created ${item.name} (${item.size}x${item.size})`);
  }
  console.log('Icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
