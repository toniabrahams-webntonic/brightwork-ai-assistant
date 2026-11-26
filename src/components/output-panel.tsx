import { Check, Copy, Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Source } from "@/lib/ai";

import { SourceBadge } from "./page-header";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy. Select the text and copy it manually.");
  }
}

export function OutputPanel({
  title,
  text,
  onChange,
  source,
  loading,
  placeholder,
}: {
  title: string;
  text: string;
  onChange: (text: string) => void;
  source: Source | null;
  loading: boolean;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const hasText = text.trim() !== "";

  return (
    <section className="surface flex min-h-[26rem] flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasText || loading}
            onClick={() => copyText(text)}
          >
            <Copy /> Copy
          </Button>
          <Button
            variant={editing ? "ink" : "outline"}
            size="sm"
            disabled={!hasText || loading}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? <Check /> : <Pencil />} {editing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {source && hasText && !loading ? (
        <div className="mt-3">
          <SourceBadge source={source} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-1 flex-col">
        {loading ? (
          <div className="grid flex-1 place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Generating…
            </span>
          </div>
        ) : hasText || editing ? (
          <textarea
            aria-label={title}
            value={text}
            readOnly={!editing}
            onChange={(e) => onChange(e.target.value)}
            className={`min-h-[20rem] w-full flex-1 resize-y rounded-xl border p-4 text-sm leading-relaxed outline-none ${
              editing
                ? "border-ring bg-card ring-2 ring-ring/30"
                : "border-transparent bg-muted"
            }`}
          />
        ) : (
          <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}
      </div>
    </section>
  );
}
