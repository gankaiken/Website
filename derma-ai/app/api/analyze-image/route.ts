import { NextResponse } from "next/server";

export async function POST() {
  // Mocked MedGemma-style output (structured, non-diagnostic)
  const result = {
    candidates: [
      { label: "Dermatitis / Eczema-like", confidence: 0.72 },
      { label: "Fungal-like rash", confidence: 0.18 },
      { label: "Acne-like", confidence: 0.10 },
    ],
    disclaimer:
      "This is not a diagnosis. It is an AI-assisted risk screening and should not replace professional medical advice.",
  };

  // Simulate “processing time” so it feels real
  await new Promise((r) => setTimeout(r, 900));

  return NextResponse.json(result);
}