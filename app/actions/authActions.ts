"use server";

import { db } from "../../db";
import { users, activities, energyLogs } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { simpleHash } from "../../lib/hash";

// Create demo user with pre-seeded data (fast - just returns existing user)
export async function createDemoUser() {
  try {
    // Check if demo user exists
    const existingDemo = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@energeez.app"))
      .limit(1);
    
    if (existingDemo.length === 0) {
      return { success: false, error: "Demo user not initialized. Please run seeding first." };
    }

    const userId = existingDemo[0].id;

    return {
      success: true,
      user: {
        id: userId,
        email: "demo@energeez.app",
        name: "Demo User",
      },
      message: "Demo user loaded",
    };
  } catch (error) {
    console.error("Failed to load demo user:", error);
    return { success: false, error: "Failed to load demo user" };
  }
}

// Seed demo data - run this ONCE to populate database
export async function seedDemoData() {
  try {
    // Check if demo user exists
    const existingDemo = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@energeez.app"))
      .limit(1);
    
    let userId: number;
    
    if (existingDemo.length > 0) {
      // Already seeded
      return { success: true, message: "Demo data already seeded", alreadyExists: true };
    }

    // Create new demo user
    const [newUser] = await db
      .insert(users)
      .values({
        email: "demo@energeez.app",
        password: simpleHash("demo123"),
        name: "Demo User",
        avatar: null,
        preferences: {},
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });
    userId = newUser.id;

    // Generate realistic demo data
    const demoActivities: {
      categoryId: number;
      title: string;
      duration: number;
      energyImpact: number;
      createdAt: Date;
      aiProcessed: boolean;
      aiData: object;
    }[] = [];

    const categories = [
      { id: 1, name: "Work", impactPerHour: 15, minDuration: 30, maxDuration: 180 },
      { id: 2, name: "Exercise", impactPerHour: 20, minDuration: 30, maxDuration: 90 },
      { id: 3, name: "Meal", impactPerHour: -10, minDuration: 15, maxDuration: 60 },
      { id: 4, name: "Mindfulness", impactPerHour: 18, minDuration: 10, maxDuration: 45 },
      { id: 5, name: "Social", impactPerHour: 8, minDuration: 30, maxDuration: 180 },
      { id: 6, name: "Rest", impactPerHour: -15, minDuration: 30, maxDuration: 480 },
    ];

    const now = new Date();
    const days = 14;

    // Create realistic daily patterns
    for (let day = days; day >= 0; day--) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() - day);
      baseDate.setHours(0, 0, 0, 0);

      const dayOfWeek = baseDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Morning: Mindfulness or Exercise
      if (Math.random() > 0.3) {
        const category = Math.random() > 0.5 ? categories[1] : categories[3]; // Exercise or Mindfulness
        const duration = category.minDuration + Math.floor(Math.random() * (category.maxDuration - category.minDuration + 1) / 10) * 10;
        const durationHours = duration / 60;
        const baseImpact = Math.round(category.impactPerHour * durationHours);
        
        const activityTime = new Date(baseDate);
        activityTime.setHours(6 + Math.floor(Math.random() * 3));
        activityTime.setMinutes(Math.floor(Math.random() * 60));
        
        demoActivities.push({
          categoryId: category.id,
          title: category.name,
          duration: duration,
          energyImpact: baseImpact,
          createdAt: activityTime,
          aiProcessed: true,
          aiData: {
            confidence: 0.75 + Math.random() * 0.2,
            optimalTime: "Morning",
            mlInsights: [`Perfect morning routine activity`],
            categoryMatch: category.name,
          },
        });
      }

      // Mid-morning/Afternoon: Work (less on weekends)
      const workSessions = isWeekend ? (Math.random() > 0.5 ? 1 : 0) : 2 + Math.floor(Math.random() * 2);
      for (let w = 0; w < workSessions; w++) {
        const category = categories[0]; // Work
        const duration = 60 + Math.floor(Math.random() * 12) * 10; // 60-180 mins
        const durationHours = duration / 60;
        const baseImpact = Math.round(category.impactPerHour * durationHours);
        
        const activityTime = new Date(baseDate);
        activityTime.setHours(9 + w * 3 + Math.floor(Math.random() * 2));
        activityTime.setMinutes(Math.floor(Math.random() * 60));
        
        demoActivities.push({
          categoryId: category.id,
          title: category.name,
          duration: duration,
          energyImpact: baseImpact,
          createdAt: activityTime,
          aiProcessed: true,
          aiData: {
            confidence: 0.85 + Math.random() * 0.1,
            optimalTime: "Work hours",
            mlInsights: [`Productive work session`],
            categoryMatch: category.name,
          },
        });
      }

      // Lunch: Meal
      const lunchTime = new Date(baseDate);
      lunchTime.setHours(12 + Math.floor(Math.random() * 2));
      lunchTime.setMinutes(Math.floor(Math.random() * 60));
      demoActivities.push({
        categoryId: 3,
        title: "Lunch",
        duration: 30 + Math.floor(Math.random() * 3) * 10,
        energyImpact: -5 - Math.floor(Math.random() * 5),
        createdAt: lunchTime,
        aiProcessed: true,
        aiData: {
          confidence: 0.8,
          optimalTime: "12:00 PM",
          mlInsights: [`Mid-day energy boost`],
          categoryMatch: "Meal",
        },
      });

      // Afternoon/Evening: Social or Exercise
      if (Math.random() > 0.4) {
        const category = Math.random() > 0.6 ? categories[1] : categories[4]; // Exercise or Social
        const duration = category.minDuration + Math.floor(Math.random() * (category.maxDuration - category.minDuration + 1) / 10) * 10;
        const durationHours = duration / 60;
        const baseImpact = Math.round(category.impactPerHour * durationHours);
        
        const activityTime = new Date(baseDate);
        activityTime.setHours(17 + Math.floor(Math.random() * 4));
        activityTime.setMinutes(Math.floor(Math.random() * 60));
        
        demoActivities.push({
          categoryId: category.id,
          title: category.name,
          duration: duration,
          energyImpact: baseImpact,
          createdAt: activityTime,
          aiProcessed: true,
          aiData: {
            confidence: 0.8 + Math.random() * 0.15,
            optimalTime: "Evening",
            mlInsights: [`Evening wellness activity`],
            categoryMatch: category.name,
          },
        });
      }

      // Evening meal
      const dinnerTime = new Date(baseDate);
      dinnerTime.setHours(18 + Math.floor(Math.random() * 3));
      dinnerTime.setMinutes(Math.floor(Math.random() * 60));
      demoActivities.push({
        categoryId: 3,
        title: "Dinner",
        duration: 30 + Math.floor(Math.random() * 4) * 10,
        energyImpact: -6 - Math.floor(Math.random() * 4),
        createdAt: dinnerTime,
        aiProcessed: true,
        aiData: {
          confidence: 0.8,
          optimalTime: "Evening",
          mlInsights: [`Evening nourishment`],
          categoryMatch: "Meal",
        },
      });

      // Sleep/Rest
      const sleepTime = new Date(baseDate);
      sleepTime.setHours(22 + Math.floor(Math.random() * 3));
      sleepTime.setMinutes(Math.floor(Math.random() * 60));
      demoActivities.push({
        categoryId: 6,
        title: "Sleep",
        duration: 360 + Math.floor(Math.random() * 12) * 10, // 6-8 hours
        energyImpact: -40 - Math.floor(Math.random() * 20),
        createdAt: sleepTime,
        aiProcessed: true,
        aiData: {
          confidence: 0.95,
          optimalTime: "Night",
          mlInsights: [`Essential recovery period`],
          categoryMatch: "Rest",
        },
      });
    }

    // Insert activities
    for (const activity of demoActivities) {
      await db.insert(activities).values({
        userId: userId,
        categoryId: activity.categoryId,
        title: activity.title,
        duration: activity.duration,
        energyImpact: activity.energyImpact,
        createdAt: activity.createdAt,
        aiProcessed: activity.aiProcessed,
        aiData: activity.aiData,
      });
    }

    // Create energy logs with realistic patterns
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - i);
      const dayOfWeek = logDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Weekend vs weekday patterns
      const baseEnergy = isWeekend ? 70 : 55;
      const morningEnergy = Math.round(baseEnergy + Math.random() * 15);
      const afternoonEnergy = Math.round(baseEnergy + 10 + Math.random() * 15);
      const eveningEnergy = Math.round(baseEnergy - 5 + Math.random() * 15);
      
      await db.insert(energyLogs).values({
        userId: userId,
        date: logDate,
        morningEnergy: Math.min(100, morningEnergy),
        afternoonEnergy: Math.min(100, afternoonEnergy),
        eveningEnergy: Math.min(100, Math.max(20, eveningEnergy)),
        avgEnergy: Math.round((morningEnergy + afternoonEnergy + eveningEnergy) / 3),
        peakTime: afternoonEnergy > morningEnergy && afternoonEnergy > eveningEnergy ? "Afternoon" 
                 : morningEnergy > eveningEnergy ? "Morning" 
                 : "Evening",
        notes: `Energy levels for ${daysOfWeek[logDate.getDay()]}`,
      });
    }

    return {
      success: true,
      message: `Seeded ${demoActivities.length} activities for demo user`,
      activityCount: demoActivities.length,
    };
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    return { success: false, error: "Failed to seed demo data" };
  }
}

// Register new user
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = simpleHash(data.password);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        avatar: null,
        preferences: {},
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    revalidatePath("/auth");

    return {
      success: true,
      user: newUser,
      message: "Registration successful! Please login.",
    };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

// Login user
export async function loginUser(data: {
  email: string;
  password: string;
}) {
  try {
    // Hash input password
    const hashedPassword = simpleHash(data.password);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      return { success: false, error: "Email not found" };
    }

    // Check password
    if (user.password !== hashedPassword) {
      return { success: false, error: "Invalid password" };
    }

    // Return user data (without password)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Failed to login:", error);
    return { success: false, error: "Login failed" };
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        preferences: users.preferences,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { success: false, error: "Failed to get user" };
  }
}

// Get current user from localStorage (client-side helper info)
export async function checkUserExists(email: string) {
  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return { success: true, exists: !!user };
  } catch (error) {
    console.error("Failed to check user:", error);
    return { success: false, error: "Failed to check user" };
  }
}
