"use client";

import { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Send, Sparkles, Bot, Loader2, Lightbulb } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Avatar } from "@/components/ui/avatar";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
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
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Hmm, I'm having trouble connecting to the AI service. Make sure the AI service is running on port 8000!",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-6rem)] flex-col lg:h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple shadow-neon">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">Campus Copilot</h1>
              <p className="text-xs text-slate">AI-powered campus assistant</p>
            </div>
          </div>
          <NeonBadge color="purple" pulse>
            <Sparkles className="h-3 w-3" /> AI Active
          </NeonBadge>
        </div>

        {/* Chat Area */}
        <GlassCard className="flex min-h-0 flex-1 flex-col !p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-purple/20">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                  ) : (
                    <Avatar name="You" size="sm" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent/15 text-white"
                        : "bg-white/[0.04] text-white/90"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-purple/20">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm text-slate">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="border-t border-white/[0.04] px-5 py-3">
              <p className="mb-2 text-xs text-slate flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-slate transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about campus life..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-accent to-electric text-white shadow-glow-sm transition-all hover:shadow-neon disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
