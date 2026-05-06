"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import PageLayout from "../components/PageLayout";

interface Activity {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  impact: number;
  impactColor: string;
}

interface WeeklyTrend {
  day: string;
  value: number;
}

interface QuickStats {
  vsLastWeek: number;
  activityCount: number;
  avgEnergy: number;
}

interface HomeClientProps {
  dailyEnergy: number;
  isOverloaded?: boolean;
  overloadAmount?: number;
  peakTime: string;
  weeklyTrend: WeeklyTrend[];
  activities: Activity[];
  quickStats: QuickStats;
}

export default function HomeClient({
  dailyEnergy,
  isOverloaded = false,
  overloadAmount = 0,
  peakTime,
  weeklyTrend,
  activities,
  quickStats,
}: HomeClientProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
    }
  }, []);
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
              <h1 className="font-h1 text-h1 text-on-surface">Dashboard</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Welcome back! Here's your energy overview.
              </p>
            </div>
            <Link
              href="/add"
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add
              </span>
              Add Activity
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Energy Summary */}
              <section className="animate-fade-in-up">
                <div className="energy-gradient rounded-2xl p-6 md:p-8 text-on-primary shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[280px] md:min-h-[240px]"
                >
                  {/* Background Icon */}
                  <div className="absolute -right-8 -top-8 md:-right-12 md:-top-12 opacity-20">
                    <span
                      className="material-symbols-outlined text-[140px] md:text-[180px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="font-h3 text-h3">Daily Energy</h2>
                      {isOverloaded && (
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-label-sm text-label-sm flex items-center gap-1 animate-pulse">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Overload +{overloadAmount}%
                        </span>
                      )}
                    </div>
                    <p className="font-body-md text-white/80">
                      {isOverloaded
                        ? "You've exceeded your daily energy limit!"
                        : dailyEnergy > 80
                        ? "You're running at peak performance."
                        : dailyEnergy > 40
                        ? "Building good momentum today."
                        : dailyEnergy > 0
                        ? "Getting started. Keep it up!"
                        : "Start your day with an activity!"}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-8 md:mt-6 relative z-10">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-[56px] md:text-[72px] font-bold leading-none tracking-tighter ${isOverloaded ? 'text-yellow-300' : ''}`}>
                        {dailyEnergy}
                      </span>
                      <span className={`font-h2 text-h2 ${isOverloaded ? 'text-yellow-300' : ''}`}>%</span>
                    </div>
                    <div className="text-right">
                      <p className="font-label-md text-label-md text-primary-fixed-dim">
                        Peak Time
                      </p>
                      <p className="font-h3 text-h3">{peakTime}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Weekly Trend Chart - Desktop */}
              <section className="hidden md:block animate-fade-in-up stagger-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-h3 text-h3 text-on-surface">Weekly Trend</h3>
                  <Link
                    href="/stats"
                    className="font-label-md text-label-md text-primary hover:underline"
                  >
                    View Full Stats
                  </Link>
                </div>

                <GlassCard className="p-6">
                  <div className="flex items-end justify-between h-32 gap-3">
                    {weeklyTrend.map((item, index) => (
                      <div
                        key={item.day}
                        className="flex-1 flex flex-col items-center gap-2"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="w-full bg-surface-container rounded-t-lg relative overflow-hidden h-24"
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-container rounded-t-lg transition-all duration-500"
                            style={{ height: `${item.value}%` }}
                          ></div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant"
                        >
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </section>

              {/* Today's Focus */}
              <section className="animate-fade-in-up stagger-2 md:stagger-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-h3 text-h3 text-on-surface">Today's Focus</h3>
                  <Link
                    href="/calendar"
                    className="font-label-md text-label-md text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <GlassCard
                        key={activity.id}
                        className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors"
                          >
                            <span className="material-symbols-outlined">{activity.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-on-surface">
                              {activity.title}
                            </h4>
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                              {activity.subtitle}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`font-label-sm text-label-sm px-3 py-1 rounded-full font-bold ${activity.impactColor}`}
                        >
                          {activity.impact > 0 ? "+" : ""}
                          {activity.impact}%
                        </div>
                      </GlassCard>
                    ))
                  ) : (
                    <GlassCard className="p-8 text-center">
                      <p className="font-body-md text-on-surface-variant">
                        No activities yet. Add your first one!
                      </p>
                      <Link
                        href="/add"
                        className="mt-4 inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:underline"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Add Activity
                      </Link>
                    </GlassCard>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6">
              {/* Mindfulness Tip */}
              <section className="animate-fade-in-up stagger-2">
                <h3 className="font-h3 text-h3 text-on-surface mb-4 hidden md:block">Mindfulness</h3>
                <GlassCard className="flex gap-4 items-start relative p-5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container-highest flex items-center justify-center text-primary mt-1">
                    <span className="material-symbols-outlined">self_improvement</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface mb-2 md:hidden">
                      Mindfulness Tip
                    </h3>
                    <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                      Take a 5-minute breathing break before your next meeting. It
                      helps reset your cognitive load and preserves your battery for
                      the afternoon.
                    </p>
                    <button className="mt-4 text-primary font-label-md text-label-md hover:underline">
                      Try Now →
                    </button>
                  </div>
                </GlassCard>
              </section>

              {/* Quick Stats */}
              <section className="hidden md:block animate-fade-in-up stagger-3">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <GlassCard className="p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-[28px] mb-2">trending_up</span>
                    <p className="font-h2 text-h2 text-on-surface">{quickStats.vsLastWeek > 0 ? "+" : ""}{quickStats.vsLastWeek}%</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      vs Last Week
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <span className="material-symbols-outlined text-secondary text-[28px] mb-2">schedule</span>
                    <p className="font-h2 text-h2 text-on-surface">{quickStats.activityCount}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Activities
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <span className="material-symbols-outlined text-tertiary text-[28px] mb-2">bedtime</span>
                    <p className="font-h2 text-h2 text-on-surface">{quickStats.avgEnergy}%</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Avg Energy
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-[28px] mb-2">fitness_center</span>
                    <p className="font-h2 text-h2 text-on-surface">{Math.round(quickStats.activityCount / 7)}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Daily Avg
                    </p>
                  </GlassCard>
                </div>
              </section>

              {/* Quick Actions - Mobile */}
              <section className="md:hidden animate-fade-in-up stagger-3">
                <Link
                  href="/add"
                  className="w-full bg-primary text-on-primary font-label-md text-label-md px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    add
                  </span>
                  Add Activity
                </Link>
              </section>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
