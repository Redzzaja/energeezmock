"use client";

import { useEffect, useState } from "react";
import { QUESTIONS } from "../../lib/questionnaireData";
import QuestionnaireClient from "./QuestionnaireClient";

export default function QuestionnairePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading for smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center animate-pulse">
            <span
              className="material-symbols-outlined text-[32px] text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              quiz
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Preparing your questions...
          </p>
          <div className="w-48 h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionnaireClient
      questions={QUESTIONS}
      userName="Guest"
    />
  );
}
