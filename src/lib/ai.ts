import type { AiReply, AiRequest } from "./ai-schema";
import { createLocalStore } from "./storage";

export type Settings = { name: string };

export const settingsStore = createLocalStore<Settings>("awpa.profile", { name: "" });

/**
 * Earlier versions kept the user's own AI key in this browser. Carry the name
 * over once and delete the old record so the key doesn't linger.
 */
export function migrateLegacySettings() {
  try {
    const raw = window.localStorage.getItem("awpa.settings");
    if (!raw) return;
    const old = JSON.parse(raw) as { name?: unknown };
    if (typeof old.name === "string" && old.name.trim() && !settingsStore.get().name)
      settingsStore.set({ name: old.name });
  } catch {
    // Unreadable legacy data is simply dropped.
  }
  try {
    window.localStorage.removeItem("awpa.settings");
  } catch {
    // Storage blocked; nothing to clean up.
  }
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
/** "demo" only exists on records saved before demo mode was removed; nothing new is tagged with it. */
export type Source = "ai" | "demo";
export type AiResult = { text: string; source: Source };

/**
 * Sends a request to the app's AI endpoint. There is no demo or template
 * fallback: any failure throws with a message that is safe to show the user.
 */
export async function runAi(
  call: (opts: { data: AiRequest }) => Promise<AiReply>,
  request: AiRequest,
): Promise<AiResult> {
  let reply: AiReply;
  try {
    reply = await call({ data: request });
  } catch {
    throw new Error("Couldn't reach the AI. Check your connection and try again.");
  }
  if (!reply.ok) throw new Error(reply.error);
  return { text: reply.text, source: "ai" };
}
