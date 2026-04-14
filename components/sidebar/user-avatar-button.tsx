"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";

export function UserAvatarButton() {
  const user = useAuthStore((s) => s.user);
  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <button
      aria-label="User menu"
      className="mt-2 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-[color:var(--accent)] text-white text-xs font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}
