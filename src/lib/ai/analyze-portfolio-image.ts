"use client";

import type {
  PortfolioImageAnalysis,
  PortfolioImageMood,
  PortfolioImageOrientation,
} from "@/lib/ai/portfolio-image-analysis-types";

const SAMPLE_SIZE = 160;

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return { h: h * 360, s, l };
}

function colorNameFromRgb(r: number, g: number, b: number): string | null {
  const { h, s, l } = rgbToHsl(r, g, b);

  if (l < 0.18) return "블랙";
  if (l > 0.92 && s < 0.12) return "화이트";
  if (s < 0.14) return l > 0.65 ? "베이지" : "그레이";

  if (h >= 330 || h < 15) return l > 0.72 ? "핑크" : "레드";
  if (h >= 15 && h < 45) return "오렌지";
  if (h >= 45 && h < 70) return "옐로우";
  if (h >= 70 && h < 160) return l > 0.7 ? "민트" : "그린";
  if (h >= 160 && h < 210) return "블루";
  if (h >= 210 && h < 260) return "네이비";
  if (h >= 260 && h < 310) return l > 0.62 ? "라벤더" : "보라";
  return "핑크";
}

function quantizeChannel(value: number): number {
  return Math.round(value / 32) * 32;
}

function detectMood(
  brightness: number,
  saturation: number,
  colorNames: string[],
  isDark: boolean
): PortfolioImageMood {
  const hasPink = colorNames.some((name) => ["핑크", "라벤더", "보라"].includes(name));
  const hasPastelPalette = colorNames.some((name) =>
    ["핑크", "라벤더", "민트", "베이지", "화이트"].includes(name)
  );

  if (isDark && (hasPink || colorNames.includes("보라"))) return "gothic";
  if (isDark) return "dark";
  if (saturation < 0.28 && brightness > 165 && hasPastelPalette) return "pastel";
  if (hasPink && brightness > 150) return "cute";
  if (saturation > 0.55) return "vibrant";
  if (saturation < 0.35 && brightness > 140) return "soft";
  return "neutral";
}

function detectOrientation(width: number, height: number): PortfolioImageOrientation {
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.88) return "portrait";
  return "square";
}

function inferHintsFromFilename(filename: string | null): {
  decorHints: string[];
  objectHints: string[];
  purposeHints: string[];
} {
  if (!filename) {
    return { decorHints: [], objectHints: [], purposeHints: [] };
  }

  const lower = filename.toLowerCase();
  const decorHints: string[] = [];
  const objectHints: string[] = [];
  const purposeHints: string[] = [];

  if (/리본|ribbon/.test(lower)) decorHints.push("리본");
  if (/별|star/.test(lower)) decorHints.push("별");
  if (/하트|heart/.test(lower)) decorHints.push("하트");
  if (/꽃|flower/.test(lower)) decorHints.push("꽃");

  if (/캐릭|character|char/.test(lower)) objectHints.push("캐릭터");
  if (/고양|cat|냥/.test(lower)) objectHints.push("고양이");
  if (/키링|keyring|key.?ring/.test(lower)) objectHints.push("키링");
  if (/프로필|profile|avatar/.test(lower)) objectHints.push("프로필");

  if (/키링|keyring/.test(lower)) purposeHints.push("키링");
  if (/포토|photo|광장|profile/.test(lower)) purposeHints.push("포토광장");
  if (/배경|background|bg/.test(lower)) purposeHints.push("배경");
  if (/포스터|poster/.test(lower)) purposeHints.push("포스터");
  if (/길드|guild|mark|emblem/.test(lower)) purposeHints.push("길드마크");
  if (/유튜브|youtube|banner|썸네일|thumbnail/.test(lower)) purposeHints.push("유튜브");

  return { decorHints, objectHints, purposeHints };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_load_failed"));
    image.src = src;
  });
}

export async function analyzePortfolioImageFromSrc(
  src: string,
  filename?: string | null
): Promise<PortfolioImageAnalysis> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("image_analysis_failed");

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const bucketCounts = new Map<string, { count: number; r: number; g: number; b: number }>();
  let brightnessTotal = 0;
  let saturationTotal = 0;
  let samples = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3]!;
      if (alpha < 40) continue;

      const r = data[index]!;
      const g = data[index + 1]!;
      const b = data[index + 2]!;
      const { s, l } = rgbToHsl(r, g, b);

      brightnessTotal += l * 255;
      saturationTotal += s;
      samples += 1;

      const key = `${quantizeChannel(r)}-${quantizeChannel(g)}-${quantizeChannel(b)}`;
      const existing = bucketCounts.get(key);
      if (existing) existing.count += 1;
      else bucketCounts.set(key, { count: 1, r, g, b });
    }
  }

  if (samples === 0) throw new Error("image_analysis_failed");

  const brightness = brightnessTotal / samples;
  const saturation = saturationTotal / samples;
  const isDark = brightness < 95;
  const isPastel = saturation < 0.32 && brightness > 155;

  const dominant = [...bucketCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const dominantColors = dominant.map(
    ({ r, g, b }) =>
      `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`
  );

  const colorNames = [
    ...new Set(
      dominant
        .map(({ r, g, b }) => colorNameFromRgb(r, g, b))
        .filter((name): name is string => Boolean(name))
    ),
  ].slice(0, 5);

  const mood = detectMood(brightness, saturation, colorNames, isDark);
  const filenameHints = inferHintsFromFilename(filename ?? null);

  const decorHints = [...filenameHints.decorHints];
  const objectHints = [...filenameHints.objectHints];
  const purposeHints = [...filenameHints.purposeHints];

  if (colorNames.includes("핑크") || colorNames.includes("라벤더")) decorHints.push("리본");
  if (mood === "cute" || mood === "pastel") objectHints.push("캐릭터");
  if (isPastel) decorHints.push("파스텔");

  return {
    width: image.width,
    height: image.height,
    aspectRatio: Number((image.width / image.height).toFixed(2)),
    orientation: detectOrientation(image.width, image.height),
    brightness: Math.round(brightness),
    saturation: Number(saturation.toFixed(2)),
    isDark,
    isPastel,
    mood,
    dominantColors,
    colorNames,
    decorHints: [...new Set(decorHints)].slice(0, 4),
    objectHints: [...new Set(objectHints)].slice(0, 4),
    purposeHints: [...new Set(purposeHints)].slice(0, 4),
  };
}
