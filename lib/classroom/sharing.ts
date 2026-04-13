import { nanoid } from "nanoid";
import type { SharedClassroom } from "@/lib/core/types";

export function generateShareToken(): string {
  return nanoid(24);
}

export function buildShareUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/shared/classroom/${token}`;
}

export function isShareExpired(share: SharedClassroom): boolean {
  if (!share.expiresAt) return false;
  return share.expiresAt < Date.now();
}
