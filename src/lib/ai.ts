import { createLocalStore } from "./storage";

export type Provider = "openai" | "gemini" | "openrouter" | "custom";

export const PROVIDERS: Record<
  Provider,
  { label: string; baseUrl: string; model: string; keyHelp: string }
> = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5-mini",
    keyHelp: "Create a key at platform.openai.com → API keys.",
  },
  gemini: {
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    keyHelp: "Create a key at aistudio.google.com → Get API key.",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-5-mini",
    keyHelp: "Create a key at openrouter.ai → Keys.",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    baseUrl: "",
    model: "",
    keyHelp: "Any service that offers an OpenAI-compatible chat endpoint.",
  },
};

export type Settings = {
  name: string;
  provider: Provider;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  provider: "openai",
  baseUrl: PROVIDERS.openai.baseUrl,
  model: PROVIDERS.openai.model,
  apiKey: "",
};

export const settingsStore = createLocalStore<Settings>("awpa.settings", DEFAULT_SETTINGS);

/** Real AI is only used when a key, endpoint and model are all present. Otherwise: demo mode. */
export function isAiConfigured(s: Settings): boolean {
  return s.apiKey.trim() !== "" && s.baseUrl.trim() !== "" && s.model.trim() !== "";
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type Source = "ai" | "demo";
export type AiResult = { text: string; source: Source };

export async function chatCompletion(s: Settings, messages: ChatMessage[]): Promise<string> {
  const url = `${s.baseUrl.trim().replace(/\/+$/, "")}/chat/completions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.apiKey.trim()}`,
      },
      body: JSON.stringify({ model: s.model.trim(), messages }),
    });
  } catch {
    throw new Error(
      "Couldn't reach the AI service. Check your connection and the service address in Settings.",
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { message?: string } | string };
      detail = typeof body.error === "string" ? body.error : (body.error?.message ?? "");
    } catch {
      // No readable error body.
    }
    if (res.status === 401 || res.status === 403)
      throw new Error("The AI service rejected your API key. Check it in Settings.");
    if (res.status === 404)
      throw new Error(`Model or address not found. Check them in Settings. ${detail}`.trim());
    if (res.status === 429)
      throw new Error("The AI service is rate-limiting or out of credit. Try again shortly.");
    throw new Error(`The AI service returned an error (${res.status}). ${detail}`.trim());
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI service returned an empty response. Please try again.");
  return text;
}

/**
 * Runs a request with real AI when configured. In demo mode it returns the
 * template output, always tagged as "demo" so the UI never presents it as AI.
 * A failed AI request throws; it never silently falls back to demo content.
 */
export async function runAi(
  s: Settings,
  messages: ChatMessage[],
  demo: () => string,
): Promise<AiResult> {
  if (!isAiConfigured(s)) return { text: demo(), source: "demo" };
  return { text: await chatCompletion(s, messages), source: "ai" };
}
