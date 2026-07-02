import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/images/review-profile");

const PALETTES = [
  { bg: "#EDE9FF", face: "#8B7CFF", accent: "#C4B5FD" },
  { bg: "#FFE9F5", face: "#E879A9", accent: "#F9A8D4" },
  { bg: "#E9F5FF", face: "#60A5FA", accent: "#93C5FD" },
  { bg: "#E9FFF3", face: "#34D399", accent: "#6EE7B7" },
  { bg: "#FFF6E9", face: "#F59E0B", accent: "#FCD34D" },
  { bg: "#F3E9FF", face: "#A78BFA", accent: "#C4B5FD" },
  { bg: "#E9FFFE", face: "#2DD4BF", accent: "#5EEAD4" },
  { bg: "#FFF0E9", face: "#FB923C", accent: "#FDBA74" },
  { bg: "#F0F4FF", face: "#6366F1", accent: "#A5B4FC" },
  { bg: "#FFF9E9", face: "#EAB308", accent: "#FDE047" },
  { bg: "#FCE9FF", face: "#D946EF", accent: "#F0ABFC" },
  { bg: "#E9FFF9", face: "#10B981", accent: "#6EE7B7" },
  { bg: "#FFECE9", face: "#F87171", accent: "#FCA5A5" },
  { bg: "#EEF9FF", face: "#38BDF8", accent: "#7DD3FC" },
  { bg: "#F5FFE9", face: "#84CC16", accent: "#BEF264" },
  { bg: "#FFF5F5", face: "#F472B6", accent: "#FBCFE8" },
  { bg: "#F0FFF4", face: "#4ADE80", accent: "#86EFAC" },
  { bg: "#F5F3FF", face: "#7C3AED", accent: "#A78BFA" },
  { bg: "#FFFBEB", face: "#D97706", accent: "#FBBF24" },
  { bg: "#ECFEFF", face: "#06B6D4", accent: "#67E8F9" },
];

function buildAvatarSvg(index, palette) {
  const seed = index * 17;
  const eyeY = 44 + (seed % 3);
  const smile = 58 + (seed % 4);
  const blush = index % 2 === 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="48" fill="${palette.bg}"/>
  <circle cx="48" cy="48" r="44" fill="${palette.accent}" opacity="0.35"/>
  ${blush ? `<ellipse cx="30" cy="${smile - 4}" rx="6" ry="4" fill="${palette.face}" opacity="0.18"/><ellipse cx="66" cy="${smile - 4}" rx="6" ry="4" fill="${palette.face}" opacity="0.18"/>` : ""}
  <circle cx="36" cy="${eyeY}" r="4.5" fill="${palette.face}"/>
  <circle cx="60" cy="${eyeY}" r="4.5" fill="${palette.face}"/>
  <circle cx="37.5" cy="${eyeY - 1.5}" r="1.5" fill="#ffffff" opacity="0.85"/>
  <circle cx="61.5" cy="${eyeY - 1.5}" r="1.5" fill="#ffffff" opacity="0.85"/>
  <path d="M 34 ${smile} Q 48 ${smile + 8} 62 ${smile}" stroke="${palette.face}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
</svg>`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < PALETTES.length; i++) {
    const num = String(i + 1).padStart(2, "0");
    const svg = buildAvatarSvg(i, PALETTES[i]);
    const outPath = path.join(outDir, `avatar-${num}.webp`);

    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(outPath);
    console.log(`Created ${path.basename(outPath)}`);
  }

  console.log(`Done. ${PALETTES.length} avatars in public/images/review-profile/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
