"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Mic,
  Volume2,
  Loader2,
  Sparkles,
  User,
  Trash2,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function SmartDelhiAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Namaste! 👋 Main SmartDELHI AI Assistant hoon. Aap apni complaint, status, ward ya civic problem ke baare mein Hindi, English ya Hinglish mein pooch sakte hain.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [open]);

  // Web Speech API - Voice Input Integration
  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapke browser me Speech Recognition support nahi hai. Please Chrome use karein.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN"; // Supports Hindi & English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Speech recognition error:", error);
      setListening(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "AI Assistant is temporarily unavailable."
        );
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          data?.reply ||
          data?.message ||
          "Sorry, mujhe iska answer nahi mila.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = (text: string) => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "hi-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          "Chat clear kar diya gaya hai. 👋 Aap apni civic complaint ke baare mein pooch sakte hain.",
      },
    ]);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open SmartDELHI AI Assistant"
        className="fixed bottom-6 right-6 z-[9999] group"
      >
        <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl group-hover:bg-cyan-400/50 transition" />

        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 border border-cyan-300/40 shadow-2xl shadow-cyan-500/30 flex items-center justify-center hover:scale-105 transition-transform">
          <Bot className="w-7 h-7 text-white" />
        </div>

        <span className="absolute -top-2 -right-1 flex items-center gap-1 px-2 py-1 rounded-full bg-gray-950 border border-cyan-500/30 text-[9px] font-bold text-cyan-300 whitespace-nowrap">
          <Sparkles className="w-3 h-3" />
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[calc(100vw-40px)] sm:w-[410px]">
      <div className="overflow-hidden rounded-3xl border border-cyan-500/25 bg-gray-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60">
        {/* HEADER */}
        <div className="relative overflow-hidden border-b border-white/10 px-4 py-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-transparent" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>

                <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-gray-950" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    SmartDELHI AI
                  </h2>

                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-bold text-cyan-300">
                    BETA
                  </span>
                </div>

                <p className="text-[10px] text-gray-500 mt-0.5">
                  Citizen Assistance • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                title="Clear chat"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="h-[430px] overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-2.5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-[78%] ${
                    isUser
                      ? "items-end"
                      : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={
                      isUser
                        ? "rounded-2xl rounded-tr-md bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2.5 text-sm text-white"
                        : "rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-gray-300"
                    }
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </p>
                  </div>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() =>
                        speakMessage(message.text)
                      }
                      className="mt-1.5 inline-flex items-center gap-1 text-[9px] text-gray-600 hover:text-cyan-400 transition"
                    >
                      <Volume2 className="w-3 h-3" />

                      {speaking
                        ? "Speaking..."
                        : "Read aloud"}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "100ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK QUESTIONS */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              "Meri complaint ka status?",
              "Complaint resolve kyu nahi hui?",
              "Garbage complaint kaise kare?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                disabled={loading}
                onClick={() => {
                  setInput(question);

                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 50);
                }}
                className="flex-shrink-0 rounded-full border border-cyan-500/15 bg-cyan-500/5 px-3 py-1.5 text-[10px] text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:border-cyan-500/40 transition px-2">
            <button
              type="button"
              onClick={startListening}
              title="Voice input"
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition ${
                listening
                  ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/40"
                  : "text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={listening ? "Listening..." : "Ask SmartDELHI AI..."}
              className="flex-1 min-w-0 bg-transparent py-3 text-sm text-white placeholder-gray-600 outline-none"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white hover:brightness-110 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-center text-[8px] text-gray-600 mt-2">
            SmartDELHI AI can assist with civic complaints and municipal services.
          </p>
        </div>
      </div>
    </div>
  );
}