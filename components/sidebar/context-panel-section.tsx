"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContextPanelSectionProps {
  readonly title: string;
  readonly onCreate?: () => void;
  readonly children: React.ReactNode;
}

export function ContextPanelSection({ title, onCreate, children }: ContextPanelSectionProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {onCreate ? (
          <Button
            size="icon-sm"
            variant="default"
            aria-label={`New ${title.toLowerCase()}`}
            onClick={onCreate}
            className="h-6 w-6"
          >
            <Plus className="size-3.5" />
          </Button>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">{children}</div>
    </div>
  );
}
