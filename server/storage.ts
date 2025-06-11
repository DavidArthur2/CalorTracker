import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import {
  users,
  userPreferences,
  calorieGoals,
  foodEntries,
  aiSuggestions,
  dailyMealPlans,
  type User,
  type UserPreferences,
  type CalorieGoal,
  type FoodEntry,
  type AiSuggestion,
  type DailyMealPlan,
  type InsertUserPreferences,
  type InsertCalorieGoal,
  type InsertFoodEntry,
  type InsertAiSuggestion,
  type InsertDailyMealPlan,
} from "@shared/schema";
import { generateDailyMealPlans } from "./openai";

// This is the IStorage interface your application depends on.
// We will implement this with a PostgreSQL backend.
export interface IStorage {
  // User operations (Email/Password Auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  // Calorie goals
  getCalorieGoal(userId: number, date: string): Promise<CalorieGoal | undefined>;
  setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal>;
  updateCalorieGoal(userId: number, date: string, goal: Partial<InsertCalorieGoal>): Promise<CalorieGoal>;
  
  // Food entries
  getFoodEntriesForDate(userId: number, date: string): Promise<FoodEntry[]>;
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  getFoodEntry(id: number): Promise<FoodEntry | undefined>;
  deleteFoodEntry(id: number): Promise<void>;
  
  // AI suggestions
  getAiSuggestionsForDate(userId: number, date: string): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  
  // Daily meal plans
  getDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]>;
  createDailyMealPlan(plan: InsertDailyMealPlan): Promise<DailyMealPlan>;
  updateMealPlanSelection(planId: number, isSelected: boolean): Promise<DailyMealPlan>;
  generateDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]>;
}

// Ensure the DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client);

/**
 * PostgreSQL implementation of the IStorage interface using Drizzle ORM.
 */
export class PgStorage implements IStorage {
  // User operations for Email/Password Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      })
      .returning();
    return user;
  }

  // User preferences
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const validatedPreferences = {
      ...preferences,
      gender: preferences.gender as "male" | "female" | "other" | null
    };
    const [newPreferences] = await db.insert(userPreferences).values(validatedPreferences).returning();
    return newPreferences;
  }

  async updateUserPreferences(userId: number, preferencesUpdate: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const updateData = { ...preferencesUpdate, updatedAt: new Date() };
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set(updateData as any)
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updatedPreferences;
  }

  // Calorie goals
  async getCalorieGoal(userId: number, date: string): Promise<CalorieGoal | undefined> {
    const [goal] = await db
      .select()
      .from(calorieGoals)
      .where(and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date)));
    return goal;
  }

  async setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal> {
    const [newGoal] = await db.insert(calorieGoals).values(goal).returning();
    return newGoal;
  }

  async updateCalorieGoal(userId: number, date: string, goalUpdate: Partial<InsertCalorieGoal>): Promise<CalorieGoal> {
    const [updatedGoal] = await db
      .update(calorieGoals)
      .set(goalUpdate)
      .where(and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date)))
      .returning();
    return updatedGoal;
  }

  // Food entries
  async getFoodEntriesForDate(userId: number, date: string): Promise<FoodEntry[]> {
    const entries = await db
      .select()
      .from(foodEntries)
      .where(and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)))
      .orderBy(foodEntries.timestamp);
    return entries;
  }

  async createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry> {
    const [newEntry] = await db.insert(foodEntries).values(entry as any).returning();
    return newEntry;
  }

  async getFoodEntry(id: number): Promise<FoodEntry | undefined> {
    const [entry] = await db.select().from(foodEntries).where(eq(foodEntries.id, id));
    return entry;
  }

  async deleteFoodEntry(id: number): Promise<void> {
    await db.delete(foodEntries).where(eq(foodEntries.id, id));
  }

  // AI suggestions
  async getAiSuggestionsForDate(userId: number, date: string): Promise<AiSuggestion[]> {
    const suggestions = await db
      .select()
      .from(aiSuggestions)
      .where(and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.date, date)))
      .orderBy(aiSuggestions.createdAt);
    return suggestions;
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [newSuggestion] = await db.insert(aiSuggestions).values(suggestion as any).returning();
    return newSuggestion;
  }

  // Daily meal plans
  async getDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]> {
    const plans = await db
      .select()
      .from(dailyMealPlans)
      .where(and(eq(dailyMealPlans.userId, userId), eq(dailyMealPlans.date, date)))
      .orderBy(dailyMealPlans.createdAt);
    return plans;
  }

  async createDailyMealPlan(plan: InsertDailyMealPlan): Promise<DailyMealPlan> {
    const [newPlan] = await db.insert(dailyMealPlans).values(plan as any).returning();
    return newPlan;
  }

  async updateMealPlanSelection(planId: number, isSelected: boolean): Promise<DailyMealPlan> {
    const [updatedPlan] = await db
      .update(dailyMealPlans)
      .set({ isSelected })
      .where(eq(dailyMealPlans.id, planId))
      .returning();
    return updatedPlan;
  }

  async generateDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      const calorieGoal = await this.getCalorieGoal(userId, date);
      
      const mealPlans = await generateDailyMealPlans(
        calorieGoal?.calories || 2000,
        calorieGoal?.protein || 150,
        calorieGoal?.carbs || 250,
        calorieGoal?.fat || 67,
        userPrefs?.dietaryRestrictions?.join(', ') || undefined
      );

      const plans: DailyMealPlan[] = [];
      for (const mealPlan of mealPlans) {
        const planData = {
          userId,
          date,
          mealType: mealPlan.mealType,
          title: mealPlan.title,
          description: mealPlan.description,
          estimatedCalories: mealPlan.estimatedCalories,
          estimatedProtein: mealPlan.estimatedProtein.toString(),
          estimatedCarbs: mealPlan.estimatedCarbs.toString(),
          estimatedFat: mealPlan.estimatedFat.toString(),
          ingredients: mealPlan.ingredients,
          instructions: mealPlan.instructions,
          isSelected: false,
        };
        
        const createdPlan = await this.createDailyMealPlan(planData);
        plans.push(createdPlan);
      }

      return plans;
    } catch (error) {
      console.error("Error generating daily meal plans:", error);
      return [];
    }
  }
}

export const storage: IStorage = new PgStorage();