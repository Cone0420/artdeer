import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const categoriesDir = path.join(__dirname, "../public/images/categories");

const files = [
  "game-poster.png",
  "youtube-design.png",
  "photo-gallery.png",
  "guild-mark.png",
  "character-design.png",
  "etc-design.png",
];

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Pure / near-black achromatic canvas
  if (max <= 28 && sat < 0.12) return true;
  // Pure / near-white achromatic canvas (source files use white bg)
  if (min >= 248 && sat < 0.06) return true;

  return false;
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function floodFillBackground(data, width, height) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const isBg = new Uint8Array(total);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (!isBackgroundPixel(r, g, b, a)) return;

    isBg[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;

    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  return isBg;
}

function applySoftAlpha(data, width, height, isBg) {
  const out = Buffer.from(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;

      if (isBg[idx]) {
        out[i + 3] = 0;
        continue;
      }

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let minDist = Infinity;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (!isBg[nIdx]) continue;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          minDist = Math.min(minDist, dist);
        }
      }

      if (minDist === Infinity) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      let bgLikeness = 0;
      if (max <= 40 && sat < 0.15) {
        bgLikeness = 1 - max / 40;
      } else if (min >= 235 && sat < 0.1) {
        bgLikeness = (min - 235) / 20;
      } else if (lum < 55 && sat < 0.2) {
        bgLikeness = Math.max(0, 1 - lum / 55) * 0.35;
      }

      if (bgLikeness > 0 && minDist <= 2) {
        const edgeFactor = Math.min(1, minDist / 2);
        const alphaScale = 1 - bgLikeness * (1 - edgeFactor * 0.85);
        out[i + 3] = Math.round(data[i + 3] * Math.max(0.12, alphaScale));
      }
    }
  }

  return out;
}

async function processImage(filename) {
  const inputPath = path.join(categoriesDir, filename);
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const isBg = floodFillBackground(data, width, height);
  const processed = applySoftAlpha(data, width, height, isBg);

  let removed = 0;
  for (let i = 0; i < width * height; i++) {
    if (isBg[i]) removed++;
  }

  await sharp(processed, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(inputPath);

  console.log(`${filename}: ${width}x${height}, removed ${((removed / (width * height)) * 100).toFixed(1)}% background`);
}

for (const file of files) {
  await processImage(file);
}

console.log("Done.");
