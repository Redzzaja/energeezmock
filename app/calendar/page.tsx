"use client";

import Link from "next/link";
import { useState } from "react";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import PageLayout from "../components/PageLayout";

// Generate calendar data
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentMonth = "May 2026";
const calendarDays = Array.from({ length: 42 }, (_, i) => {
  const day = i - 5; // Offset to start from previous month
  return {
    day: day > 0 && day <= 31 ? day : null,
    isToday: day === 6,
    energyLevel: day > 0 && day <= 31 ? Math.floor(Math.random() * 3) : null, // 0: low, 1: medium, 2: high
    hasEvent: day > 0 && day <= 31 && Math.random() > 0.6,
  };
});

// Mock upcoming events
const events = [
  {
    id: 1,
    title: "Morning Yoga",
    time: "07:00 AM",
    duration: "30 min",
    icon: "self_improvement",
    color: "bg-secondary-container text-on-secondary-container",
    energyImpact: "+15%",
  },
  {
    id: 2,
    title: "Team Meeting",
    time: "10:00 AM",
    duration: "1 hour",
    icon: "groups",
    color: "bg-tertiary-fixed-dim/30 text-on-tertiary-container",
    energyImpact: "-20%",
  },
  {
    id: 3,
    title: "Lunch Break",
    time: "12:30 PM",
    duration: "45 min",
    icon: "restaurant",
    color: "bg-surface-container-high text-on-surface",
    energyImpact: "+5%",
  },
  {
    id: 4,
    title: "Deep Work Session",
    time: "02:00 PM",
    duration: "2 hours",
    icon: "work",
    color: "bg-primary-container/20 text-on-primary-container",
    energyImpact: "-25%",
  },
  {
    id: 5,
    title: "Evening Run",
    time: "06:00 PM",
    duration: "45 min",
    icon: "directions_run",
    color: "bg-secondary-fixed-dim/30 text-on-secondary-container",
    energyImpact: "+20%",
  },
];

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(6);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getEnergyColor = (level: number | null) => {
    if (level === null) return "";
    if (level === 0) return "bg-error-container";
    if (level === 1) return "bg-tertiary-fixed-dim";
    return "bg-secondary-container";
  };

  const getEnergyText = (level: number | null) => {
    if (level === null) return "";
    if (level === 0) return "Low";
    if (level === 1) return "Medium";
    return "High";
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-surface relative md:pb-0 pb-20">
        {/* Mobile TopAppBar */}
        <div className="md:hidden">
          <TopAppBar />
        </div>

        <main className="px-5 pt-[72px] md:pt-0 pb-6">
          {/* Header - Desktop */}
          <div className="hidden md:flex md:items-center md:justify-between md:mb-8">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface">Calendar</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Manage your schedule and track energy throughout the day.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-surface-container rounded-xl p-1">
                {(['month', 'week', 'day'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Link
                href="/add"
                className="bg-primary text-on-primary font-label-md text-label-md px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Event
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-2">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <h2 className="font-h2 text-h2 text-on-surface">{currentMonth}</h2>
                  <div className="hidden md:flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="md:hidden flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <GlassCard className="mb-6 animate-fade-in-up stagger-1 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-4 border-b border-surface-variant pb-3">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="text-center font-label-sm text-label-sm text-on-surface-variant py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => item.day && setSelectedDay(item.day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all p-1 md:p-2 ${
                        item.day
                          ? "hover:bg-surface-container cursor-pointer"
                          : "pointer-events-none"
                      } ${
                        item.day === selectedDay
                          ? "bg-primary-container text-on-primary-container"
                          : ""
                      } ${item.isToday && item.day !== selectedDay ? "ring-2 ring-primary ring-inset" : ""}`}
                    >
                      {item.day && (
                        <>
                          <span className="font-label-md text-label-md md:text-base">{item.day}</span>
                          {item.energyLevel !== null && (
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <div
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getEnergyColor(
                                  item.energyLevel
                                )}`}
                              ></div>
                              {item.hasEvent && (
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary mt-0.5"></div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Energy Legend - Desktop */}
              <div className="hidden md:flex items-center gap-6 mb-6 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error-container"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Low Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">High Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Has Events</span>
                </div>
              </div>
            </div>

            {/* Right Column - Schedule */}
            <div className="space-y-6">
              {/* Selected Day Info - Desktop */}
              <section className="hidden md:block animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-h3 text-h3 text-on-surface">
                      {fullDays[new Date(2026, 4, selectedDay).getDay()]}
                    </h3>
                    <p className="font-body-md text-on-surface-variant">
                      May {selectedDay}, 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEnergyColor(2)}`}></div>
                    <span className="font-label-md text-label-md text-on-surface">
                      {getEnergyText(2)} Energy
                    </span>
                  </div>
                </div>
              </section>

              {/* Today's Schedule */}
              <section className="animate-fade-in-up stagger-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-h3 text-h3 text-on-surface md:hidden">Today's Schedule</h3>
                  <h3 className="hidden md:block font-h3 text-h3 text-on-surface">Schedule</h3>
                  <Link
                    href="/add"
                    className="md:hidden font-label-md text-label-md text-primary hover:underline"
                  >
                    Add New
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {events.map((event, index) => (
                    <GlassCard
                      key={event.id}
                      className="flex items-center gap-4 p-3 md:p-4 hover:bg-surface-container-low transition-colors cursor-pointer group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${event.color}`}
                      >
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                          {event.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-label-md text-label-md text-on-surface truncate">
                          {event.title}
                        </h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {event.time} • {event.duration}
                        </p>
                      </div>
                      <div className={`font-label-sm text-label-sm font-bold ${
                        event.energyImpact.startsWith('+') 
                          ? 'text-secondary' 
                          : 'text-tertiary'
                      }`}>
                        {event.energyImpact}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Quick Add - Desktop */}
              <section className="hidden md:block animate-fade-in-up stagger-2">
                <GlassCard className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container mx-auto mb-3 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">add</span>
                  </div>
                  <h4 className="font-label-md text-label-md text-on-surface mb-1">
                    Quick Add Event
                  </h4>
                  <p className="font-body-md text-on-surface-variant text-sm mb-4">
                    Track your activities and energy levels
                  </p>
                  <Link
                    href="/add"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors"
                  >
                    Add Activity
                  </Link>
                </GlassCard>
              </section>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
