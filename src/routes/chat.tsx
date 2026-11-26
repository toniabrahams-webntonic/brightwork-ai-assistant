import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Loader2, MessageSquare, Pencil, Send, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { copyText } from "@/components/output-panel";
import { DemoNotice, PageHeader, SourceBadge } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { chatStore, logActivity, newId, type ChatEntry } from "@/lib/activity";
import { runAi, settingsStore, type ChatMessage } from "@/lib/ai";
import { demoChatReply } from "@/lib/demo";
import { CHAT_SYSTEM_PROMPT, SUGGESTED_PROMPTS } from "@/lib/prompts";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Ask workplace questions and get detailed, practical answers in a chat.",
      },
      { property: "og:title", content: "AI Workplace Chatbot" },
      {
        property: "og:description",
        content: "Ask workplace questions and get detailed, practical answers in a chat.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const settings = settingsStore.use();
  const messages = chatStore.use();
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setDraft("");
    const history: ChatEntry[] = [...messages, { id: newId(), role: "user", content: question }];
    chatStore.set(history);
    setLoading(true);
    try {
      const prompt: ChatMessage[] = [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      ];
      const result = await runAi(settings, prompt, () => demoChatReply(question));
      chatStore.set((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: result.text, source: result.source },
      ]);
      logActivity("chat", question, result.source);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  };

  const saveEdit = () => {
    chatStore.set((prev) =>
      prev.map((m) => (m.id === editingId ? { ...m, content: editText } : m)),
    );
    setEditingId(null);
  };

  const clear = () => {
    chatStore.set([]);
    setEditingId(null);
    toast.success("Chat cleared");
  };

  return (
    <>
      <PageHeader
        title="AI Workplace Chatbot"
        description="Ask about meetings, workload, feedback, writing and anything else at work."
        actions={
          <Button variant="outline" onClick={clear} disabled={messages.length === 0 || loading}>
            <Trash2 /> Clear chat
          </Button>
        }
      />
      <DemoNotice />

      <section className="surface flex h-[calc(100dvh-19rem)] min-h-[30rem] flex-col overflow-hidden">
        <div ref={scroller} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand">
                <MessageSquare className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">How can I help at work today?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pick a suggestion or type your own question below.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    className="rounded-xl border border-border bg-card p-3.5 text-left text-sm font-medium transition-colors hover:border-ink hover:bg-brand-soft"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="mx-auto max-w-3xl space-y-5">
              {messages.map((m) =>
                m.role === "user" ? (
                  <li key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-3 text-sm leading-relaxed text-background">
                      {m.content}
                    </div>
                  </li>
                ) : (
                  <li key={m.id} className="flex gap-3">
                    <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-brand">
                      <MessageSquare className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingId === m.id ? (
                        <div>
                          <textarea
                            aria-label="Edit response"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={8}
                            className="w-full resize-y rounded-xl border border-ring bg-card p-3 text-sm leading-relaxed outline-none ring-2 ring-ring/30"
                          />
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="ink" onClick={saveEdit}>
                              <Check /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm leading-relaxed">
                            {m.content}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <SourceBadge source={m.source ?? "demo"} />
                            <Button size="sm" variant="ghost" onClick={() => copyText(m.content)}>
                              <Copy /> Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(m.id);
                                setEditText(m.content);
                              }}
                            >
                              <Pencil /> Edit
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                ),
              )}
              {loading && (
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-foreground">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                  Thinking…
                </li>
              )}
            </ul>
          )}
        </div>

        {messages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2.5 sm:px-6">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => void send(p)}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-ink hover:bg-brand-soft disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="border-t border-border bg-card p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <textarea
              aria-label="Your question"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a workplace question…"
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={loading || !draft.trim()}
              className="size-10 shrink-0 rounded-xl"
            >
              <Send />
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
