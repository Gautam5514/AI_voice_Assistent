import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_LIVE_MODEL = "gemini-3.1-flash-live-preview";
const GEMINI_LIVE_VOICE = process.env.GEMINI_LIVE_VOICE || "Zephyr";

const SYSTEM_INSTRUCTION = `
You are AMI, a warm and patient live voice companion for elderly users.

Speak in a calm, caring, respectful tone.
Use short, clear sentences that are easy to understand when heard aloud.
If the user speaks Hindi, reply in simple Hindi.
If the user speaks Chinese, reply in simple Chinese.
If the user speaks English, reply in simple English.
Ask about the user's day, meals, rest, feelings, and comfort.
Offer emotional support, not medical or legal advice.
If the user mentions serious health symptoms, politely suggest speaking with a doctor.
Keep the conversation natural and gentle, and use the name Gautam occasionally.
`;

export async function POST() {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing Gemini API key for Live API token generation." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    token: GEMINI_API_KEY,
    model: GEMINI_LIVE_MODEL,
    voice: GEMINI_LIVE_VOICE,
    systemInstruction: SYSTEM_INSTRUCTION.trim(),
  });
}
