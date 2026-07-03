export { getSupabaseAdmin as getAnalyticsDb } from "@/lib/supabase/server";
export { formatDuration, formatDurationClock } from "./format-duration";
export {
  getAnalyticsStats,
  getDurationStats,
  getRecentVisitId,
  getVisitorStats,
  hashIpAddress,
  hasRecentVisit,
  insertVisitor,
  updateVisitDuration,
} from "./visitor-service";
export type {
  AnalyticsEventRecord,
  AnalyticsEventType,
  AnalyticsStats,
  DurationStats,
  RecordVisitInput,
  UpdateDurationInput,
  VisitorRecord,
  VisitorStats,
} from "./types";
export {
  MAX_SESSION_DURATION_SECONDS,
  VISITOR_DEDUP_MINUTES,
  VISITOR_SESSION_COOKIE,
  VISITOR_SESSION_MAX_AGE,
} from "./constants";
