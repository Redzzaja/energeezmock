"use client";

import { useRouter } from "next/navigation";
import TopAppBar from "../../components/TopAppBar";
import BottomNav from "../../components/BottomNav";
import GlassCard from "../../components/GlassCard";

// Generate full month calendar
const currentMonth = "May 2026";
const fullCalendarDays = Array.from({ length: 42 }, (_, i) => {
  const day = i - 4; // Offset for month start
  const isCurrentMonth = day > 0 && day <= 31;
  return {
    day: isCurrentMonth ? day : null,
    prevNextMonth: !isCurrentMonth && day <= 31 ? day + 31 : day > 31 ? day - 31 : null,
    isToday: day === 5,
    energyLevel: isCurrentMonth ? Math.floor(Math.random() * 4) : null, // 0-3: none, low, medium, high
  };
});

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function FullCalendarPage() {
  const router = useRouter();

  const getEnergyIndicator = (level: number | null) => {
    if (level === null || level === 0) return null;
    const colors = [
      "",
      "bg-error-container",
      "bg-tertiary-fixed-dim",
      "bg-secondary-container",
    ];
    return colors[level] || "";
  };

  return (
    <div className="min-h-screen bg-surface relative pb-20">
      <TopAppBar
        showSettings={false}
        showBack={true}
        onBack={() => router.push("/calendar")}
      />

      <main className="px-5 pt-20 pb-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-h2 text-h2 text-on-surface">{currentMonth}</h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Full Calendar */}
        <GlassCard className="p-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-label-md text-label-md text-on-surface-variant py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {fullCalendarDays.map((item, index) => {
              const displayDay = item.day || item.prevNextMonth;
              const isCurrentMonth = item.day !== null;
              const energyDot = getEnergyIndicator(item.energyLevel);

              return (
                <button
                  key={index}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative p-2 transition-all ${
                    displayDay
                      ? "hover:bg-surface-container cursor-pointer"
                      : ""
                  } ${
                    item.isToday
                      ? "ring-2 ring-primary bg-primary-container/10"
                      : ""
                  } ${!isCurrentMonth ? "opacity-40" : ""}`}
                >
                  {displayDay && (
                    <>
                      <span
                        className={`font-label-md ${
                          item.isToday
                            ? "text-primary font-bold"
                            : "text-on-surface"
                        }`}
                      >
                        {displayDay}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {item.energyLevel && item.energyLevel > 0 && (
                          <>
                            <div className={`w-1.5 h-1.5 rounded-full ${energyDot}`}></div>
                            {item.energyLevel > 2 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${energyDot}`}></div>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              High Energy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant"
            >
              Medium Energy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error-container"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Low Energy
            </span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
