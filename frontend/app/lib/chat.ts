import { apiFetch } from "./api";
import { API_V1 } from "./config";
import { getAccessToken } from "./auth";
import type { ChatMessage, ChatSession, Suggestions } from "@/types";
const tok = () => getAccessToken() ?? undefined;
export const createSession = () => apiFetch<ChatSession>(`/chat/session`,{method:"POST",token:tok()});
export const listSessions = () => apiFetch<ChatSession[]>(`/chat/sessions`,{token:tok()});
export const getHistory = (sessionId:string) => apiFetch<ChatMessage[]>(`/chat/history/${sessionId}`,{token:tok()});
export const getSuggestions = () => apiFetch<Suggestions>(`/chat/suggestions`,{token:tok()});
export const deleteSession = (sessionId:string) => apiFetch<void>(`/chat/session/${sessionId}`,{method:"DELETE",token:tok()});

// Streaming SSE: panggil onDelta tiap potongan; resolve saat 'done'; throw saat 'error'
export async function streamMessage(
  sessionId: string, message: string,
  onDelta: (text: string) => void, signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_V1}/chat/message`, {
    method: "POST", signal,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${getAccessToken() ?? ""}` },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok || !res.body) {
    let detail = "Gagal menghubungi Guru AI.";
    try { detail = (await res.json()).detail ?? detail; } catch {}
    throw new Error(detail);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // pisah per event SSE (dipisah baris kosong)
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find(l => l.startsWith("data:"));
      if (!line) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      let evt: { delta?: string; done?: boolean; error?: string };
      try { evt = JSON.parse(json); } catch { continue; }
      if (evt.error) throw new Error(evt.error);
      if (evt.delta) onDelta(evt.delta);
      if (evt.done) return;
    }
  }
}
