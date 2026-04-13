interface ASRConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface ASRController {
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function createBrowserASR(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  config: ASRConfig = {}
): ASRController {
  const SpeechRecognitionImpl =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  if (!SpeechRecognitionImpl) {
    return {
      start: () => onError("Speech recognition is not supported in this browser."),
      stop: () => undefined,
    };
  }

  const recognition = new SpeechRecognitionImpl();
  recognition.lang = config.lang ?? "en-US";
  recognition.continuous = config.continuous ?? false;
  recognition.interimResults = config.interimResults ?? true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    const isFinal = result.isFinal;
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(`Speech recognition error: ${event.error}`);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
