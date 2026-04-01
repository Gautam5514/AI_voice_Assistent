require("dotenv").config({ path: ".env" });
const { GoogleGenAI } = require("@google/genai");
const WebSocket = require("ws");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = "gemini-3.1-flash-live-preview";

async function testWS() {
  try {
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

    console.log("Creating token for model:", modelName);
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: modelName,
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
          },
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    console.log("Token:", token.name);

    const cleanToken = token.name.replace('auth_tokens/', '');
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?access_token=${cleanToken}`;
    const socket = new WebSocket(wsUrl);

    socket.on("open", () => {
      console.log("WS open, sending setup...");
      socket.send(
        JSON.stringify({
          setup: {
            model: `models/${modelName}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Zephyr" },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: "You are a test." }]
            },
          },
        })
      );
    });

    socket.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      console.log("Message received:", Object.keys(msg), msg.setupComplete ? "(Setup Complete)" : "");
      if (msg.setupComplete) {
          console.log("SUCCESSFULLY CONNECTED!");
          process.exit(0);
      }
    });

    socket.on("error", (err) => console.log("WS Error:", err));
    socket.on("close", (code, reason) => {
      console.log("WS Closed:", code, reason.toString());
    });

  } catch (error) {
    console.error("Token creation error:", error);
  }
}

testWS();
