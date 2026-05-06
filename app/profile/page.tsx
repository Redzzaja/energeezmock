"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import PageLayout from "../components/PageLayout";
import { getUserActivities, getEnergyStats } from "../actions/activityActions";

const settingsItems = [
  {
    icon: "notifications",
    label: "Notifications",
    description: "Daily reminders & alerts",
    hasToggle: true,
  },
  {
    icon: "dark_mode",
    label: "Dark Mode",
    description: "Toggle theme",
    hasToggle: true,
  },
  {
    icon: "language",
    label: "Language",
    description: "English",
    hasArrow: true,
  },
  {
    icon: "security",
    label: "Privacy",
    description: "Manage your data",
    hasArrow: true,
  },
];

const accountItems = [
  {
    icon: "edit",
    label: "Edit Profile",
    description: "Update your information",
    hasArrow: true,
  },
  {
    icon: "password",
    label: "Change Password",
    description: "Update security settings",
    hasArrow: true,
  },
  {
    icon: "sync",
    label: "Export Data",
    description: "Download your activity history",
    hasArrow: true,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [stats, setStats] = useState({
    activityCount: 0,
    avgEnergy: 75,
    dayStreak: 0,
    workouts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Load user stats from server
      loadUserStats(parsedUser.id);
    } else {
      // No user logged in, redirect to auth
      router.push("/auth");
    }
  }, [router]);

  const loadUserStats = async (userId: number) => {
    try {
      const [activitiesResult, statsResult] = await Promise.all([
        getUserActivities(userId),
        getEnergyStats(userId),
      ]);

      const activityCount = activitiesResult.success && activitiesResult.activities
        ? activitiesResult.activities.length
        : 0;

      const avgEnergy = statsResult.success && statsResult.stats?.weeklyData
        ? Math.round(
            statsResult.stats.weeklyData.reduce((sum: number, d: any) => sum + (d.value ?? 0), 0) /
              (statsResult.stats.weeklyData.length || 1)
          )
        : 75;

      // Count workouts (exercise category)
      const workouts = activitiesResult.success && activitiesResult.activities
        ? activitiesResult.activities.filter((a: any) => 
            a.category?.name?.toLowerCase().includes("exercise") ||
            a.category?.name?.toLowerCase().includes("workout")
          ).length
        : 0;

      setStats({
        activityCount,
        avgEnergy,
        dayStreak: 0, // Would need historical data to calculate
        workouts,
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/auth");
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-surface relative md:pb-0 pb-20">
        {/* Mobile TopAppBar */}
        <div className="md:hidden">
          <TopAppBar showSettings={false} title="Profile" />
        </div>

        <main className="px-5 pt-[72px] md:pt-0 pb-6">
          {/* Header - Desktop */}
          <div className="hidden md:flex md:items-center md:justify-between md:mb-8">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface">Profile</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Manage your account settings and preferences.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Stats */}
            <div className="space-y-6">
              {/* Profile Header */}
              <section className="animate-fade-in-up">
                <GlassCard className="flex flex-col items-center py-8 md:p-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary-fixed mb-4 bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] md:text-[64px] text-secondary">
                      person
                    </span>
                  </div>
                  <h2 className="font-h2 text-h2 text-on-surface">
                    {isLoading ? "Loading..." : user?.name || "User"}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    {user?.email || ""}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button className="px-5 py-2 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors">
                      Edit Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </GlassCard>
              </section>

              {/* Stats Overview */}
              <section className="animate-fade-in-up stagger-1">
                <h3 className="font-h3 text-h3 text-on-surface mb-4 hidden md:block">
                  Your Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Activities", value: stats.activityCount.toString(), icon: "check_circle", color: "text-primary" },
                    { label: "Avg Energy", value: `${stats.avgEnergy}%`, icon: "battery_full", color: "text-tertiary" },
                    { label: "Workouts", value: stats.workouts.toString(), icon: "fitness_center", color: "text-secondary" },
                    { label: "Day Streak", value: stats.dayStreak.toString(), icon: "local_fire_department", color: "text-secondary" },
                  ].map((item, index) => (
                    <GlassCard
                      key={item.label}
                      className="text-center py-4 md:p-5"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className={`material-symbols-outlined text-[28px] ${item.color} mb-2`}>
                        {item.icon}
                      </span>
                      <p className="font-h2 text-h2 text-on-surface">{item.value}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {item.label}
                      </p>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Sign Out - Mobile */}
              <section className="md:hidden animate-fade-in-up stagger-4">
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full py-4 rounded-xl border border-error text-error font-label-md text-label-md hover:bg-error hover:text-on-error transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </section>
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Settings */}
              <section className="animate-fade-in-up stagger-2">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settingsItems.map((item, index) => (
                    <GlassCard
                      key={item.label}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[24px] text-on-primary-container">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-label-md text-on-surface">
                          {item.label}
                        </h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {item.description}
                        </p>
                      </div>
                      {item.hasToggle && (
                        <button
                          onClick={() => {
                            if (item.label === "Notifications") {
                              setNotificationsEnabled(!notificationsEnabled);
                            } else if (item.label === "Dark Mode") {
                              setDarkModeEnabled(!darkModeEnabled);
                            }
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            (item.label === "Notifications" && notificationsEnabled) ||
                            (item.label === "Dark Mode" && darkModeEnabled)
                              ? "bg-secondary"
                              : "bg-surface-variant"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                              (item.label === "Notifications" && notificationsEnabled) ||
                              (item.label === "Dark Mode" && darkModeEnabled)
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          ></div>
                        </button>
                      )}
                      {item.hasArrow && (
                        <span className="material-symbols-outlined text-on-surface-variant">
                          chevron_right
                        </span>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Account */}
              <section className="animate-fade-in-up stagger-3">
                <h3 className="font-h3 text-h3 text-on-surface mb-4">Account</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accountItems.map((item, index) => (
                    <GlassCard
                      key={item.label}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container"
                      >
                        <span className="material-symbols-outlined text-[24px] text-on-secondary-container">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-label-md text-on-surface">
                          {item.label}
                        </h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {item.description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">
                        chevron_right
                      </span>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Danger Zone - Desktop */}
              <section className="hidden md:block animate-fade-in-up stagger-4">
                <h3 className="font-h3 text-h3 text-error mb-4">Danger Zone</h3>
                <GlassCard className="p-6 border border-error/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container"
                      >
                        <span className="material-symbols-outlined text-[24px] text-on-error-container">delete</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface">
                          Delete Account
                        </h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-error text-error font-label-md text-label-md hover:bg-error hover:text-on-error transition-colors">
                      Delete
                    </button>
                  </div>
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
