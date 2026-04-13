import { describe, it, expect } from "vitest";
import { generateShareToken, buildShareUrl, isShareExpired } from "@/lib/classroom/sharing";

describe("Classroom Sharing", () => {
  it("generates a unique share token", () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThanOrEqual(16);
  });

  it("builds share URL from token", () => {
    const url = buildShareUrl("abc123", "https://example.com");
    expect(url).toBe("https://example.com/shared/classroom/abc123");
  });

  it("detects expired shares", () => {
    const expired = { id: "s1", classroomId: "c1", token: "t", createdBy: "u1", expiresAt: Date.now() - 1000, createdAt: Date.now() - 2000 };
    const valid = { id: "s2", classroomId: "c1", token: "t", createdBy: "u1", expiresAt: Date.now() + 100000, createdAt: Date.now() };
    const noExpiry = { id: "s3", classroomId: "c1", token: "t", createdBy: "u1", createdAt: Date.now() };
    expect(isShareExpired(expired)).toBe(true);
    expect(isShareExpired(valid)).toBe(false);
    expect(isShareExpired(noExpiry)).toBe(false);
  });
});
