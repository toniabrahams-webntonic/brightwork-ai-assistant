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
import { runAi, type Source } from "@/lib/ai";
import { generateAi } from "@/lib/ai.functions";
import { LIMITS } from "@/lib/ai-schema";
import { isArticle } from "@/lib/prompts";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Enter a topic or paste an article to get a summary, key findings, insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content:
          "Enter a topic or paste an article to get a summary, key findings, insights and recommendations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const generateFn = useServerFn(generateAi);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(false);

  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const article = isArticle(input);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Enter a topic or paste an article first.");
      return;
    }
    setLoading(true);
    try {
      const result = await runAi(generateFn, { kind: "research", input });
      setOutput(result.text);
      setSource(result.source);
      logActivity("research", input, result.source);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Research Assistant"
        description="Get a summary, key findings, insights and recommendations from a topic or an article."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={generate} className="surface flex flex-col gap-5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Topic or article</h2>
          <Field
            label="What should be researched?"
            htmlFor="research-input"
            hint="Type a short topic, or paste the full text of an article or report."
          >
            <textarea
              id="research-input"
              maxLength={LIMITS.research}
              rows={14}
              className={`${inputClass} resize-y`}
              placeholder="e.g. The impact of hybrid working on team collaboration"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Field>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {words} {words === 1 ? "word" : "words"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground">
              {article ? "Treated as an article" : "Treated as a topic"}
            </span>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Generate research brief
          </Button>
        </form>

        <OutputPanel
          title="Research brief"
          text={output}
          onChange={setOutput}
          source={source}
          loading={loading}
          placeholder="Your summary, key findings, insights and recommendations will appear here."
        />
      </div>
    </>
  );
}
