import type { Source } from "./ai";
import { createLocalStore } from "./storage";

export type ActivityType = "email" | "research" | "chat";
export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  source: Source;
  at: number;
};

export const activityStore = createLocalStore<Activity[]>("awpa.activity", []);

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function logActivity(type: ActivityType, title: string, source: Source) {
  const clean = title.trim().replace(/\s+/g, " ");
  const entry: Activity = {
    id: newId(),
    type,
    title: clean.length > 80 ? `${clean.slice(0, 77)}...` : clean,
    source,
    at: Date.now(),
  };
  activityStore.set((prev) => [entry, ...prev].slice(0, 200));
}

/** Rough, fixed estimates of minutes saved per task; shown to users as an estimate. */
export const MINUTES_SAVED: Record<ActivityType, number> = { email: 10, research: 20, chat: 3 };

export type ChatEntry = { id: string; role: "user" | "assistant"; content: string; source?: Source };
export const chatStore = createLocalStore<ChatEntry[]>("awpa.chat", []);
