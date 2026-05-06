"use client";

import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import PageLayout from "../components/PageLayout";

interface WeeklyData {
  day: string;
  full: string;
  value: number;
}

interface MonthlyData {
  week: string;
  value: number;
}

interface ActivityBreakdown {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface Insight {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface SummaryStats {
  avgEnergy: number;
  peak: number;
  low: number;
  trend: number;
}

interface StatsClientProps {
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
  activityBreakdown: ActivityBreakdown[];
  insights: Insight[];
  summaryStats: SummaryStats;
}

export default function StatsClient({
  weeklyData,
  monthlyData,
  activityBreakdown,
  insights,
  summaryStats,
}: StatsClientProps) {
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
              <h1 className="font-h1 text-h1 text-on-surface">Statistics</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Analyze your energy patterns and productivity trends.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md">
                This Week
              </button>
              <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                This Month
              </button>
              <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                This Year
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
            <GlassCard className="p-4 text-center">
              <p className="font-h2 text-h2 text-primary">{summaryStats.avgEnergy}%</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                Avg Energy
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="font-h2 text-h2 text-secondary">{summaryStats.peak}%</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                Peak
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="font-h2 text-h2 text-tertiary">{summaryStats.low}%</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                Low
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="font-h2 text-h2 text-primary">{summaryStats.trend > 0 ? "+" : ""}{summaryStats.trend}%</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                vs Last Week
              </p>
            </GlassCard>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Overview */}
              <section className="animate-fade-in-up stagger-1">
                <div className="flex items-center justify-between mb-4 md:hidden">
                  <h3 className="font-h3 text-h3 text-on-surface">Weekly Energy</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      Week
                    </button>
                    <button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                      Month
                    </button>
                  </div>
                </div>
                <h3 className="hidden md:block font-h3 text-h3 text-on-surface mb-4">Energy Trend</h3>

                <GlassCard className="p-4 md:p-6">
                  <div className="flex items-end justify-between h-48 md:h-64 gap-2 md:gap-4">
                    {weeklyData.length > 0 ? (
                      weeklyData.map((item, index) => (
                        <div
                          key={item.day}
                          className="flex-1 flex flex-col items-center gap-2"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="w-full bg-surface-container rounded-t-lg relative overflow-hidden h-32 md:h-48"
                          >
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-secondary-container rounded-t-lg transition-all duration-700 ease-out hover:from-primary hover:to-primary-container"
                              style={{
                                height: `${(item.value / 100) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-center">
                            <span className="font-label-sm text-label-sm text-on-surface-variant block md:hidden">
                              {item.day}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant hidden md:block">
                              {item.full}
                            </span>
                            <span className="font-label-md text-label-md text-on-surface block mt-1">
                              {item.value}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-on-surface-variant w-full text-center py-8">No data available</p>
                    )}
                  </div>
                </GlassCard>
              </section>

              {/* Monthly Trend - Desktop */}
              <section className="hidden md:block animate-fade-in-up stagger-2">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Monthly Overview</h3>
                <GlassCard className="p-6">
                  <div className="flex items-end justify-between h-40 gap-4">
                    {monthlyData.map((item, index) => (
                      <div
                        key={item.week}
                        className="flex-1 flex flex-col items-center gap-2"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="w-full bg-surface-container rounded-t-lg relative overflow-hidden h-24"
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-container rounded-t-lg transition-all duration-700"
                            style={{ height: `${item.value}%` }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {item.week}
                          </span>
                          <span className="font-label-md text-label-md text-on-surface block mt-1">
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </section>
            </div>

            {/* Right Column - Breakdown & Insights */}
            <div className="space-y-6">
              {/* Activity Breakdown */}
              <section className="animate-fade-in-up stagger-1">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Activity Breakdown</h3>

                <GlassCard className="p-4 md:p-5">
                  <div className="space-y-4">
                    {activityBreakdown.length > 0 ? (
                      activityBreakdown.map((item, index) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-4"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-[20px] text-on-surface">{item.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-label-md text-label-md text-on-surface">
                                {item.label}
                              </span>
                              <span className="font-label-md text-label-md text-on-surface-variant">
                                {item.value}%
                              </span>
                            </div>
                            <div className="h-2 bg-surface-container rounded-full overflow-hidden"
                            >
                              <div
                                className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                                style={{
                                  width: `${item.value}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-on-surface-variant text-center py-4">No activity data yet</p>
                    )}
                  </div>
                </GlassCard>
              </section>

              {/* Insights */}
              <section className="animate-fade-in-up stagger-2">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Insights</h3>

                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <GlassCard
                      key={insight.title}
                      className="flex gap-4 items-start p-4 md:p-5"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`w-10 h-10 shrink-0 rounded-full ${insight.bgColor} flex items-center justify-center ${insight.color}`}
                      >
                        <span className="material-symbols-outlined">{insight.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface mb-1"
                        >
                          {insight.title}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm"
                        >
                          {insight.description}
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
