const MAX_HISTORY_MESSAGES = 5;

export async function getAIResponse(message, history = []) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history: history.slice(-MAX_HISTORY_MESSAGES),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to get a reply right now.");
  }

  return data.reply;
}
