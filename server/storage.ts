import dotenv from 'dotenv';
dotenv.config();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { 
  users, calorieGoals, foodEntries, aiSuggestions, dailyMealPlans,
  type User, type InsertUser, 
  type CalorieGoal, type InsertCalorieGoal, 
  type FoodEntry, type InsertFoodEntry, 
  type AiSuggestion, type InsertAiSuggestion, 
  type DailyMealPlan, type InsertDailyMealPlan 
} from "@shared/schema";

// This is the IStorage interface your application depends on.
// We will implement this with a PostgreSQL backend.
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId?: string): Promise<User>;
  updateUserSubscriptionStatus(id: number, status: "trial" | "active" | "canceled" | "expired"): Promise<User>;
  
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
  throw new Error("DATABASE_URL environment variable is required.");
}

// Setup the database connection and Drizzle client
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

/**
 * PostgreSQL implementation of the IStorage interface using Drizzle ORM.
 */
export class PgStorage implements IStorage {

  // --- User Operations ---

  async getUser(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3-day trial

    const [newUser] = await db.insert(users).values({
      ...insertUser,
      trialEndsAt,
    }).returning();
    
    if (!newUser) throw new Error("Failed to create user.");
    return newUser;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId?: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        stripeCustomerId: customerId,
        ...(subscriptionId && { stripeSubscriptionId: subscriptionId }),
      })
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) throw new Error("User not found to update Stripe info.");
    return updatedUser;
  }

  async updateUserSubscriptionStatus(id: number, status: "trial" | "active" | "canceled" | "expired"): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ subscriptionStatus: status })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) throw new Error("User not found to update subscription status.");
    return updatedUser;
  }

  // --- Calorie Goal Operations ---

  async getCalorieGoal(userId: number, date: string): Promise<CalorieGoal | undefined> {
    return db.query.calorieGoals.findFirst({
      where: and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date))
    });
  }

  async setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal> {
    // Upsert: insert or update if a goal for the user/date already exists
    const [result] = await db.insert(calorieGoals)
      .values(goal)
      .onConflictDoUpdate({
        target: [calorieGoals.userId, calorieGoals.date],
        set: { calories: goal.calories, protein: goal.protein, carbs: goal.carbs, fat: goal.fat },
      })
      .returning();
      
    if (!result) throw new Error("Failed to set calorie goal.");
    return result;
  }
  
  async updateCalorieGoal(userId: number, date: string, goalUpdate: Partial<InsertCalorieGoal>): Promise<CalorieGoal> {
    const [updatedGoal] = await db.update(calorieGoals)
      .set(goalUpdate)
      .where(and(eq(calorieGoals.userId, userId), eq(calorieGoals.date, date)))
      .returning();

    if (!updatedGoal) throw new Error("Calorie goal not found to update.");
    return updatedGoal;
  }
  
  // --- Food Entry Operations ---

  async getFoodEntriesForDate(userId: number, date: string): Promise<FoodEntry[]> {
    return db.query.foodEntries.findMany({
      where: and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)),
      orderBy: [asc(foodEntries.timestamp)]
    });
  }

  async createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry> {
    const [newEntry] = await db.insert(foodEntries).values(entry).returning();
    if (!newEntry) throw new Error("Failed to create food entry.");
    return newEntry;
  }

  async getFoodEntry(id: number): Promise<FoodEntry | undefined> {
    return db.query.foodEntries.findFirst({ where: eq(foodEntries.id, id) });
  }

  async deleteFoodEntry(id: number): Promise<void> {
    await db.delete(foodEntries).where(eq(foodEntries.id, id));
  }
  
  // --- AI Suggestion Operations ---
  
  async getAiSuggestionsForDate(userId: number, date: string): Promise<AiSuggestion[]> {
    return db.query.aiSuggestions.findMany({
      where: and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.date, date)),
      orderBy: [desc(aiSuggestions.createdAt)]
    });
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [newSuggestion] = await db.insert(aiSuggestions).values(suggestion).returning();
    if (!newSuggestion) throw new Error("Failed to create AI suggestion.");
    return newSuggestion;
  }

  // --- Daily Meal Plan Operations ---

  async getDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]> {
    // Replicate custom sorting logic to order meals correctly
    const mealOrder = sql`
      CASE ${dailyMealPlans.mealType}
        WHEN 'breakfast' THEN 1
        WHEN 'lunch'     THEN 2
        WHEN 'dinner'    THEN 3
        WHEN 'snack'     THEN 4
        ELSE 5
      END`;
      
    return db.select().from(dailyMealPlans)
      .where(and(eq(dailyMealPlans.userId, userId), eq(dailyMealPlans.date, date)))
      .orderBy(mealOrder);
  }

  async createDailyMealPlan(plan: InsertDailyMealPlan): Promise<DailyMealPlan> {
    const [newPlan] = await db.insert(dailyMealPlans).values(plan).returning();
    if (!newPlan) throw new Error("Failed to create daily meal plan.");
    return newPlan;
  }

  async updateMealPlanSelection(planId: number, isSelected: boolean): Promise<DailyMealPlan> {
    const [updatedPlan] = await db.update(dailyMealPlans)
      .set({ isSelected })
      .where(eq(dailyMealPlans.id, planId))
      .returning();
      
    if (!updatedPlan) throw new Error("Meal plan not found.");
    return updatedPlan;
  }

  async generateDailyMealPlans(userId: number, date: string): Promise<DailyMealPlan[]> {
    // The generation logic is in the route handler; this method just retrieves what exists.
    return this.getDailyMealPlans(userId, date);
  }
}

// Export a single instance of the PgStorage to be used throughout the app.
export const storage: IStorage = new PgStorage();