import { NextRequest } from "next/server";
import { requireAuth, isMultiUserMode } from "./middleware";
import type { AuthUser } from "@/lib/core/types";

export interface AuthContext {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
}

/**
 * Returns an AuthContext for the incoming request.
 *
 * - Personal mode (no NEXT_PUBLIC_SUPABASE_URL): always returns the synthetic
 *   local user so every route works without credentials.
 * - Multi-user mode (Supabase configured): delegates to requireAuth, which
 *   validates the Bearer token.  user will be null when the token is missing
 *   or invalid.
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  if (!isMultiUserMode()) {
    return {
      user: { id: "local_user", email: "local@btr-gpt-tutor.local" },
      isAuthenticated: true,
    };
  }

  const user = await requireAuth(request);
  return {
    user,
    isAuthenticated: user !== null,
  };
}

/**
 * Resolves the authenticated user or throws AuthError (HTTP 401).
 *
 * Use this in API route handlers that must be protected:
 *
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuthOrFail(request);
 *   // user is guaranteed to be AuthUser here
 * }
 * ```
 *
 * Catch AuthError at the route level and return a 401 response:
 *
 * ```ts
 * } catch (err) {
 *   if (err instanceof AuthError) {
 *     return Response.json({ success: false, error: err.message }, { status: 401 });
 *   }
 *   throw err;
 * }
 * ```
 */
export async function requireAuthOrFail(request: NextRequest): Promise<AuthUser> {
  const ctx = await getAuthContext(request);
  if (!ctx.user) {
    throw new AuthError("Authentication required");
  }
  return ctx.user;
}

export class AuthError extends Error {
  readonly statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
