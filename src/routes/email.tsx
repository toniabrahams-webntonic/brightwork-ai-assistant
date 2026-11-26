import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Field, inputClass } from "@/components/field";
import { OutputPanel } from "@/components/output-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { logActivity } from "@/lib/activity";
import { runAi, settingsStore, type Source } from "@/lib/ai";
import { generateAi } from "@/lib/ai.functions";
import { LIMITS } from "@/lib/ai-schema";
import { TONES, type Tone } from "@/lib/prompts";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Turn a purpose, recipient and key details into a professional, editable email.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Turn a purpose, recipient and key details into a professional, editable email.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const settings = settingsStore.use();
  const generateFn = useServerFn(generateAi);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [output, setOutput] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !recipient.trim()) {
      toast.error("Add the email purpose and the recipient first.");
      return;
    }
    setLoading(true);
    try {
      const result = await runAi(generateFn, {
        kind: "email",
        purpose,
        recipient,
        details,
        tone,
        sender: settings.name.slice(0, LIMITS.sender),
      });
      setOutput(result.text);
      setSource(result.source);
      logActivity("email", `${purpose} → ${recipient}`, result.source);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Smart Email Generator"
        description="Describe what you need to say and get a ready-to-send email you can edit."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={generate} className="surface space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Email details</h2>
          <Field label="Email purpose" htmlFor="purpose">
            <input
              id="purpose"
              maxLength={LIMITS.purpose}
              className={inputClass}
              placeholder="e.g. Request a deadline extension for the Q3 report"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </Field>
          <Field label="Recipient" htmlFor="recipient">
            <input
              id="recipient"
              maxLength={LIMITS.recipient}
              className={inputClass}
              placeholder="e.g. Priya Naidoo, Finance Manager"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </Field>
          <Field
            label="Key details"
            htmlFor="details"
            hint="Dates, figures, context and anything that must be mentioned. One point per line works well."
          >
            <textarea
              id="details"
              maxLength={LIMITS.details}
              rows={6}
              className={`${inputClass} resize-y`}
              placeholder={"e.g. Data from sales arrived late\nNew date: Friday 4 December\nDraft is 80% complete"}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Field>
          <div>
            <div className="mb-1.5 text-sm font-semibold">Tone</div>
            <div
              role="radiogroup"
              aria-label="Tone"
              className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
            >
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tone === t}
                  onClick={() => setTone(t)}
                  className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${
                    tone === t
                      ? "bg-ink text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Generate email
          </Button>
        </form>

        <OutputPanel
          title="Your email"
          text={output}
          onChange={setOutput}
          source={source}
          loading={loading}
          placeholder="Your email will appear here. You can copy it or edit it before sending."
        />
      </div>
    </>
  );
}
