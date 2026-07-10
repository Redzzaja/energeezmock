"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "../components/GlassCard";

export interface Question {
  id: number;
  text: string;
  icon: string;
  category: string;
}

interface QuestionnaireClientProps {
  questions: Question[];
  userName?: string;
}

export default function QuestionnaireClient({
  questions,
  userName = "Guest",
}: QuestionnaireClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: boolean }[]>([]);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  const handleAnswer = useCallback(
    (answer: boolean) => {
      setAnswers((prev) => {
        const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
        return [...filtered, { questionId: currentQuestion.id, answer }];
      });

      // Auto-advance after short delay for UX
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setDirection("next");
          setCurrentIndex((prev) => prev + 1);
        }
      }, 300);
    },
    [currentQuestion, currentIndex, questions.length]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("prev");
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    router.push("/auth");
  }, [router]);

  const handleSubmit = useCallback(() => {
    if (answers.length === 0) return;

    // Save demo answers to localStorage
    localStorage.setItem("demoQuestionnaireAnswers", JSON.stringify(answers));
    setCompleted(true);
  }, [answers]);

  // Calculate summary stats
  const yesCount = answers.filter((a) => a.answer).length;
  const noCount = answers.length - yesCount;
  const completionPercentage = Math.round((answers.length / questions.length) * 100);

  // Completion Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative px-5 py-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-primary-container mix-blend-multiply blur-3xl transform rotate-12"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[70%] rounded-[100%] bg-surface-tint mix-blend-multiply blur-3xl transform -rotate-6"></div>
        </div>

        <div className="z-10 w-full max-w-lg animate-fade-in-up">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-6 shadow-lg animate-scale-in">
              <span
                className="material-symbols-outlined text-[40px] text-on-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-h2 text-h2 text-on-surface mb-2">
              Demo Complete!
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your energy profile has been analyzed
            </p>
          </div>

          {/* Summary Card */}
          <GlassCard className="p-6 mb-6">
            <h3 className="font-h3 text-h3 text-on-surface text-center mb-6">
              Your Results
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-secondary-container/50 rounded-2xl">
                <p className="font-h2 text-h2 text-secondary">{yesCount}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Yes</p>
              </div>
              <div className="text-center p-4 bg-tertiary-container/50 rounded-2xl">
                <p className="font-h2 text-h2 text-tertiary">{noCount}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">No</p>
              </div>
              <div className="text-center p-4 bg-primary-container/50 rounded-2xl">
                <p className="font-h2 text-h2 text-primary">{completionPercentage}%</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Complete</p>
              </div>
            </div>

            {/* Answer summary */}
            <div className="space-y-3">
              {answers.map((a) => {
                const q = questions.find((q) => q.id === a.questionId);
                if (!q) return null;
                return (
                  <div
                    key={a.questionId}
                    className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        a.answer ? "text-secondary" : "text-tertiary"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {a.answer ? "check_circle" : "cancel"}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface flex-1">
                      {q.category}
                    </span>
                    <span
                      className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${
                        a.answer
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-container text-on-tertiary-container"
                      }`}
                    >
                      {a.answer ? "Yes" : "No"}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push("/auth")}
              className="w-full py-4 rounded-2xl bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person_add
              </span>
              Create Account to Save
            </button>

            <button
              onClick={() => {
                setCompleted(false);
                setCurrentIndex(0);
                setAnswers([]);
              }}
              className="w-full py-3 rounded-2xl bg-surface-container border border-surface-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">replay</span>
              Retake Questionnaire
            </button>

            <button
              onClick={() => router.push("/auth")}
              className="w-full py-3 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const animationClass = "animate-fade-in-up";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative px-5 py-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-primary-container mix-blend-multiply blur-3xl transform rotate-12"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[70%] rounded-[100%] bg-surface-tint mix-blend-multiply blur-3xl transform -rotate-6"></div>
      </div>

      {/* Demo Badge */}
      <div className="absolute top-6 right-6 z-20">
        <span className="px-3 py-1.5 bg-primary-container/80 backdrop-blur-sm text-on-primary-container rounded-full font-label-sm text-label-sm flex items-center gap-1.5 border border-primary/10">
          <span className="material-symbols-outlined text-[14px]">visibility</span>
          Demo Mode
        </span>
      </div>

      <div className="z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span
              className="material-symbols-outlined text-[32px] text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              quiz
            </span>
          </div>
          <h1 className="font-h2 text-h2 text-on-surface">
            Energy Profile
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Help us understand {userName ? `you, ${userName}` : "you"} better
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">
            This is a demo — no account required
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-label-sm text-label-sm text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className={animationClass} key={currentQuestion.id}>
          <GlassCard className="p-6 md:p-8 mb-6 text-center">
            {/* Category tag */}
            <span className="inline-block px-3 py-1 bg-primary-fixed-dim/50 text-on-primary-fixed-variant rounded-full font-label-sm text-label-sm mb-4">
              {currentQuestion.category}
            </span>

            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span
                className="material-symbols-outlined text-[28px] text-on-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {currentQuestion.icon}
              </span>
            </div>

            {/* Question text */}
            <h2 className="font-h3 text-h3 text-on-surface mb-6">
              {currentQuestion.text}
            </h2>

            {/* Yes/No buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleAnswer(true)}
                className={`flex-1 max-w-[160px] py-4 px-6 rounded-2xl font-label-md text-label-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  currentAnswer?.answer === true
                    ? "bg-secondary text-on-secondary shadow-lg"
                    : "bg-surface-container border border-surface-variant text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={`flex-1 max-w-[160px] py-4 px-6 rounded-2xl font-label-md text-label-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  currentAnswer?.answer === false
                    ? "bg-tertiary text-on-tertiary shadow-lg"
                    : "bg-surface-container border border-surface-variant text-on-surface hover:bg-tertiary-container hover:text-on-tertiary-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cancel
                </span>
                No
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 font-label-md text-label-md transition-colors ${
              currentIndex === 0
                ? "text-on-surface-variant/40 cursor-not-allowed"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Previous
          </button>

          {/* Submit button - shown on last question when answered */}
          {currentIndex === questions.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={answers.length === 0}
              className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-2xl shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              Complete
            </button>
          )}
        </div>

        {/* Skip button */}
        <div className="text-center mt-8">
          <button
            onClick={handleSkip}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors underline underline-offset-2"
          >
            Skip to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
