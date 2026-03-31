"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Activity, 
  ShieldCheck,
  Languages,
  ArrowRight
} from "lucide-react";

import ChatBubble from "@/components/ChatBubble";
import VoiceButton from "@/components/VoiceButton";
import { getAIResponse } from "@/lib/gemini";
import {
  detectLanguage,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  startListening,
  stopListening,
  stopSpeaking,
} from "@/lib/speech";

// --- Data Constants ---
const WELCOME_MESSAGE = "Hello Gautam. How are you feeling today? Did you have a peaceful morning?";

const QUICK_PROMPTS = [
  { text: "I feel a little lonely today", icon: "comfort" },
  { text: "I had a nice breakfast", icon: "meal" },
  { text: "我们可以用中文聊天吗？", icon: "lang" },
  { text: "I went for a short walk", icon: "activity" },
];

export default function Home() {
  const [messages, setMessages] = useState([{ role: "assistant", text: WELCOME_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setRecognitionSupported(isSpeechRecognitionSupported());
    setSpeechSupported(isSpeechSynthesisSupported());
    return () => {
      stopListening(recognitionRef.current);
      stopSpeaking();
    };
  }, []);

  async function handleSend(rawText) {
    const text = rawText.trim();
    if (!text || isLoading) return;

    setError("");
    setInput("");
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        text: m.text,
      }));

      const reply = await getAIResponse(text, history);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      if (autoSpeak && speechSupported) {
        speakText(reply, { lang: detectLanguage(reply) });
      }
    } catch {
      setError("I'm having a little trouble connecting. Let's try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleVoiceToggle() {
    if (!recognitionSupported) return setError("Voice not supported in this browser.");
    if (isListening) {
      stopListening(recognitionRef.current);
      setIsListening(false);
      return;
    }

    recognitionRef.current = startListening({
      lang: detectLanguage(input),
      onStart: () => setIsListening(true),
      onResult: (transcript) => setInput(transcript),
      onError: () => setError("I couldn't hear that. Try again?"),
      onEnd: () => setIsListening(false),
    });
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* --- Premium Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Saathi <span className="text-indigo-600">Companion</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Elite Care AI</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-600">
            <Languages className="w-3.5 h-3.5" />
            EN + ZH Support
          </div>
          <button 
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-full transition-all ${autoSpeak ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
          >
            {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        
        {/* --- Left Column: Insights & Stats --- */}
        <aside className="lg:col-span-4 space-y-6">
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h2 className="text-3xl font-bold leading-tight mb-4">A calmer way to <span className="text-indigo-600">check-in.</span></h2>
            <p className="text-slate-500 leading-relaxed mb-8">Designed with Google-inspired simplicity for high-trust elder care moments.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Response", val: "Instant", icon: <Activity className="w-4 h-4 text-orange-500" /> },
                { label: "Privacy", val: "Encrypted", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> }
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="mb-2">{stat.icon}</div>
                  <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">{stat.label}</p>
                  <p className="text-sm font-bold text-slate-700">{stat.val}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 px-2 flex items-center gap-2 uppercase tracking-widest">
              <Heart className="w-3 h-3" /> Core Care Pillars
            </h3>
            {[
              { title: "Emotional Comfort", text: "Warm check-ins for lonely moments.", color: "bg-pink-500" },
              { title: "Routine Support", text: "Gentle prompts for meals & walks.", color: "bg-blue-500" },
            ].map((pillar, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-default flex items-start gap-4"
              >
                <div className={`w-1 h-10 rounded-full ${pillar.color}`} />
                <div>
                  <h4 className="font-bold text-slate-800">{pillar.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{pillar.text}</p>
                </div>
              </motion.div>
            ))}
          </section>
        </aside>

        {/* --- Right Column: The Chat Experience --- */}
        <section className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col flex-1 overflow-hidden relative">
            
            {/* Chat Header */}
            <header className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">S</div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Saathi Assistant</h3>
                  <p className="text-xs text-slate-400 font-medium">Always here to listen</p>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  Thinking...
                </div>
              )}
            </header>

            {/* Message Thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#FDFDFF]">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      <p className="text-[15px]">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Quick Starters */}
            <div className="px-8 py-4 bg-slate-50/50 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.text)}
                  className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-2"
                >
                  {p.text}
                  <ArrowRight size={12} />
                </button>
              ))}
            </div>

            {/* Input Composer */}
            <footer className="p-6 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative flex items-end gap-3 bg-slate-100 p-2 rounded-[2rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all border border-transparent focus-within:border-indigo-100"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell Saathi how you feel..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-4 text-slate-700 resize-none min-h-[52px] max-h-32"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                />
                
                <div className="flex items-center gap-2 pb-1 pr-1">
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-indigo-600 shadow-sm'
                    }`}
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex justify-center">
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  Press Enter to send • Saathi is a companion, not a medical professional
                </p>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
