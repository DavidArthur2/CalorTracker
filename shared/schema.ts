import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  age: integer("age"),
  gender: text("gender").$type<"male" | "female" | "other">(),
  height: integer("height"), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  activityLevel: text("activity_level").$type<"sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active">(),
  goal: text("goal").$type<"weight_loss" | "weight_gain" | "maintain_weight" | "muscle_gain">(),
  dietaryRestrictions: json("dietary_restrictions").$type<string[]>().default([]),
  allergies: json("allergies").$type<string[]>().default([]),
  cuisinePreferences: json("cuisine_preferences").$type<string[]>().default([]),
  dailyCalorieGoal: integer("daily_calorie_goal"),
  dailyProteinGoal: integer("daily_protein_goal"),
  dailyCarbGoal: integer("daily_carb_goal"),
  dailyFatGoal: integer("daily_fat_goal"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calorieGoals = pgTable("calorie_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
});

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").$type<"breakfast" | "lunch" | "dinner" | "snack">().notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).notNull(),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).notNull(),
  fat: decimal("fat", { precision: 8, scale: 2 }).notNull(),
  fiber: decimal("fiber", { precision: 8, scale: 2 }),
  sugar: decimal("sugar", { precision: 8, scale: 2 }),
  sodium: decimal("sodium", { precision: 8, scale: 2 }),
  aiAnalysis: json("ai_analysis"), // Store raw AI response
  timestamp: timestamp("timestamp").defaultNow(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  suggestionType: text("suggestion_type").$type<"meal" | "exercise" | "general">().notNull(),
  content: text("content").notNull(),
  timeOfDay: text("time_of_day"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyMealPlans = pgTable("daily_meal_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  mealType: text("meal_type").$type<"breakfast" | "lunch" | "dinner" | "snack">().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  estimatedCalories: integer("estimated_calories").notNull(),
  estimatedProtein: decimal("estimated_protein", { precision: 8, scale: 2 }).notNull(),
  estimatedCarbs: decimal("estimated_carbs", { precision: 8, scale: 2 }).notNull(),
  estimatedFat: decimal("estimated_fat", { precision: 8, scale: 2 }).notNull(),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: text("instructions"),
  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// UpsertUser type for Replit Auth
export type UpsertUser = typeof users.$inferInsert;

export const insertCalorieGoalSchema = createInsertSchema(calorieGoals).pick({
  userId: true,
  date: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
});

export const insertFoodEntrySchema = createInsertSchema(foodEntries).pick({
  userId: true,
  date: true,
  mealType: true,
  description: true,
  imageUrl: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  fiber: true,
  sugar: true,
  sodium: true,
}).extend({
  protein: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  carbs: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  fat: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  fiber: z.union([z.string(), z.number()]).optional().transform((val) => val === undefined ? undefined : val.toString()),
  sugar: z.union([z.string(), z.number()]).optional().transform((val) => val === undefined ? undefined : val.toString()),
  sodium: z.union([z.string(), z.number()]).optional().transform((val) => val === undefined ? undefined : val.toString()),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  userId: true,
  date: true,
  suggestionType: true,
  content: true,
  timeOfDay: true,
});

export const insertDailyMealPlanSchema = createInsertSchema(dailyMealPlans).pick({
  userId: true,
  date: true,
  mealType: true,
  title: true,
  description: true,
  estimatedCalories: true,
  estimatedProtein: true,
  estimatedCarbs: true,
  estimatedFat: true,
  ingredients: true,
  instructions: true,
  isSelected: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type CalorieGoal = typeof calorieGoals.$inferSelect;
export type InsertCalorieGoal = z.infer<typeof insertCalorieGoalSchema>;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;

export type DailyMealPlan = typeof dailyMealPlans.$inferSelect;
export type InsertDailyMealPlan = z.infer<typeof insertDailyMealPlanSchema>;
