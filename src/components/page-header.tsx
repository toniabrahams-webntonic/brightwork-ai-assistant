import { Link } from "@tanstack/react-router";
import { FlaskConical, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { isAiConfigured, settingsStore, type Source } from "@/lib/ai";

export function SourceBadge({ source, model }: { source: Source; model?: string }) {
  return source === "ai" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-background">
      <Sparkles className="size-3.5 text-brand" />
      AI-generated{model ? ` · ${model}` : ""}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/40 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
      <FlaskConical className="size-3.5" />
      Demo sample · not AI-generated
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/** Shown on every feature page while no AI key is saved. */
export function DemoNotice() {
  const settings = settingsStore.use();
  if (isAiConfigured(settings)) return null;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-dashed border-ink/30 bg-brand-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <FlaskConical className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm leading-relaxed">
          <strong className="font-semibold">Demo mode.</strong> No AI service is connected, so
          results here are pre-written sample templates and are not AI-generated.
        </p>
      </div>
      <Link
        to="/settings"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-background hover:bg-ink/85"
      >
        Connect AI
      </Link>
    </div>
  );
}
