export type ReviewItem = {
  id: string;
  nickname: string;
  text: string;
  date: string;
  createdAt: string;
  rating: number;
  visible: boolean;
  avatarUrl?: string | null;
};

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("ko", { granularity: "grapheme" })
    : null;

function splitGraphemes(value: string): string[] {
  if (!value) return [];
  if (graphemeSegmenter) {
    return [...graphemeSegmenter.segment(value)].map((part) => part.segment);
  }
  return [...value];
}

/** 화면 표시용 닉네임 마스킹 (DB 원본은 변경하지 않음) */
export function maskReviewNickname(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return "";

  const chars = splitGraphemes(trimmed);
  const len = chars.length;

  if (len === 1) return `*${chars[0]}`;
  if (len === 2) return `${chars[0]}*`;
  if (len === 3) return `${chars[0]}*${chars[2]}`;
  return `${chars[0]}${"*".repeat(len - 2)}${chars[len - 1]}`;
}

export function formatReviewDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/** 저장된 후기 날짜에서 YYYY.MM.DD만 추출해 표시용으로 반환 */
export function formatReviewDisplayDate(value: string): string {
  const [datePart] = value.trim().split(/\s+/);
  const parts = datePart.split(".");
  if (parts.length !== 3) return value.trim();

  const [y, m, d] = parts.map((part) => part.trim());
  if (!y || !m || !d) return value.trim();

  return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
}

/** HTML date input(YYYY-MM-DD) 값으로 변환 */
export function reviewDateToInputValue(date: string): string {
  const display = formatReviewDisplayDate(date);
  const [y, m, d] = display.split(".");
  if (!y || !m || !d) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** HTML date input 값을 YYYY.MM.DD 저장 형식으로 변환 */
export function inputValueToReviewDate(value: string): string {
  if (!value) return formatReviewDate();
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return formatReviewDate();
  return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
}

/** @deprecated use formatReviewDate */
export function formatReviewDateTime(date = new Date()): string {
  return formatReviewDate(date);
}

/** @deprecated use reviewDateToInputValue */
export function reviewDateTimeToInputValue(date: string): string {
  return reviewDateToInputValue(date);
}

/** @deprecated use inputValueToReviewDate */
export function inputValueToReviewDateTime(value: string): string {
  return inputValueToReviewDate(value);
}

export function inferCreatedAtFromId(id: string): string | null {
  const timestamp = Number(id.split("-")[0]);
  if (!Number.isFinite(timestamp) || timestamp <= 1e12) return null;
  return new Date(timestamp).toISOString();
}

export const seedReviews: ReviewItem[] = [
  {
    id: "1",
    nickname: "별빛요정",
    text: "정말 퀄리티가 너무 좋아요! 원하는 느낌 그대로 담아주셔서 정말 만족합니다 ㅠㅠ",
    date: "2024.11.20",
    createdAt: "2024-11-20T14:30:00.000Z",
    rating: 5,
    visible: true,
  },
  {
    id: "2",
    nickname: "러너123",
    text: "작업 속도도 빠르고 피드백 반영도 정확해서 믿고 맡길 수 있었어요! 다음에도 부탁드릴게요 :)",
    date: "2024.11.08",
    createdAt: "2024-11-08T10:15:00.000Z",
    rating: 5,
    visible: true,
  },
  {
    id: "3",
    nickname: "나루밍",
    text: "디자인 센스가 진짜...! 세세한 부분까지 신경 써주셔서 너무 예쁘게 나왔어요 ✨",
    date: "2024.10.25",
    createdAt: "2024-10-25T19:42:00.000Z",
    rating: 5,
    visible: true,
  },
  {
    id: "4",
    nickname: "하얀별",
    text: "처음 맡겨봤는데 기대 이상이에요! 친절하시고 결과물도 완벽합니다 :)",
    date: "2024.10.12",
    createdAt: "2024-10-12T16:08:00.000Z",
    rating: 5,
    visible: true,
  },
];

export type ReviewItemInput = Omit<ReviewItem, "id" | "date" | "createdAt"> & {
  id?: string;
  date?: string;
  createdAt?: string;
};
