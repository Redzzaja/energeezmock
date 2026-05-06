"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEnergyStats, getUserActivities, getCategories } from "../actions/activityActions";
import StatsClient from "./StatsClient";

export default function StatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<{ day: string; full: string; value: number }[]>([]);
  const [activityBreakdown, setActivityBreakdown] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    avgEnergy: 0,
    peak: 0,
    low: 0,
    trend: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      router.push("/auth");
      return;
    }

    const user = JSON.parse(storedUser);
    loadUserData(user.id);
  }, [router]);

  const loadUserData = async (userId: number) => {
    try {
      const [statsResult, activitiesResult] = await Promise.all([
        getEnergyStats(userId),
        getUserActivities(userId),
      ]);

      // Process weekly data
      let processedWeeklyData: { day: string; full: string; value: number }[] = [];
      
      if (statsResult.success && statsResult.stats?.weeklyData && statsResult.stats.weeklyData.length > 0) {
        const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
        
        processedWeeklyData = statsResult.stats.weeklyData.slice(0, 7).map((log: { day: string; value: number }) => {
          const dayIndex = dayMap[log.day] ?? 0;
          return {
            day: log.day,
            full: fullDays[dayIndex],
            value: Math.round(log.value ?? 0),
          };
        });
      }

      // Process activity breakdown
      const processedBreakdown = statsResult.success && statsResult.stats?.activityBreakdown
        ? statsResult.stats.activityBreakdown.map((item: any) => {
            const colorMap: Record<string, string> = {
              "Work": "bg-primary-container",
              "Exercise": "bg-secondary-container",
              "Rest": "bg-tertiary-fixed-dim",
              "Social": "bg-surface-container-high",
              "Meal": "bg-secondary-fixed",
              "Mindfulness": "bg-primary-fixed",
            };
            
            const iconMap: Record<string, string> = {
              "Work": "work",
              "Exercise": "directions_run",
              "Rest": "bedtime",
              "Social": "social_distance",
              "Meal": "restaurant",
              "Mindfulness": "self_improvement",
            };
            
            const totalActivities = statsResult.stats.activityBreakdown.reduce(
              (sum: number, i: any) => sum + (i.count || 0), 0
            );
            const percentage = totalActivities > 0 
              ? Math.round(((item.count || 0) / totalActivities) * 100)
              : 0;

            return {
              label: item.categoryName || "Activity",
              value: percentage,
              color: colorMap[item.categoryName] || "bg-surface-container-high",
              icon: iconMap[item.categoryName] || "circle",
            };
          })
        : [];

      const activityCount = activitiesResult.success && activitiesResult.activities
        ? activitiesResult.activities.length
        : 0;

      // Calculate stats - default to 0 (base) for new users
      const hasData = processedWeeklyData.length > 0;
      const avgEnergy = hasData
        ? Math.round(processedWeeklyData.reduce((sum: number, d: any) => sum + d.value, 0) / processedWeeklyData.length)
        : 0;

      const peakValue = hasData
        ? Math.max(...processedWeeklyData.map((d: any) => d.value))
        : 0;

      const lowValue = hasData
        ? Math.min(...processedWeeklyData.map((d: any) => d.value))
        : 0;

      const trendValue = hasData && processedWeeklyData.length >= 2
        ? Math.round(((processedWeeklyData[processedWeeklyData.length - 1].value - processedWeeklyData[0].value) / processedWeeklyData[0].value) * 100)
        : 0;

      // Generate insights based on actual data
      const generatedInsights = [
        {
          icon: "trending_up",
          title: "Peak Performance",
          description: hasData && peakValue > 0
            ? `Your energy peaked at ${peakValue}%. Great job maintaining performance!`
            : activityCount === 0
            ? "Start adding activities to track your energy patterns."
            : "Your energy shows consistent patterns. Keep tracking!",
          color: "text-secondary",
          bgColor: "bg-secondary-container",
        },
        {
          icon: "schedule",
          title: "Activity Balance",
          description: activityCount > 0
            ? `You've logged ${activityCount} activit${activityCount === 1 ? 'y' : 'ies'}. ${activityCount < 3 ? 'Add more to see patterns!' : 'Good start!'}`
            : "No activities yet. Add your first one to begin tracking!",
          color: "text-tertiary",
          bgColor: "bg-tertiary-fixed-dim",
        },
        {
          icon: "wb_sunny",
          title: "Energy Trend",
          description: hasData
            ? (trendValue >= 0
              ? `Your energy is trending up by ${trendValue}%. Keep it up!`
              : `Your energy dipped by ${Math.abs(trendValue)}%. Consider more rest.`)
            : "Start tracking to see your energy trends over time.",
          color: trendValue >= 0 ? "text-primary" : "text-tertiary",
          bgColor: trendValue >= 0 ? "bg-primary-container" : "bg-tertiary-fixed-dim",
        },
      ];

      setWeeklyData(processedWeeklyData);
      setActivityBreakdown(processedBreakdown);
      setInsights(generatedInsights);
      setSummaryStats({
        avgEnergy,
        peak: peakValue,
        low: lowValue,
        trend: trendValue,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StatsClient
      weeklyData={weeklyData}
      monthlyData={[
        { week: "Week 1", value: 50 },
        { week: "Week 2", value: 50 },
        { week: "Week 3", value: 50 },
        { week: "Week 4", value: 50 },
      ]}
      activityBreakdown={activityBreakdown}
      insights={insights}
      summaryStats={summaryStats}
      loading={loading}
    />
  );
}
