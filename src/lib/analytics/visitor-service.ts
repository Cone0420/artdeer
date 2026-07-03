import { createHash } from "crypto";
import { getAppDb } from "@/lib/db/app-db";
import { assertWritableDatabase, useSupabaseDatabase } from "@/lib/db/provider";
import { getSupabaseAdmin } from "@/lib/supabase/server";
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

export async function getRecentVisitId(sessionId: string): Promise<number | null> {
  if (!useSupabaseDatabase()) {
    const db = getAppDb();
    const cutoff = new Date(Date.now() - VISITOR_DEDUP_MINUTES * 60 * 1000).toISOString();
    const row = db
      .prepare(
        `SELECT id FROM visitors
         WHERE session_id = ? AND visited_at >= ?
         ORDER BY id DESC LIMIT 1`
      )
      .get(sessionId, cutoff) as { id: number } | undefined;
    return row?.id ?? null;
  }

  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - VISITOR_DEDUP_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("visitors")
    .select("id")
    .eq("session_id", sessionId)
    .gte("visited_at", cutoff)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as { id: number } | null)?.id ?? null;
}

/** @deprecated use getRecentVisitId */
export async function hasRecentVisit(sessionId: string): Promise<boolean> {
  return (await getRecentVisitId(sessionId)) !== null;
}

export async function insertVisitor(input: RecordVisitInput): Promise<number> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("insertVisitor");
    const db = getAppDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `INSERT INTO visitors (ip_hash, session_id, user_agent, visited_at, entered_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(input.ipHash, input.sessionId, input.userAgent, now, now);

    db.prepare(
      `INSERT INTO analytics_events (event_type, path, session_id, ip_hash, user_agent, metadata, created_at)
       VALUES ('homepage_view', ?, ?, ?, ?, NULL, ?)`
    ).run(input.path ?? "/", input.sessionId, input.ipHash, input.userAgent, now);

    return Number(result.lastInsertRowid);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("visitors")
    .insert({
      ip_hash: input.ipHash,
      session_id: input.sessionId,
      user_agent: input.userAgent,
      visited_at: now,
      entered_at: now,
    })
    .select("id")
    .single();

  if (error) throw error;

  const visitId = (data as { id: number }).id;

  const { error: eventError } = await supabase.from("analytics_events").insert({
    event_type: "homepage_view",
    path: input.path ?? "/",
    session_id: input.sessionId,
    ip_hash: input.ipHash,
    user_agent: input.userAgent,
    metadata: null,
    created_at: now,
  });

  if (eventError) throw eventError;

  return visitId;
}

function normalizeDuration(durationSeconds: number): number {
  return Math.min(MAX_SESSION_DURATION_SECONDS, Math.max(1, Math.round(durationSeconds)));
}

export async function updateVisitDuration(input: UpdateDurationInput): Promise<boolean> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("updateVisitDuration");
    const db = getAppDb();
    const durationSeconds = normalizeDuration(input.durationSeconds);
    const now = new Date().toISOString();
    const existing = db
      .prepare(`SELECT duration_seconds FROM visitors WHERE id = ? AND session_id = ?`)
      .get(input.visitId, input.sessionId) as { duration_seconds: number | null } | undefined;

    if (!existing) return false;

    const nextDuration =
      existing.duration_seconds == null || durationSeconds > existing.duration_seconds
        ? durationSeconds
        : existing.duration_seconds;

    const result = db
      .prepare(
        `UPDATE visitors SET left_at = ?, duration_seconds = ?
         WHERE id = ? AND session_id = ?`
      )
      .run(now, nextDuration, input.visitId, input.sessionId);

    if (result.changes === 0) return false;

    db.prepare(
      `INSERT INTO analytics_events (event_type, path, session_id, metadata, created_at)
       VALUES ('homepage_leave', '/', ?, ?, ?)`
    ).run(input.sessionId, JSON.stringify({ visitId: input.visitId, durationSeconds: nextDuration }), now);

    return true;
  }

  const supabase = getSupabaseAdmin();
  const durationSeconds = normalizeDuration(input.durationSeconds);
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("visitors")
    .select("duration_seconds")
    .eq("id", input.visitId)
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) return false;

  const nextDuration =
    existing.duration_seconds == null || durationSeconds > existing.duration_seconds
      ? durationSeconds
      : existing.duration_seconds;

  const { data, error } = await supabase
    .from("visitors")
    .update({
      left_at: now,
      duration_seconds: nextDuration,
    })
    .eq("id", input.visitId)
    .eq("session_id", input.sessionId)
    .select("id");

  if (error) throw error;
  if (!data?.length) return false;

  const { error: eventError } = await supabase.from("analytics_events").insert({
    event_type: "homepage_leave",
    path: "/",
    session_id: input.sessionId,
    ip_hash: null,
    user_agent: null,
    metadata: { visitId: input.visitId, durationSeconds: nextDuration },
    created_at: now,
  });

  if (eventError) throw eventError;

  return true;
}

async function getAverageDuration(sinceIso?: string): Promise<number> {
  if (!useSupabaseDatabase()) {
    const db = getAppDb();
    const rows = sinceIso
      ? (db
          .prepare(
            `SELECT duration_seconds FROM visitors
             WHERE duration_seconds IS NOT NULL AND duration_seconds > 0 AND entered_at >= ?`
          )
          .all(sinceIso) as { duration_seconds: number }[])
      : (db
          .prepare(
            `SELECT duration_seconds FROM visitors
             WHERE duration_seconds IS NOT NULL AND duration_seconds > 0`
          )
          .all() as { duration_seconds: number }[]);

    if (!rows.length) return 0;
    const total = rows.reduce((sum, row) => sum + row.duration_seconds, 0);
    return Math.round(total / rows.length);
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("visitors")
    .select("duration_seconds")
    .not("duration_seconds", "is", null)
    .gt("duration_seconds", 0);

  if (sinceIso) {
    query = query.gte("entered_at", sinceIso);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return 0;

  const total = data.reduce((sum, row) => sum + (row.duration_seconds ?? 0), 0);
  return Math.round(total / data.length);
}

function startOfLocalDayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function startOfLocalYearIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export async function getDurationStats(): Promise<DurationStats> {
  return {
    today: await getAverageDuration(startOfLocalDayIso()),
    week: await getAverageDuration(daysAgoIso(7)),
    month: await getAverageDuration(daysAgoIso(30)),
    year: await getAverageDuration(startOfLocalYearIso()),
    total: await getAverageDuration(),
  };
}

async function countVisitorsSince(sinceIso?: string): Promise<number> {
  if (!useSupabaseDatabase()) {
    const db = getAppDb();
    const row = sinceIso
      ? (db
          .prepare(`SELECT COUNT(*) AS count FROM visitors WHERE entered_at >= ?`)
          .get(sinceIso) as { count: number })
      : (db.prepare(`SELECT COUNT(*) AS count FROM visitors`).get() as { count: number });
    return row.count;
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from("visitors").select("*", { count: "exact", head: true });

  if (sinceIso) {
    query = query.gte("entered_at", sinceIso);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getVisitorStats(): Promise<VisitorStats> {
  return {
    today: await countVisitorsSince(startOfLocalDayIso()),
    week: await countVisitorsSince(daysAgoIso(7)),
    month: await countVisitorsSince(daysAgoIso(30)),
    year: await countVisitorsSince(startOfLocalYearIso()),
    total: await countVisitorsSince(),
  };
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  return {
    visits: await getVisitorStats(),
    duration: await getDurationStats(),
  };
}
