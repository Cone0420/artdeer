import { createHash } from "crypto";
import { getAppDb } from "@/lib/db/app-db";
import { VISITOR_DEDUP_MINUTES, MAX_SESSION_DURATION_SECONDS } from "./constants";
import type {
  AnalyticsStats,
  DurationStats,
  RecordVisitInput,
  UpdateDurationInput,
  VisitorStats,
} from "./types";

const IP_HASH_SALT = process.env.ANALYTICS_IP_SALT ?? "artdear-analytics-salt";

export function hashIpAddress(ip: string): string {
  return createHash("sha256")
    .update(`${IP_HASH_SALT}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export function getRecentVisitId(sessionId: string): number | null {
  const db = getAppDb();
  const row = db
    .prepare(
      `
      SELECT id
      FROM visitors
      WHERE session_id = ?
        AND visited_at >= datetime('now', ?)
      ORDER BY id DESC
      LIMIT 1
    `
    )
    .get(sessionId, `-${VISITOR_DEDUP_MINUTES} minutes`) as { id: number } | undefined;

  return row?.id ?? null;
}

/** @deprecated use getRecentVisitId */
export function hasRecentVisit(sessionId: string): boolean {
  return getRecentVisitId(sessionId) !== null;
}

export function insertVisitor(input: RecordVisitInput): number {
  const db = getAppDb();

  const result = db
    .prepare(
      `
    INSERT INTO visitors (ip_hash, session_id, user_agent, visited_at, entered_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `
    )
    .run(input.ipHash, input.sessionId, input.userAgent);

  db.prepare(
    `
    INSERT INTO analytics_events (event_type, path, session_id, ip_hash, user_agent, metadata, created_at)
    VALUES ('homepage_view', ?, ?, ?, ?, NULL, datetime('now'))
  `
  ).run(input.path ?? "/", input.sessionId, input.ipHash, input.userAgent);

  return Number(result.lastInsertRowid);
}

function normalizeDuration(durationSeconds: number): number {
  return Math.min(
    MAX_SESSION_DURATION_SECONDS,
    Math.max(1, Math.round(durationSeconds))
  );
}

export function updateVisitDuration(input: UpdateDurationInput): boolean {
  const db = getAppDb();
  const durationSeconds = normalizeDuration(input.durationSeconds);

  const result = db
    .prepare(
      `
    UPDATE visitors
    SET
      left_at = datetime('now'),
      duration_seconds = CASE
        WHEN duration_seconds IS NULL OR ? > duration_seconds THEN ?
        ELSE duration_seconds
      END
    WHERE id = ? AND session_id = ?
  `
    )
    .run(durationSeconds, durationSeconds, input.visitId, input.sessionId);

  if (result.changes > 0) {
    db.prepare(
      `
      INSERT INTO analytics_events (event_type, path, session_id, ip_hash, user_agent, metadata, created_at)
      VALUES ('homepage_leave', '/', ?, NULL, NULL, ?, datetime('now'))
    `
    ).run(input.sessionId, JSON.stringify({ visitId: input.visitId, durationSeconds }));
  }

  return result.changes > 0;
}

function getAverageDuration(whereClause: string): number {
  const db = getAppDb();
  const row = db
    .prepare(
      `
      SELECT AVG(duration_seconds) AS average
      FROM visitors
      WHERE duration_seconds IS NOT NULL
        AND duration_seconds > 0
        ${whereClause}
    `
    )
    .get() as { average: number | null };

  return Math.round(row.average ?? 0);
}

export function getDurationStats(): DurationStats {
  return {
    today: getAverageDuration(
      `AND date(COALESCE(entered_at, visited_at), 'localtime') = date('now', 'localtime')`
    ),
    week: getAverageDuration(
      `AND COALESCE(entered_at, visited_at) >= datetime('now', '-7 days', 'localtime')`
    ),
    month: getAverageDuration(
      `AND COALESCE(entered_at, visited_at) >= datetime('now', '-30 days', 'localtime')`
    ),
    year: getAverageDuration(
      `AND strftime('%Y', COALESCE(entered_at, visited_at), 'localtime') = strftime('%Y', 'now', 'localtime')`
    ),
    total: getAverageDuration(""),
  };
}

export function getVisitorStats(): VisitorStats {
  const db = getAppDb();

  const today = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM visitors
      WHERE date(COALESCE(entered_at, visited_at), 'localtime') = date('now', 'localtime')
    `
    )
    .get() as { count: number };

  const week = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM visitors
      WHERE COALESCE(entered_at, visited_at) >= datetime('now', '-7 days', 'localtime')
    `
    )
    .get() as { count: number };

  const month = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM visitors
      WHERE COALESCE(entered_at, visited_at) >= datetime('now', '-30 days', 'localtime')
    `
    )
    .get() as { count: number };

  const year = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM visitors
      WHERE strftime('%Y', COALESCE(entered_at, visited_at), 'localtime') = strftime('%Y', 'now', 'localtime')
    `
    )
    .get() as { count: number };

  const total = db.prepare(`SELECT COUNT(*) AS count FROM visitors`).get() as { count: number };

  return {
    today: today.count,
    week: week.count,
    month: month.count,
    year: year.count,
    total: total.count,
  };
}

export function getAnalyticsStats(): AnalyticsStats {
  return {
    visits: getVisitorStats(),
    duration: getDurationStats(),
  };
}
