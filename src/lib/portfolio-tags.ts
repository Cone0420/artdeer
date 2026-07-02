export function parsePortfolioTagsInput(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const rawParts = trimmed.includes("#")
    ? trimmed
        .split(/#+/)
        .map((part) => part.trim())
        .filter(Boolean)
    : trimmed
        .split(/[,，\n]+/)
        .map((part) => part.trim())
        .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const tag of rawParts) {
    const clean = tag.replace(/^#+/, "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(clean);
  }

  return unique;
}

export function formatPortfolioTagsInput(tags: string[] | undefined | null): string {
  return normalizePortfolioTags(tags).join(", ");
}

export function normalizePortfolioTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    if (typeof tag !== "string") continue;
    const trimmed = tag.trim().replace(/^#+/, "");
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }

  return unique;
}

export function portfolioTagsMatchQuery(tags: string[], query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return tags.some((tag) => tag.toLowerCase().includes(normalized));
}
