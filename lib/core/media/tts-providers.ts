const DEFAULT_VOICE = "alloy";
const DEFAULT_MODEL = "tts-1";
const DEFAULT_RESPONSE_FORMAT = "mp3";
const TTS_SPEECH_ENDPOINT = "/audio/speech";

type TTSProvider = "openai" | "azure" | "elevenlabs";

interface TTSOptions {
  voiceId?: string;
  model?: string;
  responseFormat?: string;
}

interface TTSRequestBody {
  model: string;
  input: string;
  voice: string;
  response_format: string;
}

interface EnvVars {
  TTS_OPENAI_API_KEY?: string;
  TTS_AZURE_API_KEY?: string;
  TTS_ELEVENLABS_API_KEY?: string;
  [key: string]: string | undefined;
}

export function buildTTSRequest(
  provider: TTSProvider,
  text: string,
  options: TTSOptions
): TTSRequestBody {
  if (provider !== "openai") {
    throw new Error(`Unsupported TTS provider: ${provider}`);
  }

  return {
    model: options.model ?? DEFAULT_MODEL,
    input: text,
    voice: options.voiceId ?? DEFAULT_VOICE,
    response_format: options.responseFormat ?? DEFAULT_RESPONSE_FORMAT,
  };
}

export async function generateSpeech(
  text: string,
  apiKey: string,
  options: TTSOptions = {},
  baseUrl = "https://api.openai.com/v1"
): Promise<ArrayBuffer> {
  const body = buildTTSRequest("openai", text, options);

  const response = await fetch(`${baseUrl}${TTS_SPEECH_ENDPOINT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS request failed (${response.status}): ${errorText}`);
  }

  return response.arrayBuffer();
}

const PROVIDER_ENV_KEYS: Record<TTSProvider, keyof EnvVars> = {
  openai: "TTS_OPENAI_API_KEY",
  azure: "TTS_AZURE_API_KEY",
  elevenlabs: "TTS_ELEVENLABS_API_KEY",
};

export function parseTTSProviders(env: EnvVars): TTSProvider[] {
  return (Object.entries(PROVIDER_ENV_KEYS) as [TTSProvider, keyof EnvVars][])
    .filter(([, envKey]) => {
      const value = env[envKey as string];
      return typeof value === "string" && value.length > 0;
    })
    .map(([provider]) => provider);
}
