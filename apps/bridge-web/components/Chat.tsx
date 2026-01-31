"use client";

import { useState } from "react";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "mediator";
  content: string;
  tone?: "neutral" | "soften" | "clarify";
};

const seedMessages: ChatMessage[] = [
  {
    id: "seed-1",
    role: "mediator",
    content:
      "Welcome to the bridge. Share what's on your mind and I'll help soften, clarify, or translate it.",
    tone: "neutral"
  }
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/mediate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = (await response.json()) as {
        mediated: string;
        tone: "neutral" | "soften" | "clarify";
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `mediator-${Date.now()}`,
          role: "mediator",
          content: data.mediated,
          tone: data.tone
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `mediator-${Date.now()}`,
          role: "mediator",
          content:
            "I had trouble reaching the mediation service. Try again in a moment.",
          tone: "neutral"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-mist via-white to-sky px-4 py-10">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss">
            Manipura Cockpit
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            Unified Stream
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-moss shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          Mediation Active
        </div>
      </header>

      <main className="mx-auto mt-10 flex w-full max-w-4xl flex-1 flex-col gap-6">
        <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-ember/10 p-3 text-ember">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Live Mediation
              </h2>
              <p className="text-sm text-ink/70">
                Drafts are softened and clarified in real time. Share the
                message you want to send, and review the mediated version before
                delivery.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-4 rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-xl">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.role === "user"
                    ? "ml-auto bg-ink text-mist"
                    : "bg-mist text-ink"
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                {message.role === "mediator" && message.tone && (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink/50">
                    {message.tone} tone
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <textarea
              className="min-h-[96px] w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              placeholder="Share the message you want mediated..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink/50">
                Tip: add context like "I feel" or "I need".
              </p>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? "Mediating" : "Send"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
