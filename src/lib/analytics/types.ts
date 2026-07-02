export type VisitorRecord = {
  id: number;
  ipHash: string;
  sessionId: string;
  userAgent: string | null;
  visitedAt: string;
  enteredAt: string;
  leftAt: string | null;
  durationSeconds: number | null;
};

export type AnalyticsEventType =
  | "homepage_view"
  | "homepage_leave"
  | "portfolio_view"
  | "price_view"
  | "click";

export type AnalyticsEventRecord = {
  id: number;
  eventType: AnalyticsEventType;
  path: string | null;
  sessionId: string;
  ipHash: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: string;
};

export type VisitorStats = {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
};

export type DurationStats = {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
};

export type AnalyticsStats = {
  visits: VisitorStats;
  duration: DurationStats;
};

export type RecordVisitInput = {
  sessionId: string;
  ipHash: string;
  userAgent: string | null;
  path?: string;
};

export type UpdateDurationInput = {
  visitId: number;
  sessionId: string;
  durationSeconds: number;
};
