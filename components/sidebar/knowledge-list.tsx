"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useKnowledgeStore } from "@/lib/store/knowledge-store";
import { Skeleton } from "@/components/ui/skeleton";

export function KnowledgeList() {
  const kbs = useKnowledgeStore((s) => s.knowledgeBases);
  const setKbs = useKnowledgeStore((s) => s.setKnowledgeBases);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/knowledge");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setKbs(data);
      } catch { /* ignore */ }
    }
    void load();
    return () => { cancelled = true; };
  }, [setKbs]);

  if (kbs.length === 0) {
    return (
      <div className="space-y-2 px-2 pt-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <p className="pt-3 text-center text-xs text-muted-foreground">Create your first knowledge base.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {kbs.map((kb) => (
        <li key={kb.id}>
          <Link href={`/knowledge?id=${kb.id}`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-[color:var(--context-active)]/50">
            <div className="truncate font-medium text-foreground">{kb.name}</div>
            <div className="caption mt-0.5">{kb.documentCount} docs · {kb.chunkCount} chunks</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
