// frontend/src/lib/api.ts
import type { ActionResult } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ActionResult<T>> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? `HTTP ${response.status}`,
      data
    );
  }

  return data as ActionResult<T>;
}

async function requestMultipart<T>(
  path: string,
  formData: FormData
): Promise<ActionResult<T>> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Don't set Content-Type — browser sets it with boundary for multipart
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? `HTTP ${response.status}`,
      data
    );
  }

  return data as ActionResult<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  postForm: <T>(path: string, formData: FormData) =>
    requestMultipart<T>(path, formData),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError };
