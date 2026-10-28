const BASE = import.meta.env.VITE_API_URL ?? ""

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>
  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type Options = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit }

async function request<T>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    ...init,
    headers: json !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status, data?.errors)
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) => request<T>(path, { method: "POST", json }),
  patch: <T>(path: string, json?: unknown) => request<T>(path, { method: "PATCH", json }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
  /** multipart/form-data: the browser sets the boundary header itself */
  upload: <T>(path: string, form: FormData, method: "POST" | "PUT" = "POST") => request<T>(path, { method, body: form }),
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Please try again.")
export const fieldError = (e: unknown, field: string) => (e instanceof ApiError ? e.fieldErrors[field]?.[0] : undefined)
