import { Link } from "@tanstack/react-router";
import {
  FileSearch,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { migrateLegacySettings } from "@/lib/ai";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/research", label: "AI Research Assistant", icon: FileSearch },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Sparkles className="size-5" />
      </div>
      <div className="min-w-0 font-display leading-tight">
        <div className="truncate text-sm font-semibold">AI Workplace</div>
        <div className="truncate text-xs text-sidebar-muted">Productivity Assistant</div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pb-6 pt-6">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground" }}
            inactiveProps={{
              className:
                "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            }}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <Link
          to="/settings"
          onClick={onNavigate}
          className="block rounded-xl border border-sidebar-border bg-sidebar-accent p-4 transition-colors hover:border-sidebar-primary"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-2 rounded-full bg-sidebar-primary" />
            AI built in
          </div>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
            Every response is AI-generated. Review it before professional use.
          </p>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(migrateLegacySettings, []);
  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85%]">
            <SidebarContent onNavigate={() => setOpen(false)} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 grid size-9 place-items-center rounded-lg text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-sidebar-accent"
          >
            <Menu className="size-5" />
          </button>
          <Brand />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <footer className="border-t border-border px-4 py-4 sm:px-6 lg:px-10">
          <p className="mx-auto flex max-w-6xl items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-semibold text-foreground">Responsible AI:</strong>{" "}
              AI-generated content may contain errors, omissions or outdated information. Always
              review, fact-check and edit it before professional use.
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
