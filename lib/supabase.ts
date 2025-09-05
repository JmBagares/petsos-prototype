// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Read from env first (works on web too), then fall back to app.json -> extra
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.manifestExtra as any)?.EXPO_PUBLIC_SUPABASE_URL;

const anon =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.manifestExtra as any)?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Do not throw on startup; log instead so app can still render
  console.warn(
    "Supabase URL/key missing. Check app.json -> extra or your .env. Login/upload will fail until set."
  );
}

export const supabase = createClient(url || "https://example.supabase.co", anon || "anon");
