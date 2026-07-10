import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { simpleHash } from "../lib/hash";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log("🌱 Starting database seeding with diverse data...\n");

  try {
    // 1. Create demo user
    console.log("👤 Creating demo user...");
    const demoPassword = simpleHash("123456");
    const [demoUser] = await db
      .insert(schema.users)
      .values({
        email: "demo@energeez.app",
        password: demoPassword,
        name: "Alex Morgan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        preferences: {
          theme: "light",
          notifications: true,
          language: "en",
          energyGoal: 75,
          preferredReminderTime: "08:00",
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

    // 2. Seed categories (8 diverse categories)
    console.log("📂 Seeding categories...");
    const categoryDefs = [
      {
        name: "Deep Work",
        icon: "laptop_chromebook",
        color: "bg-primary-container text-on-primary-container",
        description: "Focused coding, writing, or designing",
        defaultEnergyImpact: -25,
      },
      {
        name: "Meeting",
        icon: "groups",
        color: "bg-tertiary-container text-on-tertiary-container",
        description: "Team syncs, client calls, reviews",
        defaultEnergyImpact: -15,
      },
      {
        name: "Exercise",
        icon: "directions_run",
        color: "bg-secondary-container text-on-secondary-container",
        description: "Running, gym, yoga, swimming",
        defaultEnergyImpact: 35,
      },
      {
        name: "Nutrition",
        icon: "restaurant",
        color: "bg-tertiary-fixed-dim text-on-tertiary-container",
        description: "Meals, snacks, hydration",
        defaultEnergyImpact: 10,
      },
      {
        name: "Mindfulness",
        icon: "self_improvement",
        color: "bg-surface-container-high text-on-surface",
        description: "Meditation, journaling, breathing",
        defaultEnergyImpact: 30,
      },
      {
        name: "Learning",
        icon: "school",
        color: "bg-primary-fixed text-on-primary-fixed",
        description: "Reading courses, tutorials, books",
        defaultEnergyImpact: 20,
      },
      {
        name: "Social",
        icon: "emoji_people",
        color: "bg-secondary-fixed text-on-secondary-container",
        description: "Hangouts, calls, events",
        defaultEnergyImpact: 5,
      },
      {
        name: "Rest",
        icon: "bedtime",
        color: "bg-primary-fixed-dim text-on-primary-fixed-variant",
        description: "Sleep, naps, relaxation",
        defaultEnergyImpact: 50,
      },
    ];

    const seededCategories = await db
      .insert(schema.categories)
      .values(categoryDefs)
      .onConflictDoNothing({ target: schema.categories.name })
      .returning();

    console.log(`✅ Seeded ${seededCategories.length} categories\n`);

    // Fetch all categories with IDs
    const allCategories = await db.query.categories.findMany();
    const catMap = new Map(allCategories.map((c) => [c.name, c]));

    const getCatId = (name: string) => catMap.get(name)?.id || 1;

    // 3. Seed diverse activities with AI data (20 activities)
    console.log("📝 Seeding activities...");

    const activityTemplates = [
      // Deep Work activities
      {
        category: "Deep Work",
        titles: [
          "Frontend Refactoring",
          "API Design Session",
          "Bug Hunting Sprint",
          "Architecture Review",
          "Feature Implementation",
        ],
        descriptions: [
          "Refactored legacy component architecture",
          "Designed REST API endpoints for new module",
          "Fixed 5 critical production bugs",
          "Reviewed system architecture with team",
          "Built new dashboard analytics feature",
        ],
        durationRange: [60, 180] as [number, number],
        energyRange: [-35, -15] as [number, number],
        aiInsights: [
          "Deep work sessions over 90min show diminishing returns",
          "Morning slots yield 23% more output",
          "Break every 45min recommended",
        ],
      },
      // Meeting activities
      {
        category: "Meeting",
        titles: [
          "Sprint Planning",
          "Client Presentation",
          "1:1 with Manager",
          "Design Critique",
          "Retrospective",
        ],
        descriptions: [
          "Planned next 2 weeks sprint goals",
          "Presented Q3 roadmap to stakeholders",
          "Career growth discussion",
          "Reviewed new UI mockups",
          "Team retrospective and action items",
        ],
        durationRange: [30, 90] as [number, number],
        energyRange: [-25, -5] as [number, number],
        aiInsights: [
          "Afternoon meetings drain 18% more energy",
          "Standing meetings reduce fatigue",
          "Limit to 30min for optimal engagement",
        ],
      },
      // Exercise activities
      {
        category: "Exercise",
        titles: [
          "Morning 5K Run",
          "HIIT Workout",
          "Yoga Flow",
          "Strength Training",
          "Evening Swim",
        ],
        descriptions: [
          "Cardio run through the park",
          "High intensity interval training",
          "30min vinyasa flow session",
          "Upper body focus day",
          "Laps at the community pool",
        ],
        durationRange: [30, 90] as [number, number],
        energyRange: [25, 45] as [number, number],
        aiInsights: [
          "Morning exercise boosts energy for 6 hours",
          "Cardio more effective than strength for energy",
          "Consistency beats intensity for energy levels",
        ],
      },
      // Nutrition activities
      {
        category: "Nutrition",
        titles: [
          "Protein-Rich Breakfast",
          "Meal Prep Sunday",
          "Healthy Lunch",
          "Afternoon Smoothie",
          "Balanced Dinner",
        ],
        descriptions: [
          "Eggs, avocado toast, and greens",
          "Prepped 5 days of lunches",
          "Salmon bowl with quinoa",
          "Berry and spinach smoothie",
          "Chicken stir-fry with vegetables",
        ],
        durationRange: [15, 60] as [number, number],
        energyRange: [5, 20] as [number, number],
        aiInsights: [
          "Protein within 30min of waking optimal",
          "Complex carbs sustain afternoon energy",
          "Hydration correlates with energy score",
        ],
      },
      // Mindfulness activities
      {
        category: "Mindfulness",
        titles: [
          "Morning Meditation",
          "Gratitude Journaling",
          "Breathing Exercise",
          "Mindful Walk",
          "Evening Wind-Down",
        ],
        descriptions: [
          "10min guided mindfulness meditation",
          "Wrote 3 things I'm grateful for",
          "4-7-8 breathing technique practice",
          "Walked in nature without phone",
          "Progressive muscle relaxation",
        ],
        durationRange: [10, 45] as [number, number],
        energyRange: [15, 40] as [number, number],
        aiInsights: [
          "Morning mindfulness improves focus 32%",
          "Evening sessions improve sleep quality",
          "Consistency more important than duration",
        ],
      },
      // Learning activities
      {
        category: "Learning",
        titles: [
          "TypeScript Course",
          "Design Patterns Book",
          "Tech Podcast",
          "Coding Challenge",
          "Conference Talk",
        ],
        descriptions: [
          "Advanced type system modules",
          "Read chapter on observer pattern",
          "Listened to software architecture episode",
          "Solved 3 LeetCode hard problems",
          "Watched React Conf keynote",
        ],
        durationRange: [30, 120] as [number, number],
        energyRange: [10, 25] as [number, number],
        aiInsights: [
          "Learning before noon increases retention",
          "Break learning into 25min pomodoros",
          "Active practice more energizing than passive",
        ],
      },
      // Social activities
      {
        category: "Social",
        titles: [
          "Coffee with Friend",
          "Team Lunch",
          "Video Call Family",
          "Networking Event",
          "Game Night",
        ],
        descriptions: [
          "Caught up over specialty coffee",
          "Team bonding at local bistro",
          "Weekly call with parents",
          "Met 3 new industry contacts",
          "Board games with friends",
        ],
        durationRange: [30, 180] as [number, number],
        energyRange: [-10, 25] as [number, number],
        aiInsights: [
          "Small groups (2-3) more energizing",
          "Outdoor social activities boost mood",
          "Limit to 2 hours for introvert types",
        ],
      },
      // Rest activities
      {
        category: "Rest",
        titles: [
          "Power Nap",
          "Full Night Sleep",
          "Netflix Break",
          "Reading Fiction",
          "Nature Walk",
        ],
        descriptions: [
          "20min afternoon recharge nap",
          "8 hours uninterrupted sleep",
          "One episode mental break",
          "Fantasy novel escapism",
          "Slow stroll without destination",
        ],
        durationRange: [20, 480] as [number, number],
        energyRange: [30, 60] as [number, number],
        aiInsights: [
          "Power naps under 25min prevent grogginess",
          "7.5 hours optimal for your profile",
          "Screen-free rest more restorative",
        ],
      },
    ];

    const activities: (typeof schema.activities.$inferInsert)[] = [];
    const now = new Date();

    // Generate 25 activities over past 14 days with diverse patterns
    for (let day = 13; day >= 0; day--) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() - day);
      baseDate.setHours(0, 0, 0, 0);
      const dayOfWeek = baseDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Number of activities varies by day type
      const numActivities = isWeekend
        ? randomBetween(3, 5)
        : randomBetween(5, 8);

      const usedSlots = new Set<number>();

      for (let i = 0; i < numActivities; i++) {
        const template = randomItem(activityTemplates);
        const titleIdx = randomBetween(0, template.titles.length - 1);
        const descIdx = randomBetween(0, template.descriptions.length - 1);
        const duration = randomBetween(
          template.durationRange[0],
          template.durationRange[1]
        );
        const energyImpact = randomBetween(
          template.energyRange[0],
          template.energyRange[1]
        );

        // Pick a time slot ensuring no overlap
        let hour: number;
        let attempts = 0;
        do {
          if (isWeekend) {
            hour = randomBetween(8, 22);
          } else {
            // Weekday pattern: morning exercise, work midday, evening wind-down
            const slot = randomBetween(0, 4);
            if (slot === 0) hour = randomBetween(6, 9); // Morning
            else if (slot === 1) hour = randomBetween(9, 12); // Late morning
            else if (slot === 2) hour = randomBetween(13, 17); // Afternoon
            else if (slot === 3) hour = randomBetween(18, 20); // Evening
            else hour = randomBetween(21, 23); // Night
          }
          attempts++;
        } while (usedSlots.has(hour) && attempts < 10);
        usedSlots.add(hour);

        const activityTime = new Date(baseDate);
        activityTime.setHours(hour, randomBetween(0, 59), 0, 0);

        // AI confidence varies by activity type
        const confidence = template.category === "Rest"
          ? 0.90 + Math.random() * 0.08
          : 0.70 + Math.random() * 0.25;

        const aiInsight = randomItem(template.aiInsights);

        activities.push({
          userId,
          categoryId: getCatId(template.category),
          title: template.titles[titleIdx],
          description: template.descriptions[descIdx],
          duration,
          energyImpact,
          notes: `${template.titles[titleIdx]} — ${template.descriptions[descIdx]}`,
          aiProcessed: true,
          aiData: {
            confidence: Math.min(0.99, confidence),
            optimalTime: `${hour}:00`,
            mlInsights: [aiInsight, `Energy delta: ${energyImpact > 0 ? "+" : ""}${energyImpact}%`],
            categoryMatch: template.category,
            dayType: isWeekend ? "weekend" : "weekday",
          },
          createdAt: activityTime,
        });
      }
    }

    const seededActivities = await db
      .insert(schema.activities)
      .values(activities)
      .returning();

    console.log(`✅ Seeded ${seededActivities.length} diverse activities\n`);

    // 4. Seed energy logs for the past 30 days (rich trend data)
    console.log("📊 Seeding energy logs (30 days)...");
    const energyLogs: (typeof schema.energyLogs.$inferInsert)[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMonday = dayOfWeek === 1;

      // Base energy varies by day type
      let baseEnergy = isWeekend ? 75 : 60;
      if (isMonday) baseEnergy -= 8; // Monday blues

      // Add some realistic variance and trend
      const trendFactor = Math.sin(i / 5) * 10; // Wave pattern
      const randomVariance = randomBetween(-10, 15);

      const morningEnergy = Math.min(
        100,
        Math.max(30, baseEnergy + trendFactor + randomVariance)
      );
      const afternoonEnergy = Math.min(
        100,
        Math.max(25, morningEnergy - randomBetween(5, 20) + randomBetween(0, 10))
      );
      const eveningEnergy = Math.min(
        100,
        Math.max(20, afternoonEnergy - randomBetween(5, 15) + randomBetween(0, 8))
      );

      const energies = [morningEnergy, afternoonEnergy, eveningEnergy];
      const avgEnergy = energies.reduce((a, b) => a + b, 0) / 3;

      const maxEnergy = Math.max(...energies);
      let peakTime = "Morning";
      if (maxEnergy === afternoonEnergy) peakTime = "Afternoon";
      else if (maxEnergy === eveningEnergy) peakTime = "Evening";

      // Factors vary
      const allFactors = [
        "sleep",
        "exercise",
        "workload",
        "hydration",
        "caffeine",
        "stress",
        "social",
        "weather",
      ];
      const numFactors = randomBetween(1, 4);
      const shuffled = [...allFactors].sort(() => Math.random() - 0.5);
      const factors = shuffled.slice(0, numFactors);

      const notesPool = [
        "Feeling productive today!",
        "A bit sluggish in the afternoon",
        "Great sleep last night",
        "Coffee helped boost morning energy",
        "Long meeting drained me",
        "Exercise gave me a second wind",
        "Meditation session was calming",
        "Back-to-back calls today",
        "Weekend recovery mode",
        "Monday energy slump",
        "Felt energized all day",
        "Midday crash, needed a nap",
        null,
        null,
      ];

      energyLogs.push({
        userId,
        date,
        morningEnergy: Math.round(morningEnergy),
        afternoonEnergy: Math.round(afternoonEnergy),
        eveningEnergy: Math.round(eveningEnergy),
        avgEnergy: Math.round(avgEnergy),
        peakTime,
        factors,
        notes: randomItem(notesPool) || undefined,
      });
    }

    const seededLogs = await db
      .insert(schema.energyLogs)
      .values(energyLogs)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Seeded ${seededLogs.length} energy logs (30 days)\n`);

    // 5. Seed questionnaire answer for demo user
    console.log("📋 Seeding questionnaire answer...");
    const demoAnswers = [
      { questionId: 1, answer: true },   // Morning person
      { questionId: 2, answer: false },  // Social doesn't drain
      { questionId: 3, answer: true },   // Planner
      { questionId: 4, answer: true },   // Exercise boosts energy
      { questionId: 5, answer: true },   // Sensitive to clutter
      { questionId: 6, answer: true },   // Meetings exhaust
      { questionId: 7, answer: false }, // Recharges socially
      { questionId: 8, answer: true },   // Caffeine sensitive
      { questionId: 9, answer: true },   // Afternoon crash
      { questionId: 10, answer: true }, // Single-tasker
    ];

    await db
      .insert(schema.questionnaireAnswers)
      .values({
        userId,
        answers: demoAnswers,
        completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      })
      .onConflictDoNothing();

    console.log("✅ Seeded questionnaire answers\n");

    // 6. Seed diverse ML predictions
    console.log("🤖 Seeding ML predictions...");
    const predictionTypes = [
      "energy_forecast",
      "optimal_time",
      "activity_recommendation",
      "burnout_risk",
      "weekly_pattern",
    ];

    const predictions: (typeof schema.mlPredictions.$inferInsert)[] = [
      {
        userId,
        predictionType: "energy_forecast",
        prediction: {
          todayMorning: randomBetween(65, 85),
          todayAfternoon: randomBetween(55, 75),
          todayEvening: randomBetween(45, 65),
          tomorrowMorning: randomBetween(70, 90),
          trend: randomItem(["rising", "stable", "declining"]),
          confidenceInterval: "±8%",
        },
        confidence: 0.87,
        modelVersion: "energeez-v3.1-neural",
      },
      {
        userId,
        predictionType: "optimal_time",
        prediction: {
          bestWorkTime: `${randomBetween(7, 10)}:00 AM - ${randomBetween(11, 13)}:00 PM`,
          bestExerciseTime: `${randomBetween(6, 8)}:00 AM - ${randomBetween(7, 9)}:00 AM`,
          bestRestTime: `${randomBetween(21, 23)}:00 PM - ${randomBetween(6, 8)}:00 AM`,
          bestMeetingTime: `${randomBetween(10, 11)}:00 AM - ${randomBetween(11, 12)}:00 PM`,
        },
        confidence: 0.82,
        modelVersion: "energeez-v3.1-neural",
      },
      {
        userId,
        predictionType: "activity_recommendation",
        prediction: {
          recommendedActivity: randomItem([
            "Morning Run",
            "Deep Work Session",
            "Yoga Flow",
            "Power Nap",
            "Team Lunch",
          ]),
          reason: "Matches your energy peak pattern",
          duration: randomBetween(20, 60),
          expectedEnergyBoost: randomBetween(15, 35),
          optimalWindow: "Next 2 hours",
        },
        confidence: 0.91,
        modelVersion: "energeez-v3.1-neural",
      },
      {
        userId,
        predictionType: "burnout_risk",
        prediction: {
          riskLevel: randomItem(["low", "low", "medium", "low"]),
          riskScore: randomBetween(15, 45),
          warningSigns: ["Long work streak", "Declining rest scores"].slice(
            0,
            randomBetween(0, 2)
          ),
          recommendation: "Schedule a rest day this weekend",
        },
        confidence: 0.78,
        modelVersion: "energeez-v3.1-neural",
      },
      {
        userId,
        predictionType: "weekly_pattern",
        prediction: {
          strongestDay: randomItem(["Tuesday", "Wednesday", "Thursday"]),
          weakestDay: randomItem(["Monday", "Friday"]),
          peakHour: randomBetween(9, 11),
          slumpHour: randomBetween(14, 16),
          pattern: "Mid-week energy peak with Monday/Friday dips",
        },
        confidence: 0.85,
        modelVersion: "energeez-v3.1-neural",
      },
    ];

    const seededPredictions = await db
      .insert(schema.mlPredictions)
      .values(predictions)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Seeded ${seededPredictions.length} ML predictions\n`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n┌─────────────────────────────────────────┐");
    console.log("│          DEMO ACCOUNT DETAILS            │");
    console.log("├─────────────────────────────────────────┤");
    console.log("│  Email:    demo@energeez.app            │");
    console.log("│  Password: 123456                       │");
    console.log("│  Name:     Alex Morgan                  │");
    console.log("├─────────────────────────────────────────┤");
    console.log("│  Categories:       8 types              │");
    console.log("│  Activities:       ~80+ entries         │");
    console.log("│  Energy Logs:      30 days              │");
    console.log("│  Questionnaire:    Completed            │");
    console.log("│  ML Predictions:   5 models             │");
    console.log("└─────────────────────────────────────────┘");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seed
seed();
