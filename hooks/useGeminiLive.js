import { useCallback, useEffect, useRef, useState } from "react";

const LIVE_ENDPOINT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function float32ToPcm16(input) {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(
      index * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true
    );
  }

  return toBase64(buffer);
}

function pcm16ToFloat32(base64) {
  const buffer = fromBase64(base64);
  const input = new Int16Array(buffer);
  const output = new Float32Array(input.length);

  for (let index = 0; index < input.length; index += 1) {
    output[index] = input[index] / 0x8000;
  }

  return output;
}

export function useGeminiLive() {
  const [assistantText, setAssistantText] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userText, setUserText] = useState("");
  const [volume, setVolume] = useState(0);

  const socketRef = useRef(null);
  const connectPromiseRef = useRef(null);
  const inputContextRef = useRef(null);
  const outputContextRef = useRef(null);
  const processorRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const playbackTimeRef = useRef(0);
  const speakingTimeoutRef = useRef(null);

  const clearSpeakingTimer = () => {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
  };

  const stopStreaming = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          clientContent: {
            turnComplete: true,
          },
        })
      );
    }

    processorRef.current?.disconnect?.();
    mediaSourceRef.current?.disconnect?.();
    mediaStreamRef.current?.getTracks?.().forEach((track) => track.stop());

    processorRef.current = null;
    mediaSourceRef.current = null;
    mediaStreamRef.current = null;

    if (inputContextRef.current) {
      await inputContextRef.current.close();
      inputContextRef.current = null;
    }

    setIsStreaming(false);
    setVolume(0);
  }, []);

  const disconnect = useCallback(async () => {
    clearSpeakingTimer();
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    connectPromiseRef.current = null;

    await stopStreaming();

    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    if (outputContextRef.current) {
      await outputContextRef.current.close();
      outputContextRef.current = null;
    }

    playbackTimeRef.current = 0;
  }, [stopStreaming]);

  const playAudio = useCallback(async (base64) => {
    if (!base64) {
      return;
    }

    if (!outputContextRef.current) {
      outputContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    if (outputContextRef.current.state === "suspended") {
      await outputContextRef.current.resume();
    }

    const float32 = pcm16ToFloat32(base64);
    const audioBuffer = outputContextRef.current.createBuffer(
      1,
      float32.length,
      24000
    );
    audioBuffer.copyToChannel(float32, 0);

    const source = outputContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputContextRef.current.destination);

    const now = outputContextRef.current.currentTime;
    const startsAt = Math.max(now, playbackTimeRef.current);
    source.start(startsAt);
    playbackTimeRef.current = startsAt + audioBuffer.duration;

    setIsSpeaking(true);
    clearSpeakingTimer();
    speakingTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, Math.max(300, audioBuffer.duration * 1000 + 120));
  }, []);

  const primeAudioOutput = useCallback(async () => {
    if (!outputContextRef.current) {
      outputContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    if (outputContextRef.current.state === "suspended") {
      await outputContextRef.current.resume();
    }
  }, []);

  const handleMessage = useCallback(
    async (responseText) => {
      try {
        const message = JSON.parse(responseText);

        if (message.serverContent?.interrupted) {
          playbackTimeRef.current = 0;
          setIsSpeaking(false);
        }

        if (message.serverContent?.inputTranscription?.text) {
          setUserText(message.serverContent.inputTranscription.text);
        }

        if (message.serverContent?.outputTranscription?.text) {
          setAssistantText(message.serverContent.outputTranscription.text);
        }

        const parts = message.serverContent?.modelTurn?.parts || [];
        for (const part of parts) {
          if (part.text) {
            setAssistantText(part.text);
          }

          if (part.inlineData?.data) {
            await playAudio(part.inlineData.data);
          }
        }
      } catch {
        setError("The live response could not be decoded.");
      }
    },
    [playAudio]
  );

  const connect = useCallback(async () => {
    if (isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (connectPromiseRef.current) {
      return connectPromiseRef.current;
    }

    setError("");
    setIsConnecting(true);

    connectPromiseRef.current = (async () => {
      await primeAudioOutput();

      const response = await fetch("/api/live-token", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create a Live API session.");
      }

      const socket = new WebSocket(
        `${LIVE_ENDPOINT}?key=${encodeURIComponent(data.token)}`
      );
      socketRef.current = socket;

      await new Promise((resolve, reject) => {
        socket.onopen = () => {
          socket.send(
            JSON.stringify({
              setup: {
                model: `models/${data.model}`,
                generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: data.voice || "Zephyr",
                      },
                    },
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                realtimeInputConfig: {
                  automaticActivityDetection: {},
                },
                systemInstruction: {
                  parts: [{ text: data.systemInstruction }]
                },
              },
            })
          );
        };

        socket.onmessage = async (event) => {
          let responseText = event.data;
          if (event.data instanceof Blob) {
            responseText = await event.data.text();
          }
          const payload = JSON.parse(responseText);

          if (payload.setupComplete) {
            setIsConnected(true);
            setIsConnecting(false);
            resolve();
            return;
          }

          await handleMessage(responseText);
        };

        socket.onerror = () => {
          reject(new Error("The live Gemini session could not connect."));
        };

        socket.onclose = async () => {
          await disconnect();
        };
      });
    })();

    try {
      await connectPromiseRef.current;
    } catch (err) {
      setIsConnecting(false);
      setError(err.message || "Unable to start live mode.");
      await disconnect();
      throw err;
    } finally {
      connectPromiseRef.current = null;
    }
  }, [disconnect, handleMessage, isConnected, primeAudioOutput]);

  const startStreaming = useCallback(async () => {
    if (isStreaming) {
      return;
    }

    setError("");

    try {
      await connect();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      inputContextRef.current = new AudioContext({ sampleRate: 16000 });

      if (inputContextRef.current.state === "suspended") {
        await inputContextRef.current.resume();
      }

      const source = inputContextRef.current.createMediaStreamSource(stream);
      const processor = inputContextRef.current.createScriptProcessor(2048, 1, 1);

      mediaSourceRef.current = source;
      processorRef.current = processor;

      processor.onaudioprocess = (audioEvent) => {
        const inputData = audioEvent.inputBuffer.getChannelData(0);
        const socket = socketRef.current;

        let sum = 0;
        for (let index = 0; index < inputData.length; index += 1) {
          sum += inputData[index] * inputData[index];
        }
        setVolume(Math.min(1, Math.sqrt(sum / inputData.length) * 3));

        if (!socket || socket.readyState !== WebSocket.OPEN) {
          return;
        }

        socket.send(
          JSON.stringify({
            realtimeInput: {
              audio: {
                mimeType: "audio/pcm;rate=16000",
                data: float32ToPcm16(inputData),
              },
            },
          })
        );
      };

      source.connect(processor);
      processor.connect(inputContextRef.current.destination);
      setIsStreaming(true);
    } catch (err) {
      setError(err.message || "Microphone access is unavailable.");
      await stopStreaming();
    }
  }, [connect, isStreaming, stopStreaming]);

  const sendText = useCallback((text) => {
    if (!text.trim() || socketRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    setAssistantText("");
    socketRef.current.send(
      JSON.stringify({
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          turnComplete: true,
        },
      })
    );
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    assistantText,
    connect,
    disconnect,
    error,
    isConnected,
    isConnecting,
    isSpeaking,
    isStreaming,
    sendText,
    startStreaming,
    userText,
    volume,
  };
}
