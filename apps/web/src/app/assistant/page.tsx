"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Send, Sparkles, Bot, Loader2, Lightbulb, Terminal, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { NeonBadge } from "@/components/ui/neon-badge";
import { cn } from "@/lib/utils/cn";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL ?? "http://localhost:8000";

const suggestions = [
  "Suggest events to boost my AI + Web3 profile",
  "What marketplace items are trending?",
  "Find me a hackathon team",
  "How can I improve my campus ranking?",
  "What skills should I learn for ML internships?",
];

// Format timestamp as HH:MM:SS
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

// Typewriter effect component — types out text character by character like a mechanical keyboard
const TypewriterText = ({ text, speed = 18, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep ref to avoid effect re-runs when onComplete is inline
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    const tick = () => {
      indexRef.current++;
      const next = text.slice(0, indexRef.current);
      setDisplayed(next);

      if (indexRef.current >= text.length) {
        setDone(true);
        onCompleteRef.current?.();
        return;
      }

      // Variable speed: spaces are faster, add slight randomness for realism
      const char = text[indexRef.current];
      const jitter = Math.random() * 12;
      const delay = char === " " ? speed * 0.4 : speed + jitter;
      timer = window.setTimeout(tick, delay);
    };

    let timer = window.setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[7px] h-[14px] bg-mint/80 ml-[1px] align-middle animate-blink" />}
    </span>
  );
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey there! 👋 I'm your AI Campus Copilot. I can help you find events, discover opportunities, navigate the marketplace, and build your campus profile. What would you like to explore?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMsgId, setTypingMsgId] = useState<string | null>("welcome");
  const typedIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMsgId]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${AI_BASE_URL}/api/v1/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content.trim() })
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm having trouble processing that right now. Let me try again later!",
        timestamp: new Date()
      };
      setTypingMsgId(assistantMsg.id);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠ ERROR: Connection to AI service refused. Ensure the AI daemon is running on port 8000.",
        timestamp: new Date()
      };
      setTypingMsgId(errorMsg.id);
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-3rem)]">
        
        {/* Terminal Header Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple shadow-neon">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold flex items-center gap-2">
                Campus Copilot <span className="text-[10px] font-mono font-extrabold text-slate/40 uppercase">v2.0</span>
              </h1>
              <p className="text-xs text-slate font-mono">AI-powered campus assistant daemon</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NeonBadge color="mint" pulse>
              <Terminal className="h-3 w-3" /> PID:8000
            </NeonBadge>
            <NeonBadge color="purple" pulse>
              <Sparkles className="h-3 w-3" /> AI Active
            </NeonBadge>
          </div>
        </div>

        {/* Terminal Console Container */}
        <div className="flex-1 min-h-0 rounded-3xl border border-white/[0.08] bg-[#070b15]/90 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col will-change-transform">
          
          {/* macOS Terminal Title Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06] select-none shrink-0">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose border border-rose/30 shadow-inner" />
              <span className="w-2.5 h-2.5 rounded-full bg-blaze border border-blaze/30 shadow-inner" />
              <span className="w-2.5 h-2.5 rounded-full bg-mint border border-mint/30 shadow-inner" />
            </div>
            <span className="text-[9px] font-mono font-extrabold text-slate/40 uppercase tracking-[0.2em]">[ai] - copilot.sh</span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-mint/50 font-bold animate-pulse">● CONNECTED</span>
            </div>
          </div>

          {/* System Boot Logs Banner */}
          <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.01] shrink-0">
            <div className="font-mono text-[10px] text-slate/50 leading-relaxed space-y-0.5">
              <p><span className="text-mint/60">[system]</span> Campus Copilot AI daemon initialized.</p>
              <p><span className="text-mint/60">[system]</span> Model: gemini-pro | Context: campus-bandhu-v2 | Status: <span className="text-mint font-bold">READY</span></p>
              <p><span className="text-slate/30">═══════════════════════════════════════════════════════════════</span></p>
            </div>
          </div>

          {/* Chat Messages Area - Terminal Style */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  {msg.role === "user" ? (
                    /* User Command Input */
                    <div className="flex items-start gap-2.5 font-mono">
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <span className="text-[10px] text-slate/30 font-bold">{formatTime(msg.timestamp)}</span>
                        <span className="text-[11px] text-accent font-extrabold">guest@copilot:~$</span>
                      </div>
                      <p className="text-[12px] text-white font-semibold leading-relaxed break-words min-w-0">{msg.content}</p>
                    </div>
                  ) : (
                    /* AI Response Output */
                    <div className="ml-0 mt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent/20 to-purple/20 border border-accent/20">
                          <Bot className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-[9px] font-mono font-extrabold text-accent/60 uppercase tracking-wider">copilot.response</span>
                        <span className="text-[9px] font-mono text-slate/25 font-bold">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="ml-7 rounded-2xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 text-[12px] text-white/85 leading-relaxed font-mono hover:border-accent/20 transition-colors duration-200">
                        {typingMsgId === msg.id && !typedIdsRef.current.has(msg.id) ? (
                          <TypewriterText
                            text={msg.content}
                            speed={18}
                            onComplete={() => {
                              typedIdsRef.current.add(msg.id);
                              setTypingMsgId(null);
                            }}
                          />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing / Loading Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-0 mt-1"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent/20 to-purple/20 border border-accent/20">
                    <Bot className="h-3 w-3 text-accent animate-pulse" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-accent/60 uppercase tracking-wider">copilot.processing</span>
                </div>
                <div className="ml-7 rounded-2xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 flex items-center gap-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate/60">
                    <span className="animate-pulse">Processing query</span>
                    <span className="animate-bounce inline-block" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce inline-block" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce inline-block" style={{ animationDelay: "300ms" }}>.</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions - CLI macro buttons */}
          {messages.length <= 1 && (
            <div className="border-t border-white/[0.04] px-5 py-3 shrink-0">
              <p className="mb-2 text-[9px] text-slate/40 flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider">
                <Lightbulb className="h-3 w-3 text-blaze" /> // Quick command macros
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-lg bg-white/[0.03] border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate/70 transition-all hover:bg-accent/10 hover:text-accent hover:border-accent/30 cursor-pointer select-none"
                  >
                    <ChevronRight className="h-2.5 w-2.5 inline mr-0.5 opacity-50" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Input Line */}
          <div className="border-t border-white/[0.06] px-5 py-4 shrink-0 bg-white/[0.01]">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-3"
            >
              {/* Prompt prefix */}
              <div className="flex items-center gap-1.5 shrink-0 font-mono">
                <span className="text-[11px] text-accent font-extrabold">guest@copilot:~$</span>
              </div>

              {/* Input field */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your command..."
                className="flex-1 bg-transparent text-[12px] font-mono text-mint outline-none border-none p-0 focus:ring-0 placeholder:text-slate/25 font-semibold"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer shrink-0",
                  input.trim() && !loading
                    ? "bg-gradient-to-r from-accent to-electric text-white shadow-glow-sm hover:shadow-neon"
                    : "bg-white/[0.03] text-slate/30 border border-white/[0.06]"
                )}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
