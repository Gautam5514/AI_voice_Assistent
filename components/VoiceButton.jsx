export default function VoiceButton({
  isListening,
  isSupported,
  disabled,
  onClick,
}) {
  const label = !isSupported
    ? "Voice not supported"
    : isListening
      ? "Listening..."
      : "Tap to speak";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isSupported}
      className={`voice-button ${isListening ? "voice-button--active" : ""}`}
      aria-pressed={isListening}
      aria-label={label}
      title={label}
    >
      <span className="voice-button__ring" />
      <span className="voice-button__icon">{isListening ? "◼" : "🎙"}</span>
      <span className="voice-button__label">{label}</span>
    </button>
  );
}
