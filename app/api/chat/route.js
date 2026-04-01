import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_LIVE_MODEL = "gemini-3.1-flash-live-preview";
const MAX_HISTORY_MESSAGES = 5;
const MAX_MESSAGE_LENGTH = 500;

const SYSTEM_PROMPT = `
You are a friendly, caring, and patient AI companion designed for elderly people.

Talk in a warm, polite, and respectful tone. Use simple words and short sentences.

Your goals
- Ask about their day, health, meals, and feelings
- Provide emotional support
- Keep conversation natural and engaging

Rules:
- Always sound like a human, not like a robot
- Show empathy and kindness
- Avoid complex or technical words
- Never give medical or legal advice
- If serious health issues are mentioned, politely suggest speaking with a doctor
- Always end with a gentle follow-up question
- Keep the reply under 2 to 3 sentences
- Reply in simple Hindi if the user speaks Hindi
- Reply in simple Chinese if the user speaks Chinese
- Reply in simple English if the user speaks English
- Use the user's name Gautam occasionally when it feels natural
`;

function buildFallbackReply(message) {
  const lower = message.toLowerCase();

  if (/[\u3400-\u9FFF]/.test(message)) {
    if (
      lower.includes("sad") ||
      lower.includes("lonely") ||
      lower.includes("alone") ||
      lower.includes("upset") ||
      lower.includes("tired")
    ) {
      return "我在这里陪着你。心里难受的时候，慢慢说也没关系。你现在想和我聊聊今天的感受吗？";
    }

    return "我在这里陪你聊天。你今天过得怎么样？你按时吃饭了吗？";
  }

  if (
    lower.includes("sad") ||
    lower.includes("lonely") ||
    lower.includes("alone") ||
    lower.includes("upset") ||
    lower.includes("tired")
  ) {
    return "I am here with you. It is okay to have a heavy day, and you do not have to carry it alone. Would you like to tell me a little more about how you are feeling?";
  }

  if (
    lower.includes("happy") ||
    lower.includes("good") ||
    lower.includes("great") ||
    lower.includes("nice") ||
    lower.includes("walk")
  ) {
    return "That sounds lovely. I am glad to hear something good from your day. What was the nicest part of it?";
  }

  if (/[\u0900-\u097F]/.test(message)) {
    return "मैं आपके साथ हूँ। आराम से बताइए, आज आपका दिन कैसा रहा? क्या आपने समय पर खाना खाया?";
  }

  return "I am here with you. Please take your time and tell me how your day has been. Did you eat your meals on time today?";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => {
      if (typeof item === "string") {
        return { role: "user", text: item.trim() };
      }

      const role = item?.role === "assistant" || item?.role === "model"
        ? "model"
        : "user";
      const text = typeof item?.text === "string" ? item.text.trim() : "";

      if (!text) {
        return null;
      }

      return { role, text };
    })
    .filter(Boolean);
}

export async function POST(request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing Gemini API key. Add GEMINI_API_KEY to your environment." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = normalizeHistory(body?.history);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const promptParts = [
      { text: SYSTEM_PROMPT.trim() },
      ...history.map((item) => ({
        text: `${item.role === "model" ? "Assistant" : "User"}: ${item.text}`,
      })),
      { text: `User: ${message.slice(0, MAX_MESSAGE_LENGTH)}` },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_LIVE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: promptParts,
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 120,
            topP: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || "Gemini could not generate a response.";
      const isRateLimited =
        response.status === 429 ||
        /resource exhausted|rate limit|quota/i.test(errorMessage);

      if (isRateLimited) {
        return NextResponse.json({
          reply: buildFallbackReply(message),
          degraded: true,
        });
      }

      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "The assistant returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while contacting the assistant." },
      { status: 500 }
    );
  }
}
