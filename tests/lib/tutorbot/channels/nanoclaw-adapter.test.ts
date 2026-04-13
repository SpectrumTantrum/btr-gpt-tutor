import { describe, it, expect } from "vitest";
import { createNanoclawAdapter } from "@/lib/tutorbot/channels/nanoclaw-adapter";

describe("NanoclawAdapter", () => {
  it("parses incoming nanoclaw webhook payload", () => {
    const adapter = createNanoclawAdapter({ callbackUrl: "https://example.com/callback" });
    const msg = adapter.parseIncoming({
      sender: { id: "user_123", name: "Torres" },
      message: { text: "Explain eigenvalues" },
      channel: { id: "ch_456", type: "telegram" },
      timestamp: 1700000000,
    });
    expect(msg.senderId).toBe("user_123");
    expect(msg.content).toBe("Explain eigenvalues");
    expect(msg.channelType).toBe("telegram");
  });

  it("throws on malformed payload", () => {
    const adapter = createNanoclawAdapter({ callbackUrl: "https://example.com" });
    expect(() => adapter.parseIncoming({})).toThrow();
    expect(() => adapter.parseIncoming(null)).toThrow();
  });

  it("has webhook channel type", () => {
    const adapter = createNanoclawAdapter({ callbackUrl: "https://example.com" });
    expect(adapter.channelType).toBe("webhook");
  });
});
