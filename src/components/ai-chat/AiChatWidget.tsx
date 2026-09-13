import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import { IAiChatTurn, useSendAiChatMessageMutation } from "@/redux/features/ai/ai.api";
// import { useSendAiChatMessageMutation } from "@/store/api/ai/aiApi"; // 👈 adjust import path to your project structure
// import type { IAiChatTurn } from "@/store/api/ai/aiApi";

interface IChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  toolCalls?: { collection: string; operation: string }[];
}

const STORAGE_KEY = "ai-chat-history";

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  const [sendAiChatMessage, { isLoading }] = useSendAiChatMessageMutation();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: IChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // history payload for the API (role + text only)
    const history: IAiChatTurn[] = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const res = await sendAiChatMessage({
        message: trimmed,
        history,
      }).unwrap();

      const aiMsg: IChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        text: res.data?.message ?? "Sorry, I couldn't process that.",
        toolCalls: res.data?.toolCalls,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: IChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        text: "Something went wrong while talking to the AI. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform duration-200 hover:scale-105 hover:bg-indigo-700 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-135 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-indigo-600 px-4 py-3 text-white">
            <Bot size={20} />
            <div>
              <p className="text-sm font-semibold leading-tight">AI Assistant</p>
              <p className="text-xs text-indigo-100">Ask about your data</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
            {messages.length === 0 && (
              <div className="mt-10 text-center text-sm text-gray-400">
                Say hello 👋 — try "Give me today's total order count"
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "model" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Bot size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-indigo-600 text-white"
                      : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.toolCalls.map((tc, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-500"
                        >
                          {tc.collection}.{tc.operation}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                AI is thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-gray-100 bg-white p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="max-h-24 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}