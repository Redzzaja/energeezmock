"use client";

import Link from "next/link";

interface TopAppBarProps {
  showSettings?: boolean;
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
}

export default function TopAppBar({
  showSettings = true,
  showBack = false,
  title = "Energeez",
  onBack,
}: TopAppBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm">
      <div className="flex items-center justify-between px-5 h-16 w-full max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed bg-surface-container">
              <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-secondary">
                <span className="material-symbols-outlined filled">person</span>
              </div>
            </div>
          )}
          {!showBack && (
            <span className="font-h2 text-h2 text-primary tracking-tight">{title}</span>
          )}
        </div>
        
        {showSettings && (
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        )}
      </div>
    </header>
  );
}
