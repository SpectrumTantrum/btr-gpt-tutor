import { describe, it, expect } from "vitest";
import { buildTTSRequest, parseTTSProviders } from "@/lib/core/media/tts-providers";

describe("TTS Providers", () => {
  it("builds OpenAI TTS request body", () => {
    const body = buildTTSRequest("openai", "Hello world", { voiceId: "alloy" });
    expect(body.model).toBe("tts-1");
    expect(body.input).toBe("Hello world");
    expect(body.voice).toBe("alloy");
  });

  it("defaults voice to alloy when not specified", () => {
    const body = buildTTSRequest("openai", "Test", {});
    expect(body.voice).toBe("alloy");
  });

  it("parses available providers from env vars", () => {
    const providers = parseTTSProviders({ TTS_OPENAI_API_KEY: "sk-test", TTS_AZURE_API_KEY: "" });
    expect(providers).toContain("openai");
    expect(providers).not.toContain("azure");
  });
});
