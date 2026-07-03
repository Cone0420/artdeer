import { createHash } from "crypto";
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
