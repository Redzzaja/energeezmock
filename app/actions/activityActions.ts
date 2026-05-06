"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "../../db";
import { activities, categories, energyLogs, mlPredictions } from "../../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Cached database queries
const getCachedUserActivities = unstable_cache(
  async (userId: number) => {
    return await db
      .select({
        activity: activities,
        category: categories,
      })
      .from(activities)
      .leftJoin(categories, eq(activities.categoryId, categories.id))
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(20);
  },
  ["user-activities"],
  { revalidate: 60, tags: ["activities"] } // Cache for 60 seconds
);

const getCachedEnergyStats = unstable_cache(
  async (userId: number) => {
    // Get weekly energy data (last 7 days)
    const weeklyData = await db
      .select({
        date: energyLogs.date,
        avgEnergy: energyLogs.avgEnergy,
      })
      .from(energyLogs)
      .where(eq(energyLogs.userId, userId))
      .orderBy(desc(energyLogs.date))
      .limit(7);

    // Get activity breakdown (top 5 categories)
    const breakdown = await db
      .select({
        categoryName: categories.name,
        count: sql<number>`count(*)::int`,
        avgImpact: sql<number>`avg(${activities.energyImpact})::float`,
      })
      .from(activities)
      .leftJoin(categories, eq(activities.categoryId, categories.id))
      .where(eq(activities.userId, userId))
      .groupBy(categories.name)
      .limit(5);

    return { weeklyData, breakdown };
  },
  ["energy-stats"],
  { revalidate: 60, tags: ["stats"] } // Cache for 60 seconds
);

const getCachedCategories = unstable_cache(
  async () => {
    return await db.select().from(categories);
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] } // Cache for 1 hour (categories rarely change)
);

// AI Processing simulation function
export async function processActivityWithAI(
  activityData: {
    title: string;
    category: string;
    duration: number;
    notes?: string;
  }
) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Mock AI prediction based on activity type - IMPACT SCALED BY DURATION
  // Work/Exercise/Mindfulness/Social = INCREASE energy (active/productive)
  // Meal/Rest = DECREASE energy (resting/idle)
  // Impact is calculated per hour and scaled by duration
  const categoryPredictions: Record<string, { impactPerHour: number; confidence: number }> = {
    "Work": { impactPerHour: 15, confidence: 0.92 },
    "Exercise": { impactPerHour: 20, confidence: 0.88 },
    "Meal": { impactPerHour: -10, confidence: 0.75 },
    "Mindfulness": { impactPerHour: 18, confidence: 0.85 },
    "Social": { impactPerHour: 8, confidence: 0.70 },
    "Rest": { impactPerHour: -15, confidence: 0.95 },
  };

  const prediction = categoryPredictions[activityData.category] || {
    impactPerHour: 0,
    confidence: 0.5,
  };

  // Calculate impact based on duration (scaled per hour)
  const durationHours = activityData.duration / 60;
  const baseImpact = Math.round(prediction.impactPerHour * durationHours);
  
  // Add some randomness to make it feel more AI-like (smaller variance for longer activities)
  // But ensure the sign doesn't flip (Rest should stay negative, Work should stay positive)
  const randomVariance = Math.max(1, Math.round(3 / Math.sqrt(durationHours)));
  let randomizedImpact = baseImpact + (Math.random() * randomVariance * 2 - randomVariance);
  
  // Prevent sign flip for predictable categories
  if (baseImpact < 0 && randomizedImpact > 0) {
    randomizedImpact = -Math.abs(randomizedImpact); // Force negative for Rest/Meal
  } else if (baseImpact > 0 && randomizedImpact < 0) {
    randomizedImpact = Math.abs(randomizedImpact); // Force positive for Work/Exercise/etc
  }
  
  // Ensure minimum impact for very short activities
  if (Math.abs(randomizedImpact) < 2) {
    randomizedImpact = baseImpact > 0 ? 2 : -2;
  }
  
  return {
    predictedEnergyImpact: Math.round(randomizedImpact),
    confidence: prediction.confidence,
    optimalTime: ["08:00 AM", "02:00 PM", "06:00 PM"][Math.floor(Math.random() * 3)],
    categoryMatch: activityData.category,
    mlInsights: [
      `Energy impact scales with duration: ${Math.round(Math.abs(baseImpact))}% for ${activityData.duration}min`,
      `${activityData.duration}min ${activityData.category.toLowerCase()} aligns with your productivity pattern`,
      baseImpact > 0 
        ? `This activity boosts your daily productivity score`
        : `This recovery period helps balance your energy`,
    ],
  };
}

// Create activity
export async function createActivity(data: {
  userId: number;
  categoryId: number;
  title: string;
  description?: string;
  duration: number;
  energyImpact: number;
  notes?: string;
  aiProcessed?: boolean;
  aiData?: object;
}) {
  try {
    const [activity] = await db
      .insert(activities)
      .values({
        userId: data.userId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        duration: data.duration,
        energyImpact: data.energyImpact,
        notes: data.notes,
        aiProcessed: data.aiProcessed || false,
        aiData: data.aiData || {},
      })
      .returning();

    // Revalidate cache
    revalidatePath("/home");
    revalidatePath("/stats");
    
    return { success: true, activity };
  } catch (error) {
    console.error("Failed to create activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}

// Get user's activities (cached)
export async function getUserActivities(userId: number) {
  try {
    const userActivities = await getCachedUserActivities(userId);
    return { success: true, activities: userActivities };
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

// Get activity by ID
export async function getActivityById(activityId: number) {
  try {
    const [activity] = await db
      .select({
        activity: activities,
        category: categories,
      })
      .from(activities)
      .leftJoin(categories, eq(activities.categoryId, categories.id))
      .where(eq(activities.id, activityId));

    if (!activity) {
      return { success: false, error: "Activity not found" };
    }

    return { success: true, activity };
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return { success: false, error: "Failed to fetch activity" };
  }
}

// Update activity
export async function updateActivity(
  activityId: number,
  data: {
    title?: string;
    description?: string;
    duration?: number;
    energyImpact?: number;
    notes?: string;
    completed?: boolean;
  }
) {
  try {
    const [activity] = await db
      .update(activities)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    revalidatePath("/home");
    revalidatePath("/stats");

    return { success: true, activity };
  } catch (error) {
    console.error("Failed to update activity:", error);
    return { success: false, error: "Failed to update activity" };
  }
}

// Delete activity
export async function deleteActivity(activityId: number) {
  try {
    await db.delete(activities).where(eq(activities.id, activityId));

    revalidatePath("/home");
    revalidatePath("/stats");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return { success: false, error: "Failed to delete activity" };
  }
}

// Get or create default categories (cached)
export async function getCategories() {
  try {
    const existingCategories = await getCachedCategories();
    
    if (existingCategories.length > 0) {
      return { success: true, categories: existingCategories };
    }

    // Seed default categories if none exist
    // Work/Exercise/Mindfulness/Social = INCREASE energy (active/productive)
    // Meal/Rest = DECREASE energy (resting/idle)
    // Note: defaultEnergyImpact is per hour rate, actual impact calculated dynamically based on duration
    const defaultCategories = [
      {
        name: "Work",
        icon: "work",
        color: "bg-primary-container text-on-primary-container",
        description: "Tasks and projects",
        defaultEnergyImpact: 15,
      },
      {
        name: "Exercise",
        icon: "directions_run",
        color: "bg-secondary-container text-on-secondary-container",
        description: "Cardio and strength training",
        defaultEnergyImpact: 20,
      },
      {
        name: "Meal",
        icon: "restaurant",
        color: "bg-tertiary-fixed-dim text-on-tertiary-container",
        description: "Breakfast, lunch, dinner",
        defaultEnergyImpact: -10,
      },
      {
        name: "Mindfulness",
        icon: "self_improvement",
        color: "bg-surface-container-high text-on-surface",
        description: "Meditation and breathing",
        defaultEnergyImpact: 18,
      },
      {
        name: "Social",
        icon: "social_distance",
        color: "bg-secondary-fixed text-on-secondary-container",
        description: "Meetings and hangouts",
        defaultEnergyImpact: 8,
      },
      {
        name: "Rest",
        icon: "bedtime",
        color: "bg-primary-fixed text-on-primary-fixed",
        description: "Sleep and relaxation",
        defaultEnergyImpact: -15,
      },
    ];

    const newCategories = await db
      .insert(categories)
      .values(defaultCategories)
      .returning();

    return { success: true, categories: newCategories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false, error: "Failed to get categories" };
  }
}

// Calculate daily energy from today's activities
function calculateDailyEnergyFromActivities(
  activitiesList: { energyImpact: number | null; createdAt: Date | null }[],
  baseEnergy: number = 0
) {
  // Sum all energy impacts from today
  const totalImpact = activitiesList.reduce((sum, activity) => {
    return sum + (activity.energyImpact || 0);
  }, 0);

  // Calculate raw energy (base + total impact)
  const rawEnergy = baseEnergy + totalImpact;
  const isOverloaded = rawEnergy > 100;
  
  // Cap at 100 for display, but track overload
  const currentEnergy = Math.max(0, Math.min(100, rawEnergy));

  return { currentEnergy, isOverloaded, rawEnergy };
}

// Calculate peak time from activities (time with highest positive impact)
function calculatePeakTime(
  activitiesList: { energyImpact: number | null; createdAt: Date | null }[]
) {
  if (activitiesList.length === 0) return "10:00 AM";

  // Group by hour and find hour with highest positive impact
  const hourlyImpact: Record<number, number> = {};

  activitiesList.forEach((activity) => {
    if (!activity.createdAt) return;
    const hour = new Date(activity.createdAt).getHours();
    hourlyImpact[hour] = (hourlyImpact[hour] || 0) + (activity.energyImpact || 0);
  });

  // Find hour with highest impact
  let bestHour = 10; // Default 10 AM
  let maxImpact = -Infinity;

  Object.entries(hourlyImpact).forEach(([hour, impact]) => {
    if (impact > maxImpact) {
      maxImpact = impact;
      bestHour = parseInt(hour);
    }
  });

  // Format time
  const period = bestHour >= 12 ? "PM" : "AM";
  const displayHour = bestHour > 12 ? bestHour - 12 : bestHour === 0 ? 12 : bestHour;
  return `${displayHour}:00 ${period}`;
}

// Generate 7-day trend from activities (grouped by day)
async function generateWeeklyTrendFromActivities(userId: number) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Get all activities from last 7 days
  const userActivities = await db
    .select({
      energyImpact: activities.energyImpact,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .where(
      and(
        eq(activities.userId, userId),
        sql`${activities.createdAt} >= ${sevenDaysAgo.toISOString()}`
      )
    );

  // Group by day
  const dailyData: Record<string, { totalImpact: number; count: number }> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    dailyData[dayName] = { totalImpact: 0, count: 0 };
  }

  // Sum impacts by day
  userActivities.forEach((activity) => {
    if (!activity.createdAt) return;
    const date = new Date(activity.createdAt);
    const dayName = days[date.getDay()];
    if (dailyData[dayName]) {
      dailyData[dayName].totalImpact += activity.energyImpact || 0;
      dailyData[dayName].count += 1;
    }
  });

  // Calculate energy for each day (base 50 + impact)
  return Object.entries(dailyData).map(([day, data]) => ({
    day,
    value: Math.round(Math.max(0, Math.min(100, 50 + data.totalImpact))),
  }));
}

// Cached energy stats calculation from activities
const getCachedEnergyStatsCalculated = unstable_cache(
  async (userId: number) => {
    // Get today's activities for current energy calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await db
      .select({
        energyImpact: activities.energyImpact,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          sql`${activities.createdAt} >= ${today.toISOString()}`
        )
      );

    // Calculate current daily energy
    const energyResult = calculateDailyEnergyFromActivities(todayActivities);
    const { currentEnergy, isOverloaded, rawEnergy } = energyResult;
    const peakTime = calculatePeakTime(todayActivities);

    // Generate 7-day trend from activities
    const weeklyData = await generateWeeklyTrendFromActivities(userId);

    // Get activity breakdown (top 5 categories)
    const breakdown = await db
      .select({
        categoryName: categories.name,
        count: sql<number>`count(*)::int`,
        avgImpact: sql<number>`avg(${activities.energyImpact})::float`,
      })
      .from(activities)
      .leftJoin(categories, eq(activities.categoryId, categories.id))
      .where(eq(activities.userId, userId))
      .groupBy(categories.name)
      .limit(5);

    return {
      currentEnergy,
      isOverloaded,
      overloadAmount: isOverloaded ? Math.round(rawEnergy - 100) : 0,
      peakTime,
      weeklyData,
      activityBreakdown: breakdown,
    };
  },
  ["energy-stats-calculated"],
  { revalidate: 5, tags: ["energy-stats"] } // 5 second cache
);

// Get energy stats calculated from activities (with short cache for performance)
export async function getEnergyStats(userId: number) {
  try {
    const stats = await getCachedEnergyStatsCalculated(userId);
    
    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Failed to get energy stats:", error);
    return { success: false, error: "Failed to get energy stats" };
  }
}

// Create or update daily energy log
export async function logDailyEnergy(data: {
  userId: number;
  date: Date;
  morningEnergy?: number;
  afternoonEnergy?: number;
  eveningEnergy?: number;
  notes?: string;
}) {
  try {
    // Calculate average
    const energies = [data.morningEnergy, data.afternoonEnergy, data.eveningEnergy].filter(
      (e): e is number => e !== undefined
    );
    const avgEnergy = energies.length > 0 
      ? energies.reduce((a, b) => a + b, 0) / energies.length 
      : null;

    // Determine peak time
    let peakTime = null;
    if (data.morningEnergy && data.afternoonEnergy && data.eveningEnergy) {
      const maxEnergy = Math.max(data.morningEnergy, data.afternoonEnergy, data.eveningEnergy);
      if (maxEnergy === data.morningEnergy) peakTime = "Morning";
      else if (maxEnergy === data.afternoonEnergy) peakTime = "Afternoon";
      else peakTime = "Evening";
    }

    // Check if log exists for today
    const existingLog = await db
      .select()
      .from(energyLogs)
      .where(
        and(
          eq(energyLogs.userId, data.userId),
          eq(energyLogs.date, data.date)
        )
      )
      .limit(1);

    let result;
    if (existingLog.length > 0) {
      // Update existing
      [result] = await db
        .update(energyLogs)
        .set({
          ...data,
          avgEnergy,
          peakTime,
          updatedAt: new Date(),
        })
        .where(eq(energyLogs.id, existingLog[0].id))
        .returning();
    } else {
      // Create new
      [result] = await db
        .insert(energyLogs)
        .values({
          ...data,
          avgEnergy,
          peakTime,
        })
        .returning();
    }

    revalidatePath("/home");
    revalidatePath("/stats");

    return { success: true, log: result };
  } catch (error) {
    console.error("Failed to log daily energy:", error);
    return { success: false, error: "Failed to log daily energy" };
  }
}
