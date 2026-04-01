require("dotenv").config({ path: ".env.local" });
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function test() {
  try {
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: "gemini-2.0-flash",
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Zephyr",
                },
              },
            },
            systemInstruction: {
              parts: [{ text: "You are a test." }]
            },
            sessionResumption: {},
          },
        },
        httpOptions: {
          apiVersion: "v1alpha",
        },
      },
    });

    console.log("SUCCESS:", token.name);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
