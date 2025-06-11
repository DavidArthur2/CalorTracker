import dotenv from 'dotenv';
dotenv.config();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { 
  users, userPreferences, calorieGoals, foodEntries, aiSuggestions, dailyMealPlans,
  type User, type UpsertUser,
  type UserPreferences, type InsertUserPreferences,
  type CalorieGoal, type InsertCalorieGoal, 
  type FoodEntry, type InsertFoodEntry, 
  type AiSuggestion, type InsertAiSuggestion, 
  type DailyMealPlan, type InsertDailyMealPlan 
} from "@shared/schema";
import { generateDailyMealPlans } from "./openai";

// This is the IStorage interface your application depends on.
// We will implement this with a PostgreSQL backend.
export interface IStorage {
  // User operations (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  // Calorie goals
  getCalorieGoal(userId: string, date: string): Promise<CalorieGoal | undefined>;
  setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal>;
  updateCalorieGoal(userId: string, date: string, goal: Partial<InsertCalorieGoal>): Promise<CalorieGoal>;
  
  // Food entries
  getFoodEntriesForDate(userId: string, date: string): Promise<FoodEntry[]>;
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  getFoodEntry(id: number): Promise<FoodEntry | undefined>;
  deleteFoodEntry(id: number): Promise<void>;
  
  // AI suggestions
  getAiSuggestionsForDate(userId: string, date: string): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  
  // Daily meal plans
  getDailyMealPlans(userId: string, date: string): Promise<DailyMealPlan[]>;
  createDailyMealPlan(plan: InsertDailyMealPlan): Promise<DailyMealPlan>;
  updateMealPlanSelection(planId: number, isSelected: boolean): Promise<DailyMealPlan>;
  generateDailyMealPlans(userId: string, date: string): Promise<DailyMealPlan[]>;
}

// Ensure the DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

/**
 * PostgreSQL implementation of the IStorage interface using Drizzle ORM.
 */
export class PgStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [created] = await db.insert(userPreferences).values([preferences]).returning();
    return created;
  }

  async updateUserPreferences(userId: string, preferencesUpdate: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...preferencesUpdate, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Calorie goals
  async getCalorieGoal(userId: string, date: string): Promise<CalorieGoal | undefined> {
    const [goal] = await db.select().from(calorieGoals)
      .where(and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date)));
    return goal;
  }

  async setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal> {
    const [created] = await db.insert(calorieGoals).values(goal)
      .onConflictDoUpdate({
        target: [calorieGoals.userId, calorieGoals.date],
        set: goal,
      })
      .returning();
    return created;
  }

  async updateCalorieGoal(userId: string, date: string, goalUpdate: Partial<InsertCalorieGoal>): Promise<CalorieGoal> {
    const [updated] = await db.update(calorieGoals)
      .set(goalUpdate)
      .where(and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date)))
      .returning();
    return updated;
  }

  // Food entries
  async getFoodEntriesForDate(userId: string, date: string): Promise<FoodEntry[]> {
    const entries = await db.select().from(foodEntries)
      .where(and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)))
      .orderBy(desc(foodEntries.timestamp));
    return entries;
  }

  async createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry> {
    const [created] = await db.insert(foodEntries).values([entry]).returning();
    return created;
  }

  async getFoodEntry(id: number): Promise<FoodEntry | undefined> {
    const [entry] = await db.select().from(foodEntries).where(eq(foodEntries.id, id));
    return entry;
  }

  async deleteFoodEntry(id: number): Promise<void> {
    await db.delete(foodEntries).where(eq(foodEntries.id, id));
  }

  // AI suggestions
  async getAiSuggestionsForDate(userId: string, date: string): Promise<AiSuggestion[]> {
    const suggestions = await db.select().from(aiSuggestions)
      .where(and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.date, date)))
      .orderBy(desc(aiSuggestions.createdAt));
    return suggestions;
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [created] = await db.insert(aiSuggestions).values([suggestion]).returning();
    return created;
  }

  // Daily meal plans
  async getDailyMealPlans(userId: string, date: string): Promise<DailyMealPlan[]> {
    const plans = await db.select().from(dailyMealPlans)
      .where(and(eq(dailyMealPlans.userId, userId), eq(dailyMealPlans.date, date)))
      .orderBy(asc(dailyMealPlans.createdAt));
    return plans;
  }

  async createDailyMealPlan(plan: InsertDailyMealPlan): Promise<DailyMealPlan> {
    const [created] = await db.insert(dailyMealPlans).values([plan]).returning();
    return created;
  }

  async updateMealPlanSelection(planId: number, isSelected: boolean): Promise<DailyMealPlan> {
    const [updated] = await db.update(dailyMealPlans)
      .set({ isSelected })
      .where(eq(dailyMealPlans.id, planId))
      .returning();
    return updated;
  }

  async generateDailyMealPlans(userId: string, date: string): Promise<DailyMealPlan[]> {
    // Get user preferences for context
    const preferences = await this.getUserPreferences(userId);
    const calorieGoal = await this.getCalorieGoal(userId, date);
    const existingEntries = await this.getFoodEntriesForDate(userId, date);

    // Calculate remaining calories
    const consumedCalories = existingEntries.reduce((sum, entry) => sum + entry.calories, 0);
    const dailyCalorieTarget = calorieGoal?.calories || preferences?.dailyCalorieGoal || 2000;
    const remainingCalories = Math.max(0, dailyCalorieTarget - consumedCalories);

    // Generate meal plans using AI
    const aiPlans = await generateDailyMealPlans(
      remainingCalories,
      preferences?.goal || "maintain_weight",
      preferences?.dietaryRestrictions || [],
      preferences?.allergies || []
    );

    // Save generated plans to database
    const createdPlans: DailyMealPlan[] = [];
    for (const plan of aiPlans) {
      const created = await this.createDailyMealPlan({
        userId,
        date,
        ...plan,
        isSelected: false,
      });
      createdPlans.push(created);
    }

    return createdPlans;
  }
}

export const storage: IStorage = new PgStorage();