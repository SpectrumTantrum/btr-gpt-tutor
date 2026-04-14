"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Classroom } from "@/lib/core/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassroomsList() {
  const [classrooms, setClassrooms] = useState<readonly Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/classroom");
        if (!res.ok) return;
        const json = await res.json();
        const list: Classroom[] = Array.isArray(json) ? json : (json.data ?? []);
        if (!cancelled) setClassrooms(list);
      } catch { /* ignore */ }
      finally { if (!cancelled) setIsLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2 px-2 pt-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (classrooms.length === 0) {
    return <p className="px-2 pt-3 text-center text-xs text-muted-foreground">No lessons yet.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {classrooms.map((c) => (
        <li key={c.id}>
          <Link href={`/classroom/${c.id}`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-[color:var(--context-active)]/50">
            <div className="truncate font-medium text-foreground">{c.title}</div>
            <div className="caption mt-0.5">{c.scenes.length} scenes · {c.status}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
