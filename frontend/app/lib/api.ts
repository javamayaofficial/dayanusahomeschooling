import { API_V1 } from "./config";
export class ApiError extends Error { status:number; constructor(s:number,m:string){super(m);this.status=s;this.name="ApiError";} }
type Options = RequestInit & { token?: string };
export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_V1}${path}`, {
    ...rest,
    headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}), ...headers },
  });
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail ?? d; } catch {} throw new ApiError(res.status, d); }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
