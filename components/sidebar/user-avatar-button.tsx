"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { isMultiUserMode } from "@/lib/core/auth/middleware";

export function UserAvatarButton() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const initial = user?.email?.[0]?.toUpperCase() ?? "U";
  const label = user?.email ?? "Personal Mode";

  async function handleLogout() {
    if (isMultiUserMode()) {
      try {
        const mod = await import("@/lib/core/auth/supabase-client");
        const client = mod.createSupabaseClient();
        await client.auth.signOut();
      } catch { /* ignore */ }
    }
    clearUser();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        render={
          <button
            className="mt-2 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white"
          />
        }
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[color:var(--accent)] text-white text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" sideOffset={10} align="end">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <UserIcon className="mr-2 size-3.5" /> Settings
        </DropdownMenuItem>
        {isMultiUserMode() ? (
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 size-3.5" /> Sign out
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
