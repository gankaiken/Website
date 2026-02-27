"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/lib/triageQuestions";
import { calculateRisk } from "@/lib/riskEngine";

export default function TriagePage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[step];

  const handleAnswer = (option: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(updatedAnswers);

    // If more questions, continue
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    // Finished triage -> calculate risk
    const result = calculateRisk(updatedAnswers);

    // Save results for Results page
    localStorage.setItem("derma_ai_result", JSON.stringify(result));
    localStorage.setItem("derma_ai_answers", JSON.stringify(updatedAnswers));

    // Go to results
    router.push("/results");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Guided Symptom Triage</h1>
        <p className="text-sm text-gray-600 mt-2">
          Answer a few quick questions so we can generate a risk score (not a diagnosis).
        </p>

        <div className="mt-6">
          <div className="text-sm text-gray-500">
            Question {step + 1} of {questions.length}
          </div>

          <div className="mt-3 text-lg font-semibold">{currentQuestion.text}</div>

          <div className="mt-4 space-y-3">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full rounded-xl border p-3 hover:bg-gray-100 text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Safety note: This tool provides screening guidance only. Seek professional help if symptoms
          worsen or you are concerned.
        </div>
      </div>
    </div>
  );
}