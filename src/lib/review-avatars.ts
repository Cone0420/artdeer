import { REVIEW_AVATAR_FILES } from "./review-avatar-manifest";

const REVIEW_PROFILE_BASE = "/images/review-profile";

/** 후기 ID를 숫자 해시로 변환 (같은 ID → 항상 같은 아바타) */
export function hashReviewId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(31, hash) + id.charCodeAt(i);
    hash >>>= 0;
  }
  return hash;
}

/** 후기에 표시할 프로필 이미지 경로 (지정 URL 우선, 없으면 ID 기반 매핑) */
export function getReviewAvatarSrc(reviewId: string, avatarUrl?: string | null): string | null {
  const custom = avatarUrl?.trim();
  if (custom) return custom;

  const files: readonly string[] = REVIEW_AVATAR_FILES;
  if (files.length === 0) return null;

  const index = hashReviewId(reviewId) % files.length;
  return `${REVIEW_PROFILE_BASE}/${files[index]}`;
}

export function getReviewAvatarCount(): number {
  return REVIEW_AVATAR_FILES.length;
}
