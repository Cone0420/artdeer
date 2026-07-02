import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");

const pngSources = [
  path.join(publicDir, "favicon-16x16.png"),
  path.join(publicDir, "favicon-32x32.png"),
];

for (const source of pngSources) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing favicon source: ${path.relative(root, source)}`);
  }
}

const faviconBuffer = await pngToIco(pngSources);
const publicFavicon = path.join(publicDir, "favicon.ico");
const appFavicon = path.join(appDir, "favicon.ico");

fs.writeFileSync(publicFavicon, faviconBuffer);
fs.mkdirSync(appDir, { recursive: true });
fs.copyFileSync(publicFavicon, appFavicon);

console.log(`Synced favicon.ico (${faviconBuffer.length} bytes)`);
console.log(`- ${path.relative(root, publicFavicon)}`);
console.log(`- ${path.relative(root, appFavicon)}`);
