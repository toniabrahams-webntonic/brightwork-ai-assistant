import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, isAiConfigured, runAi } from "@/lib/ai";
import { TONES } from "@/lib/prompts";

describe("AI mode", () => {
  it("offers exactly the Formal, Friendly and Persuasive tones", () => {
    expect([...TONES]).toEqual(["Formal", "Friendly", "Persuasive"]);
  });

  it("is in demo mode until an API key is saved", () => {
    expect(isAiConfigured(DEFAULT_SETTINGS)).toBe(false);
    expect(isAiConfigured({ ...DEFAULT_SETTINGS, apiKey: "key-123" })).toBe(true);
  });

  it("labels output as demo, never as AI, when no key is configured", async () => {
    const result = await runAi(DEFAULT_SETTINGS, [], () => "template");
    expect(result).toEqual({ text: "template", source: "demo" });
  });
});
