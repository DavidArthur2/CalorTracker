import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").$type<"trial" | "active" | "canceled" | "expired">().default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calorieGoals = pgTable("calorie_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
});

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  suggestionType: text("suggestion_type").$type<"meal" | "exercise" | "general">().notNull(),
  content: text("content").notNull(),
  timeOfDay: text("time_of_day"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyMealPlans = pgTable("daily_meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

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

export type CalorieGoal = typeof calorieGoals.$inferSelect;
export type InsertCalorieGoal = z.infer<typeof insertCalorieGoalSchema>;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;

export type DailyMealPlan = typeof dailyMealPlans.$inferSelect;
export type InsertDailyMealPlan = z.infer<typeof insertDailyMealPlanSchema>;
