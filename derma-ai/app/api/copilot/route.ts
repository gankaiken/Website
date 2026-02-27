import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const userMessage: string = body?.message ?? "";
  const risk: string = body?.risk ?? "Unknown";

  // Mock “medical-style” response with safe structure
  const reply = {
    sections: {
      detected: `Based on your screening flow, your current risk level is: ${risk}.`,
      meaning:
        "This is not a diagnosis. The categories are AI-assisted screening signals and may be inaccurate.",
      todo:
        risk === "High"
          ? [
              "Seek medical assessment soon (same day / within 24 hours if possible).",
              "Avoid applying unknown creams; keep the area clean and protected.",
              "If symptoms worsen quickly, seek urgent care.",
            ]
          : risk === "Medium"
          ? [
              "Monitor closely and consider seeing a GP/pharmacist within a few days.",
              "Avoid new skincare products; use gentle cleanser/moisturiser.",
              "If spreading or persistent beyond 1–2 weeks, get checked.",
            ]
          : [
              "Monitor for changes over 48–72 hours.",
              "Avoid scratching; keep the area clean and dry.",
              "If it persists or worsens, consider a clinic visit.",
            ],
      whenToAct:
        risk === "High"
          ? "Act soon: severe pain, fever, fast spread, facial swelling, or pus → urgent care."
          : "If pain increases, it spreads rapidly, or you feel unwell → seek medical help.",
    },
    echo: userMessage ? `You asked: "${userMessage}"` : "",
  };

  await new Promise((r) => setTimeout(r, 700)); // make it feel “real”

  return NextResponse.json(reply);
}