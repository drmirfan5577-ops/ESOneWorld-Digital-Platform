import { useState, useRef, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";
import { motion, AnimatePresence } from "motion/react";

type Message = { role: "user" | "assistant"; content: string };

type AIPartner = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  desc: string;
};

const AI_PARTNERS: AIPartner[] = [
  { id: "chatgpt", name: "ChatGPT", emoji: "🤖", color: "#10a37f", desc: "OpenAI GPT-4o" },
  { id: "claude", name: "Claude", emoji: "🟠", color: "#d97706", desc: "Anthropic" },
  { id: "gemini", name: "Gemini", emoji: "💎", color: "#4285f4", desc: "Google AI" },
  { id: "qwen", name: "Qwen", emoji: "🐉", color: "#7c3aed", desc: "Alibaba" },
  { id: "genspark", name: "Genspark", emoji: "✨", color: "#ec4899", desc: "Creative AI" },
];

const WELCOME: Record<string, string> = {
  chatgpt: "Hi! I'm **ChatGPT** — Ask me to debug code, set up templates, or explain tech concepts.",
  claude: "Hello! I'm **Claude** — thoughtful AI help for your development needs. How can I assist?",
  gemini: "Hey! I'm **Gemini** — ready to help with code, setups, and tech questions. Ask away!",
  qwen: "سلام! میں **Qwen** ہوں — اردو یا انگریزی میں پوچھیں، مدد کروں گا!",
  genspark: "Hi! I'm **Genspark** — creative AI for building apps and solving dev challenges. Let's go!",
};

function renderContent(content: string) {
  return content.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
          if (part.startsWith("`") && part.endsWith("`")) return <code key={j} className="bg-black/10 px-1 py-0.5 rounded text-[11px] font-mono break-all">{part.slice(1, -1)}</code>;
          return part;
        })}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [activePartnerId, setActivePartnerId] = useState("chatgpt");
  // Each partner has its own chat history (separate state map)
  const [chats, setChats] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(AI_PARTNERS.map((p) => [p.id, [{ role: "assistant" as const, content: WELCOME[p.id] }]]))
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAction = useAction(api.ai.chat);

  const activePartner = AI_PARTNERS.find((p) => p.id === activePartnerId) ?? AI_PARTNERS[0];
  const currentMessages = chats[activePartnerId] ?? [];

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    const historyForApi = currentMessages.slice(-8);

    // Add user message immediately
    setChats((prev) => ({
      ...prev,
      [activePartnerId]: [...(prev[activePartnerId] ?? []), userMsg],
    }));
    setLoading(true);

    try {
      const reply = await chatAction({
        message: text,
        history: historyForApi.map((m) => ({ role: m.role, content: m.content })),
      });
      const assistantMsg: Message = { role: "assistant", content: reply };
      setChats((prev) => ({
        ...prev,
        [activePartnerId]: [...(prev[activePartnerId] ?? []), userMsg, assistantMsg].filter(
          // De-dup: avoid double userMsg if state was already updated
          (m, i, arr) => i === 0 || !(m.role === arr[i - 1]?.role && m.content === arr[i - 1]?.content)
        ),
      }));
    } catch {
      setChats((prev) => ({
        ...prev,
        [activePartnerId]: [
          ...(prev[activePartnerId] ?? []),
          { role: "assistant" as const, content: "Connection error. Add `OPENAI_API_KEY` in Secrets tab to enable AI." },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }, [input, loading, currentMessages, activePartnerId, chatAction]);

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            className="w-[340px] sm:w-[380px] h-[520px] bg-white border-2 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ borderColor: `${activePartner.color}30` }}
          >
            {/* Header */}
            <div className="shrink-0 border-b" style={{ background: `${activePartner.color}0d` }}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activePartner.emoji}</span>
                  <div>
                    <p className="font-bold text-xs" style={{ color: activePartner.color }}>{activePartner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{activePartner.desc} · AI Appify Partner</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Partner switcher tabs */}
              <div className="flex px-2 pb-2 gap-1 overflow-x-auto scrollbar-none">
                {AI_PARTNERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActivePartnerId(p.id); setInput(""); }}
                    title={p.name}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0",
                      activePartnerId === p.id ? "text-white border-transparent shadow-sm" : "bg-white text-muted-foreground border-border hover:border-gray-300"
                    )}
                    style={activePartnerId === p.id ? { background: p.color, borderColor: p.color } : {}}
                  >
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
              {currentMessages.map((msg, i) => (
                <div key={i} className={cn("flex items-end gap-1.5", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <span className="text-lg shrink-0 mb-0.5">{activePartner.emoji}</span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed",
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-gray-100 text-foreground rounded-bl-sm"
                    )}
                    style={msg.role === "user" ? { background: activePartner.color } : {}}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-1.5">
                  <span className="text-lg shrink-0">{activePartner.emoji}</span>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 p-3 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                  placeholder={`Ask ${activePartner.name}...`}
                  className="text-xs h-8"
                  disabled={loading}
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || loading}
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40 cursor-pointer"
                  style={{ background: activePartner.color }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 text-center">
                5 AI Partners · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => { setOpen((p) => !p); setPulse(false); }}
        className="relative w-[52px] h-[52px] rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center justify-center"
        style={{ background: activePartner.color }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {pulse && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
