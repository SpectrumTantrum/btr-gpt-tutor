import type { AuthUser } from "@/lib/core/types";

export async function requireAuth(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  // In personal mode (no Supabase), return a default local user
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { id: "local_user", email: "local@btr-gpt-tutor.local" };
  }

  // Supabase token validation would go here
  return { id: token.slice(0, 12), email: "user@example.com" };
}

export function isMultiUserMode(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}
