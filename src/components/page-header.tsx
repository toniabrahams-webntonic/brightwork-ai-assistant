import { FlaskConical, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import type { Source } from "@/lib/ai";

export function SourceBadge({ source }: { source: Source }) {
  return source === "ai" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-background">
      <Sparkles className="size-3.5 text-brand" />
      AI-generated
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/40 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
      <FlaskConical className="size-3.5" />
      Earlier sample · not AI-generated
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
