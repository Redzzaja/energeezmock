"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AIProcessingModalProps {
  isOpen: boolean;
  activityTitle: string;
  onComplete: (result: AIProcessingResult) => void;
  onCancel: () => void;
}

interface AIProcessingResult {
  predictedEnergyImpact: number;
  confidence: number;
  optimalTime: string;
  categoryMatch: string;
  mlInsights: string[];
}

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  percentage: number;
  icon: string;
}

const processingSteps: ProcessingStep[] = [
  {
    id: 1,
    title: "Analyzing Activity Pattern",
    description: "Parsing activity data and categorization...",
    percentage: 25,
    icon: "analytics",
  },
  {
    id: 2,
    title: "Processing Energy Impact",
    description: "Calculating neural activation patterns...",
    percentage: 50,
    icon: "network_node",
  },
  {
    id: 3,
    title: "ML Predictions",
    description: "Running machine learning models...",
    percentage: 75,
    icon: "model_training",
  },
  {
    id: 4,
    title: "Optimizing Profile",
    description: "Syncing with your energy baseline...",
    percentage: 100,
    icon: "sync",
  },
];

export default function AIProcessingModal({
  isOpen,
  activityTitle,
  onComplete,
  onCancel,
}: AIProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timeouts/intervals
  const clearAllTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentStep(0);
    setProgress(0);
    setTypingText("");
    setIsComplete(false);
    setShowDetails(false);
  }, []);

  // Handle completion
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    const mockResult: AIProcessingResult = {
      predictedEnergyImpact: Math.floor(Math.random() * 60) - 30,
      confidence: 0.85 + Math.random() * 0.14,
      optimalTime: ["08:00 AM", "02:00 PM", "06:00 PM"][
        Math.floor(Math.random() * 3)
      ],
      categoryMatch: ["Work", "Exercise", "Rest"][
        Math.floor(Math.random() * 3)
      ],
      mlInsights: [
        "High correlation with your morning routine",
        "Optimal duration for your current energy level",
        "Matches your productivity pattern profile",
      ],
    };
    completeTimeoutRef.current = setTimeout(() => {
      onComplete(mockResult);
    }, 500);
  }, [onComplete]);

  // Move to next step
  const moveToNextStep = useCallback((currentStepIndex: number) => {
    if (currentStepIndex < processingSteps.length - 1) {
      setCurrentStep(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  }, [handleComplete]);

  // Start progress for a step
  const startStepProgress = useCallback((stepIndex: number) => {
    const targetProgress = processingSteps[stepIndex].percentage;
    const startProgress = stepIndex === 0 ? 0 : processingSteps[stepIndex - 1].percentage;
    let currentProgress = startProgress;
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      const remaining = targetProgress - currentProgress;
      const increment = remaining * 0.05; // 5% of remaining distance
      currentProgress += Math.max(increment, 0.1);
      
      if (currentProgress >= targetProgress - 0.5) {
        // Reached target
        setProgress(targetProgress);
        clearInterval(progressIntervalRef.current!);
        progressIntervalRef.current = null;
        
        // Wait then move to next step
        stepTimeoutRef.current = setTimeout(() => {
          moveToNextStep(stepIndex);
        }, 300);
      } else {
        setProgress(currentProgress);
      }
    }, 30);
  }, [moveToNextStep]);

  // Typing effect
  useEffect(() => {
    if (!isOpen || currentStep >= processingSteps.length) return;

    const step = processingSteps[currentStep];
    let index = 0;
    setTypingText("");

    const typeInterval = setInterval(() => {
      if (index < step.description.length) {
        setTypingText(step.description.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 25);

    return () => clearInterval(typeInterval);
  }, [currentStep, isOpen]);

  // Main animation effect - starts when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Start from step 0
    startStepProgress(0);

    return () => {
      clearAllTimers();
    };
  }, [isOpen, startStepProgress, clearAllTimers]);

  // Handle step changes - start progress for new step
  useEffect(() => {
    if (!isOpen || isComplete) return;
    if (currentStep > 0 && currentStep < processingSteps.length) {
      startStepProgress(currentStep);
    }
  }, [currentStep, isOpen, isComplete, startStepProgress]);

  // Canvas animation for neural network
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(74, 101, 74, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 101, 74, ${p.opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        gradient.addColorStop(0, `rgba(74, 101, 74, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  if (!isOpen) return null;

  const currentStepData = processingSteps[currentStep] || processingSteps[processingSteps.length - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm" />

      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 rounded-full border-2 border-secondary animate-[spin_4s_linear_infinite] opacity-30" />
            <div className="absolute w-32 h-32 rounded-full border border-primary animate-[spin_6s_linear_infinite_reverse] opacity-20" />
            <div
              className="absolute w-40 h-40 rounded-full border border-secondary animate-ping opacity-10"
              style={{ animationDuration: "3s" }}
            />

            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/20">
              <span
                className="material-symbols-outlined text-[40px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isComplete ? "check_circle" : currentStepData?.icon || "psychiatry"}
              </span>
            </div>
          </div>

          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            {isComplete ? "Analysis Complete" : "AI Processing"}
          </h2>
          <p className="font-body-md text-on-surface-variant">
            {isComplete
              ? `Analyzed: ${activityTitle}`
              : `Analyzing: ${activityTitle}`}
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-surface-container-low rounded-3xl p-6 shadow-2xl border border-surface-variant">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-md text-on-surface-variant">Progress</span>
              <span className="font-h3 text-h3 text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100 ease-linear relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {processingSteps.map((step, index) => {
              const isActive = index === currentStep && !isComplete;
              const isCompleted = index < currentStep || isComplete;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary-container/50 scale-[1.02]"
                      : isCompleted
                      ? "bg-surface-container"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isCompleted
                        ? "bg-secondary text-white"
                        : isActive
                        ? "bg-primary text-white animate-pulse"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCompleted ? "check" : step.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-label-md text-label-md truncate ${
                        isActive ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <div className="h-6 overflow-hidden">
                      <p
                        className={`font-body-md text-sm transition-all duration-200 ${
                          isActive
                            ? "text-primary translate-y-0"
                            : "text-on-surface-variant -translate-y-full"
                        }`}
                      >
                        {isActive ? typingText : step.description}
                        {isActive && (
                          <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-label-sm text-label-sm shrink-0 ${
                      isActive || isCompleted
                        ? "text-secondary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {step.percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              {showDetails ? "expand_less" : "expand_more"}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {showDetails ? "Hide Technical Details" : "Show Technical Details"}
            </span>
          </button>

          {/* Technical Details Panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showDetails ? "max-h-64 mt-4" : "max-h-0"
            }`}
          >
            <div className="bg-surface-container-high rounded-xl p-4 font-mono text-xs text-on-surface-variant space-y-2">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-primary">energeez-v2.4-turbo</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-secondary">{Math.round(progress * 1.2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Neural Nodes:</span>
                <span className="text-tertiary">{Math.round(progress * 12.8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="text-secondary">{Math.min(Math.round(progress * 0.94 + 6), 99)}%</span>
              </div>
              <div className="h-px bg-surface-variant my-2" />
              <div className="text-on-surface-variant/60">Processing inferences across 128-dimensional energy vectors...</div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => {
            clearAllTimers();
            onCancel();
          }}
          disabled={isComplete}
          className="mt-6 mx-auto block px-6 py-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-label-md text-label-md"
        >
          {isComplete ? "Redirecting..." : "Cancel Processing"}
        </button>
      </div>
    </div>
  );
}
