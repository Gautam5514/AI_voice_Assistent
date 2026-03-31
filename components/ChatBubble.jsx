export default function ChatBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`chat-bubble-row ${isUser ? "chat-bubble-row--user" : ""}`}>
      <div className={`chat-bubble ${isUser ? "chat-bubble--user" : ""}`}>
        <p className="chat-bubble__role">{isUser ? "You" : "Saathi"}</p>
        <p className="chat-bubble__text">{text}</p>
      </div>
    </div>
  );
}
