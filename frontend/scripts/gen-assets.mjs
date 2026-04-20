// Regenerate PNG assets from SVG sources.
// Run: npm run gen-assets

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const jobs = [
  { src: 'public/og.svg',          out: 'public/og.png' },
  { src: 'public/apple-touch.svg', out: 'public/apple-touch-icon.png', size: 180 },
];

for (const { src, out, size } of jobs) {
  const buf = await readFile(src);
  const img = sharp(buf, { density: 300 });
  if (size) img.resize(size, size);
  await img.png().toFile(out);
  console.log(`${src} -> ${out}${size ? ` (${size}x${size})` : ''}`);
}
