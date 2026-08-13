import { supabase } from "./supabase";
import type { ActionResult, AppSettings } from "../types";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function callFunction<T>(name: string, options: RequestInit = {}): Promise<ActionResult<T>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token || anonKey}`,
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.error ?? `HTTP ${res.status}`, json);
  return json as ActionResult<T>;
}

export const edgeFn = {
  post: <T>(name: string, body?: unknown) =>
    callFunction<T>(name, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T>(name: string, formData: FormData) =>
    callFunction<T>(name, { method: "POST", body: formData }),
};

export { ApiError, supabase };

// --- App Settings ---

export async function fetchAppSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error || !data) {
    // Safe fallback: COR not required
    return { id: "default", cor_required: false, updated_at: new Date().toISOString() };
  }

  return data as AppSettings;
}

export async function updateAppSettings(
  settings: Partial<Pick<AppSettings, "cor_required">>
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("id", "default")
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data as AppSettings;
}
