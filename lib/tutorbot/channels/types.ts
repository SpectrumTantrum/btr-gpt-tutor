export interface ChannelMessage {
  readonly channelId: string;
  readonly channelType: "telegram" | "discord" | "slack" | "feishu" | "webhook";
  readonly senderId: string;
  readonly senderName: string;
  readonly content: string;
  readonly timestamp: number;
}

export interface ChannelResponse {
  readonly content: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ChannelAdapter {
  readonly channelType: string;
  sendMessage(channelId: string, response: ChannelResponse): Promise<void>;
  parseIncoming(raw: unknown): ChannelMessage;
}
