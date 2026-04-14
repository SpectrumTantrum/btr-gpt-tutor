"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSessionStore } from "@/lib/store/session-store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/core/types";

function groupByDate(sessions: readonly Session[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const today: Session[] = [];
  const yesterday: Session[] = [];
  const earlier: Session[] = [];
  for (const s of sessions) {
    const age = now - s.updatedAt;
    if (age < day) today.push(s);
    else if (age < 2 * day) yesterday.push(s);
    else earlier.push(s);
  }
  return { today, yesterday, earlier };
}

export function SessionsList({ activeSessionId }: { activeSessionId?: string }) {
  const sessions = useSessionStore((s) => s.sessions);
  const setSessions = useSessionStore((s) => s.setSessions);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setSessions(data);
      } catch { /* ignore */ }
    }
    void load();
    return () => { cancelled = true; };
  }, [setSessions]);

  if (sessions.length === 0) {
    return (
      <div className="space-y-2 px-2 pt-2">
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
        <p className="pt-3 text-center text-xs text-muted-foreground">No sessions yet.</p>
      </div>
    );
  }

  const groups = groupByDate(sessions);
  return (
    <div className="space-y-3">
      {groups.today.length > 0 && <Group label="Today" items={groups.today} activeId={activeSessionId} />}
      {groups.yesterday.length > 0 && <Group label="Yesterday" items={groups.yesterday} activeId={activeSessionId} />}
      {groups.earlier.length > 0 && <Group label="Earlier" items={groups.earlier} activeId={activeSessionId} />}
    </div>
  );
}

function Group({ label, items, activeId }: { label: string; items: readonly Session[]; activeId?: string }) {
  return (
    <div>
      <div className="eyebrow px-2 pt-2 pb-1">{label}</div>
      <ul className="space-y-0.5">
        {items.map((s) => (
          <li key={s.id}>
            <Link
              href={`/chat?session=${s.id}`}
              className={cn(
                "block rounded-md px-2 py-1.5 text-xs transition-colors",
                activeId === s.id
                  ? "bg-[color:var(--context-active)] border-l-2 border-primary"
                  : "hover:bg-[color:var(--context-active)]/50"
              )}
            >
              <div className="truncate font-medium text-foreground">{s.title || "Untitled"}</div>
              <div className="caption mt-0.5">{s.messages.length} messages</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
