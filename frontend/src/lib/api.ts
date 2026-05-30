import { supabase } from "./supabase";
import type { ActionResult } from "../types";

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

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
