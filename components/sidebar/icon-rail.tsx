"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  GraduationCap,
  BookOpen,
  PenLine,
  Compass,
  NotebookPen,
  Bot,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserAvatarButton } from "@/components/sidebar/user-avatar-button";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/co-writer", label: "Co-Writer", icon: PenLine },
  { href: "/guide", label: "Guide", icon: Compass },
  { href: "/notebook", label: "Notebook", icon: NotebookPen },
  { href: "/tutorbot", label: "TutorBot", icon: Bot },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={200}>
      <aside
        aria-label="Primary navigation"
        className="flex h-screen w-14 shrink-0 flex-col items-center gap-1 teal-gradient py-3.5"
      >
        <Link
          href="/"
          aria-label="btr-gpt-tutor home"
          className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold"
          style={{ color: "var(--primary)" }}
        >
          b
        </Link>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Tooltip key={href}>
              <TooltipTrigger
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                render={
                  <Link href={href} aria-label={label} />
                }
              >
                <Icon className="size-[18px]" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              pathname.startsWith("/settings")
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            render={
              <Link href="/settings" aria-label="Settings" />
            }
          >
            <Settings className="size-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Settings
          </TooltipContent>
        </Tooltip>

        <UserAvatarButton />
      </aside>
    </TooltipProvider>
  );
}
