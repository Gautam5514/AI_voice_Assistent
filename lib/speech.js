const HINDI_PATTERN = /[\u0900-\u097F]/;
const CHINESE_PATTERN = /[\u3400-\u9FFF]/;

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognition());
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function detectLanguage(text = "") {
  if (CHINESE_PATTERN.test(text)) {
    return "zh-CN";
  }

  if (HINDI_PATTERN.test(text)) {
    return "hi-IN";
  }

  return "en-IN";
}

export function startListening({
  lang = "en-IN",
  onStart,
  onResult,
  onError,
  onEnd,
}) {
  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    throw new Error("Speech recognition is not supported in this browser.");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();

    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    onError?.(event.error || "Speech recognition failed.");
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return recognition;
}

export function stopListening(recognition) {
  recognition?.stop?.();
}

export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
}

export function speakText(text, options = {}) {
  if (!text || !isSpeechSynthesisSupported()) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || detectLanguage(text);
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
