import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Clock, FileSearch, Mail, MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { activityStore, MINUTES_SAVED, type ActivityType } from "@/lib/activity";
import { settingsStore } from "@/lib/ai";
import { useHydrated } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your workplace AI hub: draft emails, summarise research, chat with an assistant and track recent activity.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Your workplace AI hub: draft emails, summarise research, chat with an assistant and track recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/email",
    type: "email",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Draft a professional email in a formal, friendly or persuasive tone.",
  },
  {
    to: "/research",
    type: "research",
    icon: FileSearch,
    title: "AI Research Assistant",
    text: "Summarise a topic or article into findings, insights and next steps.",
  },
  {
    to: "/chat",
    type: "chat",
    icon: MessageSquare,
    title: "AI Chatbot",
    text: "Ask workplace questions and get detailed, practical answers.",
  },
] as const;

const TYPE_META: Record<ActivityType, { label: string; icon: typeof Mail }> = {
  email: { label: "Email", icon: Mail },
  research: { label: "Research", icon: FileSearch },
  chat: { label: "Chat", icon: MessageSquare },
};

const DAY_MS = 86_400_000;

function Dashboard() {
  const hydrated = useHydrated();
  const settings = settingsStore.use();
  const activity = activityStore.use();

  const count = (t: ActivityType) => activity.filter((a) => a.type === t).length;
  const minutes = activity.reduce((sum, a) => sum + MINUTES_SAVED[a.type], 0);
  const saved = minutes >= 60 ? `${(minutes / 60).toFixed(1)} h` : `${minutes} min`;

  const stats = [
    { label: "Emails drafted", value: String(count("email")) },
    { label: "Research briefs", value: String(count("research")) },
    { label: "Chat questions", value: String(count("chat")) },
    { label: "Est. time saved", value: saved, highlight: true },
  ];

  const startOfToday = hydrated ? new Date().setHours(0, 0, 0, 0) : 0;
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = startOfToday - (6 - i) * DAY_MS;
    return {
      label: hydrated
        ? new Date(start).toLocaleDateString(undefined, { weekday: "short" })
        : "",
      total: activity.filter((a) => a.at >= start && a.at < start + DAY_MS).length,
    };
  });
  const peak = Math.max(1, ...week.map((d) => d.total));
  const name = settings.name.trim();

  return (
    <>
      <PageHeader
        title={name ? `Welcome back, ${name}` : "Welcome to your workspace"}
        description="Write, research and get answers faster. Pick a tool to get started."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, text }, i) => (
          <Link
            key={to}
            to={to}
            className={`group flex flex-col rounded-2xl border p-5 shadow-card transition-colors sm:p-6 ${
              i === 0
                ? "border-brand bg-brand hover:bg-brand/90"
                : "border-border bg-card hover:border-ink"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`grid size-11 place-items-center rounded-xl ${
                  i === 0 ? "bg-ink text-brand" : "bg-brand-soft"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <ArrowUpRight className="size-5 opacity-50 transition-opacity group-hover:opacity-100" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">{title}</h2>
            <p className={`mt-1 text-sm ${i === 0 ? "text-foreground/75" : "text-muted-foreground"}`}>
              {text}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="surface p-5 sm:p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold">Productivity overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Based on activity saved in this browser.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`rounded-xl p-4 ${s.highlight ? "bg-ink text-background" : "bg-muted"}`}
              >
                <div className={`font-display text-2xl font-semibold ${s.highlight ? "text-brand" : ""}`}>
                  {s.value}
                </div>
                <div className={`mt-1 text-xs ${s.highlight ? "text-background/70" : "text-muted-foreground"}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold">Last 7 days</div>
            <div className="mt-3 flex h-32 items-end gap-2 sm:gap-3">
              {week.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold tabular-nums">{d.total || ""}</span>
                  <div
                    className={`w-full rounded-md ${d.total ? "bg-brand" : "bg-muted"}`}
                    style={{ height: `${Math.max(6, (d.total / peak) * 100)}%` }}
                  />
                  <span className="h-4 text-xs text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Time saved is a rough estimate: {MINUTES_SAVED.email} min per email,{" "}
            {MINUTES_SAVED.research} min per research brief and {MINUTES_SAVED.chat} min per chat
            question.
          </p>
        </section>

        <section className="surface p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <div className="mt-5 grid place-items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <Clock className="size-6 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing yet. Your emails, research briefs and chat questions will show up here.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {activity.slice(0, 7).map((a) => {
                const { label, icon: Icon } = TYPE_META[a.type];
                return (
                  <li key={a.id}>
                    <Link
                      to={a.type === "email" ? "/email" : a.type === "research" ? "/research" : "/chat"}
                      className="flex items-center gap-3 py-3 hover:opacity-70"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {label} · {a.source === "ai" ? "AI" : "Earlier sample"} ·{" "}
                          {formatDistanceToNow(a.at, { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
