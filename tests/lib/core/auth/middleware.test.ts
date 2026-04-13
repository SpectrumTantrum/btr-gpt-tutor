import { describe, it, expect } from "vitest";
import { requireAuth, isMultiUserMode } from "@/lib/core/auth/middleware";

describe("requireAuth", () => {
  it("returns null when no Authorization header is present", async () => {
    // Arrange
    const request = new Request("http://localhost/api/test");

    // Act
    const result = await requireAuth(request);

    // Assert
    expect(result).toBeNull();
  });

  it("returns null when Authorization header does not start with Bearer", async () => {
    // Arrange
    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Basic sometoken" },
    });

    // Act
    const result = await requireAuth(request);

    // Assert
    expect(result).toBeNull();
  });

  it("returns a local user in personal mode when no Supabase URL is configured", async () => {
    // Arrange
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Bearer sometoken123" },
    });

    // Act
    const result = await requireAuth(request);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.id).toBe("local_user");
    expect(result?.email).toBe("local@btr-gpt-tutor.local");

    // Cleanup
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }
  });
});

describe("isMultiUserMode", () => {
  it("returns false when no Supabase URL is configured", () => {
    // Arrange
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Act
    const result = isMultiUserMode();

    // Assert
    expect(result).toBe(false);

    // Cleanup
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }
  });
});
