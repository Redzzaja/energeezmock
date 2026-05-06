"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push("/loading");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-surface text-on-background flex items-center justify-center relative overflow-hidden">
      {/* Abstract Background Elements - Wave pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] rounded-[100%] bg-primary-container mix-blend-multiply blur-3xl transform rotate-12 animate-fade-in"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[70%] rounded-[100%] bg-surface-tint mix-blend-multiply blur-3xl transform -rotate-6 animate-fade-in stagger-1"></div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-fade-in-up">
        {/* Logo Container */}
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-primary-container flex items-center justify-center shadow-lg mb-4 relative overflow-hidden group animate-scale-in"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed to-primary-container opacity-50"></div>
          <span
            className="material-symbols-outlined text-[64px] md:text-[96px] text-on-primary-container z-10 animate-pulse-slow"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>

        {/* Brand Text */}
        <div>
          <h1 className="font-h1 text-h1 md:text-5xl md:leading-tight text-primary tracking-tight">
            ENERGEEZ
          </h1>
          <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-[200px] md:max-w-[300px] mt-2 mx-auto">
            Mindful energy tracking for a balanced life.
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-8 md:mt-12">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>

      {/* Desktop decoration */}
      <div className="hidden md:flex absolute bottom-12 items-center gap-2 text-on-surface-variant animate-fade-in stagger-2">
        <span className="material-symbols-outlined text-[18px]">smartphone</span>
        <span className="font-label-md text-label-md">Available on all devices</span>
      </div>
    </div>
  );
}
