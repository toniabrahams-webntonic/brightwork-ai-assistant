import {
  GatewayError,
  generateResponse,
  PaymentRequiredError,
  RateLimitError,
  type ResponsesInputItem,
} from "@lovable.dev/ai-gateway";
import { createServerFn } from "@tanstack/react-start";

import type { ChatMessage } from "./ai";
import { aiRequestSchema, type AiReply, type AiRequest } from "./ai-schema";
import { buildEmailMessages, buildResearchMessages, CHAT_SYSTEM_PROMPT } from "./prompts";

function buildMessages(req: AiRequest): ChatMessage[] {
  if (req.kind === "email") return buildEmailMessages(req);
  if (req.kind === "research") return buildResearchMessages(req.input);
  return [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...req.messages];
}

/**
 * The app's single AI endpoint. Prompts are built here on the server from a
 * validated request, so callers can't supply their own system instructions.
 */
export const generateAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => aiRequestSchema.parse(data))
  .handler(async ({ data }): Promise<AiReply> => {
    const messages = buildMessages(data);
    const instructions = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const input: ResponsesInputItem[] = messages
      .filter((m) => m.role !== "system")
      .map((m) =>
        m.role === "assistant"
          ? { role: "assistant", content: [{ type: "output_text", text: m.content }] }
          : { role: "user", content: m.content },
      );

    try {
      const res = await generateResponse({ model: "openai/gpt-6-astra", instructions, input });
      const text = res.output
        .flatMap((item) => (item.type === "message" ? item.content : []))
        .map((part) => (part.type === "output_text" ? part.text : ""))
        .join("")
        .trim();
      if (!text) return { ok: false, error: "The AI returned an empty response. Please try again." };
      return { ok: true, text };
    } catch (err) {
      if (err instanceof PaymentRequiredError)
        return {
          ok: false,
          error: "The AI has run out of credit. Add credits to the workspace, then try again.",
        };
      if (err instanceof RateLimitError)
        return { ok: false, error: "The AI is busy right now. Wait a moment, then try again." };
      console.error("AI request failed", err instanceof GatewayError ? err.toJSON() : err);
      return { ok: false, error: "The AI couldn't generate a response. Please try again." };
    }
  });
