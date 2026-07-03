import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseStorageBucket,
  getSupabaseUrl,
} from "./env";

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          display_name: string | null;
          role: "super_admin" | "admin";
          is_active: boolean;
          created_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          display_name?: string | null;
          role: "super_admin" | "admin";
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          display_name?: string | null;
          role?: "super_admin" | "admin";
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
        };
      };
      data_collections: {
        Row: {
          collection_key: string;
          data_json: unknown;
          updated_at: string;
        };
        Insert: {
          collection_key: string;
          data_json: unknown;
          updated_at?: string;
        };
        Update: {
          collection_key?: string;
          data_json?: unknown;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          mime_type: string;
          size_bytes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          created_at?: string;
        };
      };
      visitors: {
        Row: {
          id: number;
          ip_hash: string;
          session_id: string;
          user_agent: string | null;
          visited_at: string;
          entered_at: string | null;
          left_at: string | null;
          duration_seconds: number | null;
        };
        Insert: {
          id?: number;
          ip_hash: string;
          session_id: string;
          user_agent?: string | null;
          visited_at?: string;
          entered_at?: string | null;
          left_at?: string | null;
          duration_seconds?: number | null;
        };
        Update: {
          id?: number;
          ip_hash?: string;
          session_id?: string;
          user_agent?: string | null;
          visited_at?: string;
          entered_at?: string | null;
          left_at?: string | null;
          duration_seconds?: number | null;
        };
      };
      analytics_events: {
        Row: {
          id: number;
          event_type: string;
          path: string | null;
          session_id: string;
          ip_hash: string | null;
          user_agent: string | null;
          metadata: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          event_type: string;
          path?: string | null;
          session_id: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          event_type?: string;
          path?: string | null;
          session_id?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: unknown | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const globalForSupabase = globalThis as typeof globalThis & {
  __artdearSupabaseAdmin?: SupabaseClient;
};

export function getSupabaseAdmin(): SupabaseClient {
  if (globalForSupabase.__artdearSupabaseAdmin) {
    return globalForSupabase.__artdearSupabaseAdmin;
  }

  const client = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  globalForSupabase.__artdearSupabaseAdmin = client;
  return client;
}

export function getSupabaseStorageBucketName(): string {
  return getSupabaseStorageBucket();
}

export function getSupabaseDiagnostics() {
  return {
    provider: "supabase" as const,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    storageBucket: getSupabaseStorageBucket(),
  };
}
