import type { ChannelAdapter, ChannelMessage, ChannelResponse } from "./types";

// Nanoclaw webhook payload shape from the HKUDS/nanobot ecosystem
interface NanoclawPayload {
  sender: { id: string; name: string };
  message: { text: string };
  channel: { id: string; type: string };
  timestamp: number;
}

interface NanoclawAdapterConfig {
  readonly callbackUrl: string;
  readonly secret?: string;
}

const VALID_CHANNEL_TYPES = new Set([
  "telegram",
  "discord",
  "slack",
  "feishu",
  "webhook",
]);

function isNanoclawPayload(raw: unknown): raw is NanoclawPayload {
  if (raw === null || typeof raw !== "object") return false;
  const p = raw as Record<string, unknown>;
  return (
    typeof p["sender"] === "object" &&
    p["sender"] !== null &&
    typeof (p["sender"] as Record<string, unknown>)["id"] === "string" &&
    typeof (p["sender"] as Record<string, unknown>)["name"] === "string" &&
    typeof p["message"] === "object" &&
    p["message"] !== null &&
    typeof (p["message"] as Record<string, unknown>)["text"] === "string" &&
    typeof p["channel"] === "object" &&
    p["channel"] !== null &&
    typeof (p["channel"] as Record<string, unknown>)["id"] === "string" &&
    typeof (p["channel"] as Record<string, unknown>)["type"] === "string" &&
    typeof p["timestamp"] === "number"
  );
}

class NanoclawAdapter implements ChannelAdapter {
  readonly channelType = "webhook";

  constructor(private readonly config: NanoclawAdapterConfig) {}

  parseIncoming(raw: unknown): ChannelMessage {
    if (!isNanoclawPayload(raw)) {
      throw new Error(
        "Invalid nanoclaw webhook payload: expected { sender, message, channel, timestamp }"
      );
    }

    const channelType = VALID_CHANNEL_TYPES.has(raw.channel.type)
      ? (raw.channel.type as ChannelMessage["channelType"])
      : "webhook";

    return {
      channelId: raw.channel.id,
      channelType,
      senderId: raw.sender.id,
      senderName: raw.sender.name,
      content: raw.message.text,
      timestamp: raw.timestamp,
    };
  }

  async sendMessage(channelId: string, response: ChannelResponse): Promise<void> {
    await fetch(this.config.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.secret
          ? { "X-Nanoclaw-Secret": this.config.secret }
          : {}),
      },
      body: JSON.stringify({
        channelId,
        content: response.content,
        metadata: response.metadata ?? null,
      }),
    });
  }
}

export function createNanoclawAdapter(
  config: NanoclawAdapterConfig
): ChannelAdapter {
  return new NanoclawAdapter(config);
}
