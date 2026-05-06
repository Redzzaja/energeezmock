"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Redirect after animation completes
    const timer = setTimeout(() => {
      router.push("/home");
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  const displayProgress = Math.min(Math.round(progress), 100);

  return (
    <div className="bg-surface text-on-background font-body-md min-h-screen overflow-hidden flex items-center justify-center relative">
      {/* Background Waves */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
        <svg
          className="w-full h-full fill-surface-variant"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M0,100 C20,80 40,90 60,70 C80,50 100,60 100,60 L100,100 Z"></path>
          <path
            className="fill-surface-container-high opacity-50"
            d="M0,100 C30,70 50,85 70,55 C90,25 100,40 100,40 L100,100 Z"
          ></path>
          <path
            className="fill-surface-container opacity-70"
            d="M0,100 C40,90 60,60 80,80 C100,100 100,100 100,100 L0,100 Z"
          ></path>
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm md:max-w-md px-5 animate-fade-in-up"
      >
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20 mb-6 animate-scale-in"
          >
            <span
              className="material-symbols-outlined text-[48px] md:text-[64px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
          <h1 className="font-h1 text-h1 md:font-h2 md:text-h2 text-primary text-center">Energeez</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
            Mindful energy tracking
          </p>
        </div>

        <div className="w-full flex flex-col gap-4"
        >
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center">
            Loading your dashboard...
          </p>
          <div className="w-full h-2 md:h-3 bg-surface-container-highest rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-secondary rounded-full shadow-sm transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {displayProgress}%
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
