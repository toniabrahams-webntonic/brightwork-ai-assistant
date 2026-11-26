import { z } from "zod";

import { TONES } from "./prompts";

/** Size limits for what the browser may send to the AI endpoint. */
export const LIMITS = {
  purpose: 300,
  recipient: 200,
  details: 4000,
  sender: 100,
  research: 40000,
  chatMessage: 8000,
  chatMessages: 20,
} as const;

export const aiRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("email"),
    purpose: z.string().trim().min(1).max(LIMITS.purpose),
    recipient: z.string().trim().min(1).max(LIMITS.recipient),
    details: z.string().max(LIMITS.details),
    tone: z.enum(TONES),
    sender: z.string().max(LIMITS.sender),
  }),
  z.object({
    kind: z.literal("research"),
    input: z.string().trim().min(1).max(LIMITS.research),
  }),
  z.object({
    kind: z.literal("chat"),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(LIMITS.chatMessage),
        }),
      )
      .min(1)
      .max(LIMITS.chatMessages),
  }),
]);

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type AiReply = { ok: true; text: string } | { ok: false; error: string };
