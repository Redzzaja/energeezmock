import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// Simple hash function (same as in authActions.ts)
function simpleHash(password: string): string {
  return Buffer.from(password + "energeez-salt").toString("base64");
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // 1. Create demo user
    console.log("👤 Creating demo user...");
    const demoPassword = simpleHash("123456");
    const [demoUser] = await db
      .insert(schema.users)
      .values({
        email: "demo@energeez.app",
        password: demoPassword,
        name: "John Doe",
        preferences: {
          theme: "light",
          notifications: true,
          language: "en",
        },
      })
      .onConflictDoNothing({ target: schema.users.email })
      .returning();
    
    if (!demoUser) {
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, "demo@energeez.app"),
      });
      if (existingUser) {
        console.log("✅ Demo user already exists, updating password...\n");
        // Update password for existing demo user
        await db
          .update(schema.users)
          .set({ password: demoPassword })
          .where(eq(schema.users.email, "demo@energeez.app"));
        console.log("✅ Demo user password updated to: 123456\n");
      }
    } else {
      console.log("✅ Demo user created:\n", demoUser, "\n");
    }

    const userId = demoUser?.id || 1;

    // 2. Seed categories
    console.log("📂 Seeding categories...");
    const categories = [
      {
        name: "Work",
        icon: "work",
        color: "bg-primary-container text-on-primary-container",
        description: "Tasks and projects",
        defaultEnergyImpact: -20,
      },
      {
        name: "Exercise",
        icon: "directions_run",
        color: "bg-secondary-container text-on-secondary-container",
        description: "Cardio and strength training",
        defaultEnergyImpact: 30,
      },
      {
        name: "Meal",
        icon: "restaurant",
        color: "bg-tertiary-fixed-dim text-on-tertiary-container",
        description: "Breakfast, lunch, dinner",
        defaultEnergyImpact: 15,
      },
      {
        name: "Mindfulness",
        icon: "self_improvement",
        color: "bg-surface-container-high text-on-surface",
        description: "Meditation and breathing",
        defaultEnergyImpact: 25,
      },
      {
        name: "Social",
        icon: "social_distance",
        color: "bg-secondary-fixed text-on-secondary-container",
        description: "Meetings and hangouts",
        defaultEnergyImpact: 10,
      },
      {
        name: "Rest",
        icon: "bedtime",
        color: "bg-primary-fixed text-on-primary-fixed",
        description: "Sleep and relaxation",
        defaultEnergyImpact: 40,
      },
    ];

    const seededCategories = await db
      .insert(schema.categories)
      .values(categories)
      .onConflictDoNothing({ target: schema.categories.name })
      .returning();
    
    console.log(`✅ Seeded ${seededCategories.length} categories\n`);

    // Get category IDs for later use
    const workCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.name, "Work"),
    });
    const exerciseCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.name, "Exercise"),
    });
    const mealCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.name, "Meal"),
    });
    const mindfulnessCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.name, "Mindfulness"),
    });

    // 3. Seed activities with AI data
    console.log("📝 Seeding activities...");
    const activities = [
      {
        userId,
        categoryId: workCategory?.id || 1,
        title: "Deep Work Session",
        description: "High focus coding session",
        duration: 120,
        energyImpact: 25,
        notes: "Very productive, felt energized initially",
        aiProcessed: true,
        aiData: {
          confidence: 0.92,
          optimalTime: "09:00 AM",
          mlInsights: [
            "High correlation with morning routine",
            "2 hours is optimal for your current energy level",
            "Matches your productivity pattern profile",
          ],
        },
      },
      {
        userId,
        categoryId: exerciseCategory?.id || 2,
        title: "Morning Run",
        description: "5K cardio run",
        duration: 45,
        energyImpact: 30,
        notes: "Felt great after!",
        aiProcessed: true,
        aiData: {
          confidence: 0.88,
          optimalTime: "07:00 AM",
          mlInsights: [
            "Peak performance during morning cardio",
            "45min duration aligns with your recovery pattern",
            "Boosted energy for 4 hours post-activity",
          ],
        },
      },
      {
        userId,
        categoryId: mealCategory?.id || 3,
        title: "Healthy Lunch",
        description: "Balanced meal with protein",
        duration: 30,
        energyImpact: -15,
        notes: "Rest and recovery",
        aiProcessed: true,
        aiData: {
          confidence: 0.75,
          optimalTime: "12:30 PM",
          mlInsights: [
            "Nutrient timing optimal for afternoon energy",
            "30min break sufficient for digestion",
          ],
        },
      },
      {
        userId,
        categoryId: mindfulnessCategory?.id || 4,
        title: "Evening Meditation",
        description: "Guided breathing session",
        duration: 20,
        energyImpact: 20,
        notes: "Very relaxing",
        aiProcessed: true,
        aiData: {
          confidence: 0.85,
          optimalTime: "09:00 PM",
          mlInsights: [
            "Optimal for evening wind-down",
            "20min duration improves sleep quality",
            "Recommended 3x per week",
          ],
        },
      },
      {
        userId,
        categoryId: workCategory?.id || 1,
        title: "Team Meeting",
        description: "Weekly standup",
        duration: 60,
        energyImpact: 15,
        notes: "Moderate productivity",
        aiProcessed: true,
        aiData: {
          confidence: 0.70,
          optimalTime: "10:00 AM",
          mlInsights: [
            "Social interaction pattern matches profile",
            "Morning slot minimizes energy drain",
          ],
        },
      },
    ];

    const seededActivities = await db
      .insert(schema.activities)
      .values(activities)
      .returning();
    
    console.log(`✅ Seeded ${seededActivities.length} activities\n`);

    // 4. Seed energy logs for the past 7 days
    console.log("📊 Seeding energy logs...");
    const today = new Date();
    const energyLogs = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const morningEnergy = Math.floor(Math.random() * 30) + 60; // 60-90
      const afternoonEnergy = Math.floor(Math.random() * 25) + 55; // 55-80
      const eveningEnergy = Math.floor(Math.random() * 20) + 50; // 50-70
      const energies = [morningEnergy, afternoonEnergy, eveningEnergy];
      const avgEnergy = energies.reduce((a, b) => a + b, 0) / 3;
      
      const maxEnergy = Math.max(...energies);
      let peakTime = "Morning";
      if (maxEnergy === afternoonEnergy) peakTime = "Afternoon";
      else if (maxEnergy === eveningEnergy) peakTime = "Evening";

      energyLogs.push({
        userId,
        date,
        morningEnergy,
        afternoonEnergy,
        eveningEnergy,
        avgEnergy,
        peakTime,
        factors: ["sleep", "exercise", "workload"].slice(0, Math.floor(Math.random() * 3) + 1),
        notes: i === 0 ? "Feeling good today!" : undefined,
      });
    }

    const seededLogs = await db
      .insert(schema.energyLogs)
      .values(energyLogs)
      .onConflictDoNothing()
      .returning();
    
    console.log(`✅ Seeded ${seededLogs.length} energy logs\n`);

    // 5. Seed ML predictions
    console.log("🤖 Seeding ML predictions...");
    const predictions = [
      {
        userId,
        predictionType: "energy_forecast",
        prediction: {
          tomorrowMorning: 78,
          tomorrowAfternoon: 72,
          tomorrowEvening: 65,
          trend: "stable",
        },
        confidence: 0.89,
        modelVersion: "energeez-v2.4-turbo",
      },
      {
        userId,
        predictionType: "optimal_time",
        prediction: {
          bestWorkTime: "08:00 AM - 11:00 AM",
          bestExerciseTime: "06:00 AM - 08:00 AM",
          bestRestTime: "09:00 PM - 10:00 PM",
        },
        confidence: 0.85,
        modelVersion: "energeez-v2.4-turbo",
      },
      {
        userId,
        predictionType: "activity_recommendation",
        prediction: {
          recommendedActivity: "Morning Run",
          reason: "Matches your energy peak pattern",
          duration: 45,
          expectedEnergyBoost: 30,
        },
        confidence: 0.91,
        modelVersion: "energeez-v2.4-turbo",
      },
    ];

    const seededPredictions = await db
      .insert(schema.mlPredictions)
      .values(predictions)
      .onConflictDoNothing()
      .returning();
    
    console.log(`✅ Seeded ${seededPredictions.length} ML predictions\n`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n👤 Demo Account:");
    console.log("   Email: demo@energeez.app");
    console.log("   Activities: 5 with AI analysis");
    console.log("   Energy Logs: 7 days of data");
    console.log("   ML Predictions: 3 active models");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seed
seed();