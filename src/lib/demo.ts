import type { EmailInput } from "./prompts";
import { isArticle } from "./prompts";

/**
 * Demo-mode content. These are fixed templates filled with the user's own
 * input. They are NOT AI-generated and the UI labels them as demo output.
 */

export function demoEmail(i: EmailInput): string {
  const recipient = i.recipient.trim() || "[Recipient]";
  const sender = i.sender.trim() || "[Your name]";
  const purpose = i.purpose.trim().replace(/\.$/, "");
  const details = i.details
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const detailBlock = details.length
    ? details.map((d) => `- ${d}`).join("\n")
    : "- [Add the key details here]";

  if (i.tone === "Formal") {
    return [
      `Subject: ${purpose}`,
      "",
      `Dear ${recipient},`,
      "",
      `I am writing regarding the following: ${purpose.toLowerCase()}.`,
      "",
      "Please find the relevant details below:",
      detailBlock,
      "",
      "I would be grateful if you could review this and let me know how you would like to proceed. Please do not hesitate to contact me should you require any further information.",
      "",
      "Yours sincerely,",
      sender,
    ].join("\n");
  }
  if (i.tone === "Friendly") {
    return [
      `Subject: ${purpose}`,
      "",
      `Hi ${recipient},`,
      "",
      `I hope you're doing well! I'm getting in touch about this: ${purpose.toLowerCase()}.`,
      "",
      "Here's what you need to know:",
      detailBlock,
      "",
      "Let me know what you think, and shout if you have any questions. Happy to chat it through.",
      "",
      "Thanks so much,",
      sender,
    ].join("\n");
  }
  return [
    `Subject: ${purpose}`,
    "",
    `Hello ${recipient},`,
    "",
    `I'd like to make the case for the following: ${purpose.toLowerCase()}.`,
    "",
    "Here is why it matters:",
    detailBlock,
    "",
    "Acting on this now would save time and avoid delays later. Could you confirm by [date] so we can move ahead?",
    "",
    "Best regards,",
    sender,
  ].join("\n");
}

export function demoResearch(input: string): string {
  const text = input.trim();
  if (isArticle(text)) {
    const sentences = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 30);
    const summary = sentences.slice(0, 3).join(" ") || text.slice(0, 400);
    const withNumbers = sentences.slice(3).filter((s) => /\d/.test(s));
    const picks = (withNumbers.length >= 3 ? withNumbers : sentences.slice(3)).slice(0, 5);
    return [
      "SUMMARY",
      "(Demo mode: these are the opening sentences of your text, not an AI summary.)",
      summary,
      "",
      "KEY FINDINGS",
      "(Demo mode: sentences lifted directly from your text.)",
      ...(picks.length ? picks.map((s) => `- ${s}`) : ["- [No further sentences found]"]),
      "",
      "INSIGHTS",
      "- Not available in demo mode. Connect an AI key in Settings to get real analysis.",
      "",
      "RECOMMENDATIONS",
      "- Not available in demo mode. Connect an AI key in Settings to get tailored next steps.",
    ].join("\n");
  }
  return [
    `RESEARCH BRIEF TEMPLATE: ${text}`,
    "(Demo mode: this is a blank structure to fill in yourself. No research has been carried out.)",
    "",
    "SUMMARY",
    `[Describe ${text} in 4-6 sentences: what it is, why it matters now, who it affects.]`,
    "",
    "KEY FINDINGS",
    "- [Finding 1, with its source]",
    "- [Finding 2, with its source]",
    "- [Finding 3, with its source]",
    "",
    "INSIGHTS",
    "- [What do the findings mean for your team or organisation?]",
    "- [What is changing, and what stays uncertain?]",
    "",
    "RECOMMENDATIONS",
    "1. [Immediate action]",
    "2. [Next step and owner]",
    "3. [What to review later]",
  ].join("\n");
}

const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /meeting|agenda|kickoff|stand-?up/i,
    reply:
      "A common approach to better meetings:\n\n1. Share a short agenda with a goal for each item beforehand.\n2. Invite only the people who need to decide or contribute.\n3. Default to 25 or 50 minutes and start on time.\n4. End by confirming decisions, owners and deadlines.\n5. Send a three-line summary afterwards.",
  },
  {
    match: /priorit|workload|time|deadline|busy|overwhelm/i,
    reply:
      "A simple way to prioritise a heavy workload:\n\n1. List everything in one place.\n2. Mark each item as urgent and/or important.\n3. Do urgent + important first; schedule important but not urgent.\n4. Delegate or decline what is neither.\n5. Block focus time in your calendar and agree any deadline changes early.",
  },
  {
    match: /feedback|review|colleague|conflict|difficult/i,
    reply:
      "A widely used feedback structure is Situation, Behaviour, Impact:\n\n- Situation: say when and where it happened.\n- Behaviour: describe what you observed, without judgement.\n- Impact: explain the effect it had.\n\nThen ask for their view and agree one next step together. Give feedback privately and soon after the event.",
  },
  {
    match: /email|write|message|reply/i,
    reply:
      "For clear workplace writing:\n\n- Put the request or decision needed in the first two lines.\n- Keep to one topic per message.\n- Use short paragraphs and a specific subject line.\n- End with who does what by when.\n\nTip: the Smart Email Generator in the menu can draft a full email for you.",
  },
];

export function demoChatReply(question: string): string {
  const hit = CANNED.find((c) => c.match.test(question));
  return (
    hit?.reply ??
    "Demo mode can only show a few pre-written tips (try asking about meetings, prioritising, feedback or writing). To get a real answer to this question, add an AI key in Settings."
  );
}
