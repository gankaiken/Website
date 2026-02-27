"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Result = {
  risk: "Low" | "Medium" | "High";
  score: number;
  insight: string;
};

type CopilotReply = {
  sections: {
    detected: string;
    meaning: string;
    todo: string[];
    whenToAct: string;
  };
  echo?: string;
};

export default function ResultsPage() {
  const [result, setResult] = useState<Result | null>(null);

  // Copilot state
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "copilot"; text: string }[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("derma_ai_result");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  const actions = useMemo(() => {
    if (!result) return [];
    if (result.risk === "Low") {
      return [
        "Monitor for changes over the next 48–72 hours.",
        "Avoid scratching and keep the area clean and dry.",
        "If it persists beyond 1–2 weeks, consider a clinic visit.",
      ];
    }
    if (result.risk === "Medium") {
      return [
        "Consider consulting a pharmacist or GP within the next few days.",
        "Avoid new skincare products; use gentle cleanser and moisturiser.",
        "If spreading or worsening, seek medical assessment sooner.",
      ];
    }
    return [
      "Seek medical assessment soon (same day / within 24 hours if possible).",
      "If severe pain, fever, fast spread, or facial swelling: seek urgent care.",
      "Avoid applying unknown creams; keep the area protected and clean.",
    ];
  }, [result]);

  const sendToCopilot = async () => {
    if (!result) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    setCopilotError(null);
    setCopilotLoading(true);

    // add user message to chat
    setChat((prev) => [...prev, { role: "user", text: trimmed }]);
    setMessage("");

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, risk: result.risk }),
      });

      if (!res.ok) throw new Error("Copilot request failed");
      const data: CopilotReply = await res.json();

      const formatted =
        `**What we detected**\n${data.sections.detected}\n\n` +
        `**What it could mean (not diagnosis)**\n${data.sections.meaning}\n\n` +
        `**What to do next**\n- ${data.sections.todo.join("\n- ")}\n\n` +
        `**When to act**\n${data.sections.whenToAct}`;

      setChat((prev) => [...prev, { role: "copilot", text: formatted }]);
    } catch (e: any) {
      setCopilotError("Copilot failed. Please try again.");
    } finally {
      setCopilotLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border p-6 shadow-sm">
          <h1 className="text-2xl font-bold">No result found</h1>
          <p className="text-sm text-gray-600 mt-2">
            Go back to scan and triage to generate a result.
          </p>
          <Link
            href="/scan"
            className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white"
          >
            Back to Scan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Your Screening Result</h1>

        <div className="mt-6 rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Risk Level</div>
          <div className="mt-1 text-2xl font-bold">{result.risk}</div>

          <div className="mt-4 text-sm text-gray-500">Primary Insight</div>
          <div className="mt-1">{result.insight}</div>
        </div>

        <div className="mt-6">
          <div className="font-semibold">Recommended next steps</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
            {actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <button
          className="mt-6 w-full rounded-xl bg-black py-3 text-white"
          onClick={() =>
            window.open("https://www.google.com/maps/search/dermatologist+near+me", "_blank")
          }
        >
          Find Nearby Clinics
        </button>

        {/* ✅ Copilot */}
        <div className="mt-8 rounded-2xl border p-4">
          <div className="font-semibold">Derma Copilot</div>
          <p className="text-xs text-gray-600 mt-1">
            Ask questions about your screening result (not a diagnosis).
          </p>

          <div className="mt-4 space-y-3">
            {chat.length === 0 ? (
              <div className="text-sm text-gray-500">
                Try: “What should I do today?” or “Is this urgent?”
              </div>
            ) : (
              <div className="space-y-3">
                {chat.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {m.role === "user" ? "You" : "Copilot"}
                    </div>
                    {m.text}
                  </div>
                ))}
              </div>
            )}

            {copilotError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {copilotError}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask the Copilot..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <button
                onClick={sendToCopilot}
                disabled={copilotLoading}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {copilotLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Disclaimer: Derma-AI does not provide a medical diagnosis. If you are worried or symptoms
          worsen, consult a qualified healthcare professional.
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/scan" className="rounded-xl border px-4 py-2 text-sm">
            Scan again
          </Link>
          <Link href="/map" className="rounded-xl border px-4 py-2 text-sm">
            View Population Map (next)
          </Link>
        </div>
      </div>
    </div>
  );
}