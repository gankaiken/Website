"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Candidate = { label: string; confidence: number };

export default function ScanPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCandidates(null);

    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const analyze = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For MVP: we don't send the image yet (mock endpoint)
      const res = await fetch("/api/analyze-image", { method: "POST" });
      if (!res.ok) throw new Error("Analyze failed");

      const data = await res.json();
      setCandidates(data.candidates);

      // Save analysis to localStorage so next pages can read it (simple MVP state)
      localStorage.setItem("derma_ai_image_candidates", JSON.stringify(data.candidates));

      // Optional: auto-go to triage after showing result for 1 sec
      setTimeout(() => router.push("/triage"), 900);
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Derma-AI Skin Scan</h1>
        <p className="text-sm text-gray-600 mt-2">
          Upload a photo of the affected skin area. This is a screening tool, not a diagnosis.
        </p>

        <div className="mt-6 space-y-4">
          <input type="file" accept="image/*" onChange={handleUpload} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-80 object-contain rounded-xl border"
            />
          )}

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
            disabled={loading}
            onClick={analyze}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {candidates && (
            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold">Possible categories (not diagnosis)</h2>
              <div className="mt-3 space-y-2">
                {candidates.map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="font-medium">{Math.round(c.confidence * 100)}%</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-600">
                Next: a few quick questions to improve risk accuracy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}