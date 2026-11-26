import type { ChatMessage } from "./ai";

export const TONES = ["Formal", "Friendly", "Persuasive"] as const;
export type Tone = (typeof TONES)[number];

const TONE_GUIDE: Record<Tone, string> = {
  Formal:
    "Formal: polished, respectful and precise. No contractions, no slang, measured sentences.",
  Friendly:
    "Friendly: warm, approachable and conversational while staying professional. Contractions are fine.",
  Persuasive:
    "Persuasive: confident and benefit-led. Give clear reasons, address likely objections, end with a specific call to action.",
};

export type EmailInput = {
  purpose: string;
  recipient: string;
  details: string;
  tone: Tone;
  sender: string;
};

export function buildEmailMessages(i: EmailInput): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "ROLE: You are an expert business communications writer who drafts workplace emails.",
        "TASK: Write one complete, realistic, ready-to-send email from the details provided.",
        `TONE: ${TONE_GUIDE[i.tone]}`,
        "RULES:",
        "- Use only the facts provided. Never invent names, dates, figures or commitments.",
        "- If an essential fact is missing, insert a short placeholder in [square brackets].",
        "- Keep it concise: usually 90-180 words unless the details clearly need more.",
        "- One clear purpose, one clear next step.",
        "OUTPUT FORMAT (plain text only, no markdown, no commentary):",
        "Subject: <subject line>",
        "",
        "<greeting>",
        "",
        "<body paragraphs>",
        "",
        "<sign-off>",
        "<sender name>",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `Email purpose: ${i.purpose}`,
        `Recipient: ${i.recipient}`,
        `Key details to include: ${i.details || "(none provided)"}`,
        `Tone: ${i.tone}`,
        `Sender name: ${i.sender || "[Your name]"}`,
      ].join("\n"),
    },
  ];
}

export function isArticle(input: string): boolean {
  return input.trim().split(/\s+/).length > 60;
}

export function buildResearchMessages(input: string): ChatMessage[] {
  const article = isArticle(input);
  return [
    {
      role: "system",
      content: [
        "ROLE: You are a senior research analyst preparing a briefing for a busy professional.",
        article
          ? "TASK: Analyse the article the user pasted. Base every statement on the article itself."
          : "TASK: Produce a research briefing on the topic the user gives, using your general knowledge.",
        "RULES:",
        "- Be specific and substantive; avoid filler and generic statements.",
        "- Never fabricate statistics, quotes, sources or citations.",
        "- Clearly mark anything uncertain or that should be verified.",
        article
          ? "- Do not add outside facts unless you label them as outside context."
          : "- State that the briefing is based on general knowledge and may be out of date.",
        "OUTPUT FORMAT (plain text only, no markdown symbols). Use exactly these four headings in capitals:",
        "SUMMARY",
        "<one detailed paragraph of 4-6 sentences>",
        "",
        "KEY FINDINGS",
        "<5-7 lines, each starting with '- '>",
        "",
        "INSIGHTS",
        "<3-5 lines, each starting with '- ', explaining what the findings mean and why they matter>",
        "",
        "RECOMMENDATIONS",
        "<3-5 numbered, practical next steps for a workplace setting>",
      ].join("\n"),
    },
    {
      role: "user",
      content: article ? `Article to analyse:\n\n${input.trim()}` : `Topic: ${input.trim()}`,
    },
  ];
}

export const CHAT_SYSTEM_PROMPT = [
  "ROLE: You are a knowledgeable workplace assistant for professionals.",
  "SCOPE: Workplace topics only: communication, meetings, time management, productivity, teamwork, leadership, feedback, career development, planning, professional writing, workplace tools and wellbeing at work.",
  "If a question is unrelated to work, say briefly that you focus on workplace topics and offer a related angle.",
  "STYLE:",
  "- Give a direct answer first, then detailed, practical guidance.",
  "- Use short paragraphs and simple '- ' lists or numbered steps where useful. Plain text only, no markdown symbols.",
  "- Offer concrete examples, wording or templates when they help.",
  "- Ask one clarifying question only when the request is genuinely ambiguous.",
  "SAFETY: For legal, medical, HR-dispute or financial matters, give general guidance and recommend consulting a qualified professional or the organisation's HR team. Never invent facts, policies or statistics.",
].join("\n");

export const SUGGESTED_PROMPTS = [
  "How do I run a shorter, more effective team meeting?",
  "Help me prioritise a heavy workload this week",
  "How should I give constructive feedback to a colleague?",
  "Write an agenda for a project kickoff meeting",
];
