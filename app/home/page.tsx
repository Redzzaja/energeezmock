"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserActivities, getEnergyStats, getCategories } from "../actions/activityActions";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyEnergy, setDailyEnergy] = useState(0);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [overloadAmount, setOverloadAmount] = useState(0);
  const [peakTime, setPeakTime] = useState("10:00 AM");
  const [weeklyTrend, setWeeklyTrend] = useState<{ day: string; value: number }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState({
    vsLastWeek: 0,
    activityCount: 0,
    avgEnergy: 0,
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
      const [activitiesResult, statsResult, categoriesResult] = await Promise.all([
        getUserActivities(userId),
        getEnergyStats(userId),
        getCategories(),
      ]);

      // Get real-time calculated energy from today's activities
      const currentEnergy = statsResult.success && statsResult.stats?.currentEnergy 
        ? statsResult.stats.currentEnergy 
        : 0; // Base energy for new users
      
      const overloadStatus = statsResult.success && statsResult.stats?.isOverloaded 
        ? statsResult.stats.isOverloaded 
        : false;
      
      const overloadAmt = statsResult.success && statsResult.stats?.overloadAmount 
        ? statsResult.stats.overloadAmount 
        : 0;
      
      const peak = statsResult.success && statsResult.stats?.peakTime 
        ? statsResult.stats.peakTime 
        : "10:00 AM";

      // Transform activities for the UI
      const todayActivities = activitiesResult.success && activitiesResult.activities
        ? activitiesResult.activities.slice(0, 4).map((item: any) => {
            const activity = item.activity;
            const category = item.category;
            const isPositive = activity.energyImpact > 0;
            
            return {
              id: activity.id,
              icon: category?.icon || "circle",
              title: activity.title,
              subtitle: `${activity.duration} mins • ${category?.name || "Activity"}`,
              impact: activity.energyImpact,
              impactColor: isPositive 
                ? "bg-secondary-fixed-dim/30 text-on-secondary-container"
                : "bg-tertiary-fixed-dim/20 text-on-tertiary-container",
            };
          })
        : [];

      // Process weekly trend data
      const weeklyData = statsResult.success && statsResult.stats?.weeklyData && statsResult.stats.weeklyData.length > 0
        ? statsResult.stats.weeklyData
        : []; // Empty for new users

      // Calculate quick stats from real data
      const activityCount = activitiesResult.success && activitiesResult.activities
        ? activitiesResult.activities.length
        : 0;

      // Calculate average from weekly trend - default 0 for new users
      let avgEnergy = 0;
      if (statsResult.success && statsResult.stats?.weeklyData && statsResult.stats.weeklyData.length > 0) {
        const validData = statsResult.stats.weeklyData.filter((d: any) => d.value !== null);
        if (validData.length > 0) {
          avgEnergy = Math.round(
            validData.reduce((sum: number, d: any) => sum + (d.value ?? 0), 0) / validData.length
          );
        }
      }

      // Calculate vs last week trend
      let vsLastWeek = 0;
      if (weeklyData.length > 0) {
        const midPoint = Math.floor(weeklyData.length / 2);
        const firstHalf = weeklyData.slice(0, midPoint);
        const secondHalf = weeklyData.slice(midPoint);
        
        const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / (firstHalf.length || 1);
        const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / (secondHalf.length || 1);
        
        vsLastWeek = firstHalfAvg > 0 
          ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
          : 0;
      }

      setDailyEnergy(currentEnergy);
      setIsOverloaded(overloadStatus);
      setOverloadAmount(overloadAmt);
      setPeakTime(peak);
      setWeeklyTrend(weeklyData);
      setActivities(todayActivities);
      setQuickStats({
        vsLastWeek,
        activityCount,
        avgEnergy,
      });
    } catch (error) {
      console.error("Failed to load home data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeClient
      dailyEnergy={Math.round(dailyEnergy)}
      isOverloaded={isOverloaded}
      overloadAmount={overloadAmount}
      peakTime={peakTime}
      weeklyTrend={weeklyTrend}
      activities={activities}
      quickStats={quickStats}
      loading={loading}
    />
  );
}
