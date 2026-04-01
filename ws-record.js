require("dotenv").config({ path: ".env" });
const WebSocket = require("ws");

const modelName = "gemini-3.1-flash-live-preview";
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;
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
  let msgString = data;
  if(data instanceof Buffer) {
      msgString = data.toString('utf-8');
  }
  const msg = JSON.parse(msgString);
  console.log("Message received keys:", Object.keys(msg));
  if (msg.error) {
      console.log("SERVER ERROR MESSAGE:", JSON.stringify(msg.error));
  }
  if (msg.setupComplete) {
      console.log("SUCCESSFULLY CONNECTED! Now sending an audio chunk...");
      socket.send(
        JSON.stringify({
          clientContent: {
            turnComplete: true,
          },
        })
      );
  }
});

socket.on("error", (err) => console.log("WS Error:", err));
socket.on("close", (code, reason) => {
  console.log("WS Closed:", code, reason.toString());
});
