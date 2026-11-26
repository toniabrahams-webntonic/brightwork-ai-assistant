import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, PlugZap, Save, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Field, inputClass } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { activityStore, chatStore } from "@/lib/activity";
import {
  chatCompletion,
  isAiConfigured,
  PROVIDERS,
  settingsStore,
  type Provider,
  type Settings,
} from "@/lib/ai";
import { useHydrated } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Connect your AI service, set your name and manage data saved in this browser.",
      },
      { property: "og:title", content: "Settings" },
      {
        property: "og:description",
        content: "Connect your AI service, set your name and manage data saved in this browser.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const hydrated = useHydrated();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Connect an AI service, personalise your workspace and manage saved data."
      />
      {hydrated ? <SettingsForm /> : null}
    </>
  );
}

function SettingsForm() {
  const saved = settingsStore.use();
  const [form, setForm] = useState<Settings>(() => settingsStore.get());
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const live = isAiConfigured(saved);

  const update = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }));

  const changeProvider = (provider: Provider) =>
    update({ provider, baseUrl: PROVIDERS[provider].baseUrl, model: PROVIDERS[provider].model });

  const save = (e: FormEvent) => {
    e.preventDefault();
    settingsStore.set(form);
    toast.success(
      isAiConfigured(form) ? "Saved. Real AI responses are on." : "Saved. The app is in demo mode.",
    );
  };

  const test = async () => {
    if (!isAiConfigured(form)) {
      toast.error("Enter an API key, service address and model first.");
      return;
    }
    setTesting(true);
    try {
      await chatCompletion(form, [{ role: "user", content: "Reply with the single word: ready" }]);
      settingsStore.set(form);
      toast.success("Connection works. Settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setTesting(false);
    }
  };

  const removeKey = () => {
    const next = { ...form, apiKey: "" };
    setForm(next);
    settingsStore.set(next);
    toast.success("API key removed. The app is in demo mode.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={save} className="surface space-y-5 p-5 sm:p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">AI connection</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              live ? "bg-ink text-brand" : "border border-dashed border-ink/40 bg-brand-soft"
            }`}
          >
            {live ? "AI connected" : "Demo mode"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Add your own API key to get real AI responses. Without a key, the app runs in demo mode
          and shows sample templates that are clearly labelled as not AI-generated.
        </p>

        <Field label="Your name" htmlFor="name" hint="Used in the welcome message and email sign-offs.">
          <input
            id="name"
            className={inputClass}
            placeholder="e.g. Toni Abrahams"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>

        <Field label="AI service" htmlFor="provider" hint={PROVIDERS[form.provider].keyHelp}>
          <select
            id="provider"
            className={inputClass}
            value={form.provider}
            onChange={(e) => changeProvider(e.target.value as Provider)}
          >
            {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDERS[p].label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Service address" htmlFor="baseUrl">
            <input
              id="baseUrl"
              className={inputClass}
              placeholder="https://…/v1"
              value={form.baseUrl}
              onChange={(e) => update({ baseUrl: e.target.value })}
            />
          </Field>
          <Field label="Model" htmlFor="model">
            <input
              id="model"
              className={inputClass}
              placeholder="Model name"
              value={form.model}
              onChange={(e) => update({ model: e.target.value })}
            />
          </Field>
        </div>

        <Field
          label="API key"
          htmlFor="apiKey"
          hint="Stored only in this browser and sent directly to the AI service you chose. Don't use this on a shared computer."
        >
          <div className="relative">
            <input
              id="apiKey"
              type={showKey ? "text" : "password"}
              autoComplete="off"
              className={`${inputClass} pr-11`}
              placeholder="Paste your key"
              value={form.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
            />
            <button
              type="button"
              aria-label={showKey ? "Hide key" : "Show key"}
              onClick={() => setShowKey((s) => !s)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit">
            <Save /> Save settings
          </Button>
          <Button type="button" variant="ink" onClick={test} disabled={testing}>
            {testing ? <Loader2 className="animate-spin" /> : <PlugZap />} Test connection
          </Button>
          <Button type="button" variant="outline" onClick={removeKey} disabled={!form.apiKey}>
            <Trash2 /> Remove key
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <section className="surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Saved data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent activity and chat history are saved in this browser only.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                activityStore.set([]);
                toast.success("Recent activity cleared");
              }}
            >
              <Trash2 /> Clear recent activity
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                chatStore.set([]);
                toast.success("Chat history cleared");
              }}
            >
              <Trash2 /> Clear chat history
            </Button>
          </div>
        </section>

        <section className="rounded-2xl bg-ink p-5 text-background sm:p-6">
          <h2 className="text-lg font-semibold text-brand">Responsible AI</h2>
          <p className="mt-2 text-sm leading-relaxed text-background/80">
            AI-generated content may contain errors, omissions or outdated information. Review,
            fact-check and edit everything before using it professionally, and avoid entering
            confidential or personal information.
          </p>
        </section>
      </div>
    </div>
  );
}
