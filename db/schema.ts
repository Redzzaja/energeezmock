import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  real,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    name: varchar("name", { length: 255 }),
    avatar: varchar("avatar", { length: 500 }),
    preferences: jsonb("preferences").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

// Categories for activities
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 50 }),
    description: text("description"),
    defaultEnergyImpact: real("default_energy_impact"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    nameIdx: index("category_name_idx").on(table.name),
  })
);

// Activities table
export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // in minutes
    energyImpact: real("energy_impact").notNull(), // percentage (-100 to +100)
    notes: text("notes"),
    startTime: timestamp("start_time", { withTimezone: true }).defaultNow(),
    endTime: timestamp("end_time", { withTimezone: true }),
    completed: boolean("completed").default(false),
    aiProcessed: boolean("ai_processed").default(false),
    aiData: jsonb("ai_data").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: index("activity_user_idx").on(table.userId),
    categoryIdx: index("activity_category_idx").on(table.categoryId),
    startTimeIdx: index("activity_start_time_idx").on(table.startTime),
  })
);

// Energy logs - daily snapshots
export const energyLogs = pgTable(
  "energy_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    morningEnergy: real("morning_energy"), // 0-100
    afternoonEnergy: real("afternoon_energy"),
    eveningEnergy: real("evening_energy"),
    avgEnergy: real("avg_energy"),
    peakTime: varchar("peak_time", { length: 20 }),
    factors: jsonb("factors").default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userDateIdx: index("energy_log_user_date_idx").on(table.userId, table.date),
  })
);

// Questionnaire answers - psychology & energy profile
export const questionnaireAnswers = pgTable(
  "questionnaire_answers",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    answers: jsonb("answers").notNull().default([]),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: index("questionnaire_user_idx").on(table.userId),
  })
);

// ML predictions cache
export const mlPredictions = pgTable(
  "ml_predictions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activityId: integer("activity_id").references(() => activities.id, {
      onDelete: "cascade",
    }),
    predictionType: varchar("prediction_type", { length: 50 }).notNull(), // 'energy_forecast', 'optimal_time', 'activity_recommendation'
    prediction: jsonb("prediction").notNull(),
    confidence: real("confidence"), // 0-1
    modelVersion: varchar("model_version", { length: 50 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userTypeIdx: index("ml_prediction_user_type_idx").on(
      table.userId,
      table.predictionType
    ),
    activityIdx: index("ml_prediction_activity_idx").on(table.activityId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  activities: many(activities),
  energyLogs: many(energyLogs),
  mlPredictions: many(mlPredictions),
  questionnaireAnswer: one(questionnaireAnswers),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [activities.categoryId],
    references: [categories.id],
  }),
  mlPredictions: many(mlPredictions),
}));

export const energyLogsRelations = relations(energyLogs, ({ one }) => ({
  user: one(users, {
    fields: [energyLogs.userId],
    references: [users.id],
  }),
}));

export const mlPredictionsRelations = relations(mlPredictions, ({ one }) => ({
  user: one(users, {
    fields: [mlPredictions.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [mlPredictions.activityId],
    references: [activities.id],
  }),
}));

export const questionnaireAnswersRelations = relations(questionnaireAnswers, ({ one }) => ({
  user: one(users, {
    fields: [questionnaireAnswers.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type EnergyLog = typeof energyLogs.$inferSelect;
export type NewEnergyLog = typeof energyLogs.$inferInsert;
export type MLPrediction = typeof mlPredictions.$inferSelect;
export type NewMLPrediction = typeof mlPredictions.$inferInsert;
export type QuestionnaireAnswer = typeof questionnaireAnswers.$inferSelect;
export type NewQuestionnaireAnswer = typeof questionnaireAnswers.$inferInsert;
