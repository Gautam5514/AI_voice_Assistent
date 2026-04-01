"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Languages,
  Mic,
  PhoneOff,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useGeminiLive } from "@/hooks/useGeminiLive";

const QUICK_STARTERS = [
  "Kya haal hai Gautam?",
  "Can we speak in English today?",
  "我们可以用中文聊天吗？",
];

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export default function LivePage() {
  const [textInput, setTextInput] = useState("");

  const {
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
  } = useGeminiLive();

  const status = useMemo(() => {
    if (isStreaming) {
      return "live";
    }

    if (isConnecting || isConnected) {
      return "connecting";
    }

    return "idle";
  }, [isConnected, isConnecting, isStreaming]);

  async function handleStart() {
    await connect();
    await startStreaming();
  }

  async function handleStop() {
    await disconnect();
  }

  function handleSendText() {
    if (!textInput.trim()) {
      return;
    }

    sendText(textInput.trim());
    setTextInput("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_36%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_24%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_0_32px_rgba(99,102,241,0.45)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AMI <span className="text-indigo-400">LIVE</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
              Gemini voice companion
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
            <Languages size={14} className="text-indigo-400" />
            English + Hindi + 中文
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
            {status === "live" ? "Stream is live" : "Ready for live mode"}
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-[1440px] grid-cols-1 gap-8 px-6 pb-10 md:px-10 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-300">
              Live model
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Real-time audio conversation with Gemini Live
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              This mode streams microphone audio, receives Gemini native audio
              back, and plays it as the session responds.
            </p>
          </section>

          <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Connection
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {isConnected ? "Connected" : isConnecting ? "Opening session" : "Offline"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Mic activity
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatPercent(volume)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Voice
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {isSpeaking ? "Gemini is speaking" : "Waiting"}
              </p>
            </div>
          </section>

          {/* <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Trust points
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-1 text-emerald-400" />
                <p className="text-sm leading-6 text-slate-300">
                  Short-lived token flow keeps your paid API key off the browser.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Heart size={16} className="mt-1 text-pink-400" />
                <p className="text-sm leading-6 text-slate-300">
                  System instructions stay focused on elderly-friendly emotional support.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Volume2 size={16} className="mt-1 text-cyan-400" />
                <p className="text-sm leading-6 text-slate-300">
                  Audio responses use the Zephyr voice with native streaming playback.
                </p>
              </div>
            </div>
          </section> */}
        </aside>

        <section className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-xl">
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: status === "live" ? [1, 1.12, 1] : status === "connecting" ? [1, 1.04, 1] : 1,
                opacity: status === "live" ? [0.25, 0.52, 0.25] : 0.16,
              }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="absolute h-[380px] w-[380px] rounded-full bg-indigo-500/30 blur-[110px]"
            />

            <motion.div
              animate={
                status === "live"
                  ? {
                      borderRadius: [
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                        "60% 40% 30% 70% / 50% 60% 40% 60%",
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                      ],
                      boxShadow: [
                        "0 0 70px rgba(99,102,241,0.34)",
                        "0 0 110px rgba(99,102,241,0.48)",
                        "0 0 70px rgba(99,102,241,0.34)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              className={`relative z-10 flex h-64 w-64 items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-sky-400 ${
                status === "idle" ? "opacity-65 grayscale-[0.35]" : ""
              }`}
            >
              {status === "live" ? (
                <div className="flex h-10 items-end gap-1">
                  {[0.4, 0.75, 1, 0.82, 0.55].map((multiplier, index) => (
                    <motion.div
                      key={multiplier}
                      animate={{
                        height: [
                          10 + volume * 30 * multiplier,
                          34 + volume * 70 * multiplier,
                          10 + volume * 30 * multiplier,
                        ],
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: index * 0.09,
                      }}
                      className="w-2 rounded-full bg-white"
                    />
                  ))}
                </div>
              ) : (
                <Mic size={54} className="text-white/90" />
              )}
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-3xl font-light tracking-tight text-slate-100">
              {status === "live"
                ? "Listening and replying live"
                : status === "connecting"
                  ? "Connecting to Gemini Live..."
                  : "Ready to talk with Gautam?"}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Natural live conversation for English, Hindi, and Chinese.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {status === "live" ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-3 rounded-full border border-red-500/40 bg-red-500/10 px-8 py-4 text-base font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
              >
                <PhoneOff size={18} />
                End live session
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={isConnecting}
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:translate-y-[-1px] disabled:opacity-60"
              >
                {isConnecting ? "Starting..." : "Start live conversation"}
              </button>
            )}
          </div>

          {error ? (
            <p className="mt-5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Quick prompts
            </p>
            <div className="mt-4 space-y-3">
              {QUICK_STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendText(starter)}
                  disabled={!isConnected}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 disabled:opacity-40"
                >
                  {starter}
                </button>
              ))}
            </div>
          </section>

          {/* <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Text turn
            </p>
            <div className="mt-4 space-y-3">
              <textarea
                rows={4}
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="Type a message while live mode is open..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60"
              />
              <button
                onClick={handleSendText}
                disabled={!isConnected || !textInput.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
              >
                <Send size={16} />
                Send text turn
              </button>
            </div>
          </section> */}

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Session transcript
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Heard from user
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {userText || "No user transcription yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Gemini response
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {assistantText || "No model transcript yet."}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
