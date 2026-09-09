import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = fileURLToPath(new URL('../src/assets/hero/', import.meta.url));
await mkdir(dir, { recursive: true });

const tones = [
  { name: 'hero-1.jpg', bg: { r: 214, g: 205, b: 187 } },
  { name: 'hero-2.jpg', bg: { r: 217, g: 201, b: 178 } },
  { name: 'hero-3.jpg', bg: { r: 206, g: 197, b: 179 } },
];

for (const tone of tones) {
  await sharp({ create: { width: 1200, height: 1500, channels: 3, background: tone.bg } })
    .jpeg({ quality: 80 })
    .toFile(dir + tone.name);
}

console.log('wrote 3 placeholder hero images to src/assets/hero/');
