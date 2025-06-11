import { users, calorieGoals, foodEntries, aiSuggestions, dailyMealPlans, type User, type InsertUser, type CalorieGoal, type InsertCalorieGoal, type FoodEntry, type InsertFoodEntry, type AiSuggestion, type InsertAiSuggestion, type DailyMealPlan, type InsertDailyMealPlan } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calorieGoals: Map<string, CalorieGoal>; // key: userId-date
  private foodEntries: Map<number, FoodEntry>;
  private aiSuggestions: Map<number, AiSuggestion>;
  private dailyMealPlans: Map<number, DailyMealPlan>;
  private currentUserId: number;
  private currentGoalId: number;
  private currentEntryId: number;
  private currentSuggestionId: number;
  private currentMealPlanId: number;

  constructor() {
    this.users = new Map();
    this.calorieGoals = new Map();
    this.foodEntries = new Map();
    this.aiSuggestions = new Map();
    this.currentUserId = 1;
    this.currentGoalId = 1;
    this.currentEntryId = 1;
    this.currentSuggestionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3-day trial
    
    const user: User = {
      ...insertUser,
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "trial",
      trialEndsAt,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId?: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserSubscriptionStatus(id: number, status: "trial" | "active" | "canceled" | "expired"): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, subscriptionStatus: status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCalorieGoal(userId: number, date: string): Promise<CalorieGoal | undefined> {
    return this.calorieGoals.get(`${userId}-${date}`);
  }

  async setCalorieGoal(goal: InsertCalorieGoal): Promise<CalorieGoal> {
    const id = this.currentGoalId++;
    const calorieGoal: CalorieGoal = { ...goal, id };
    this.calorieGoals.set(`${goal.userId}-${goal.date}`, calorieGoal);
    return calorieGoal;
  }

  async updateCalorieGoal(userId: number, date: string, goalUpdate: Partial<InsertCalorieGoal>): Promise<CalorieGoal> {
    const existing = this.calorieGoals.get(`${userId}-${date}`);
    if (!existing) throw new Error("Calorie goal not found");
    
    const updated = { ...existing, ...goalUpdate };
    this.calorieGoals.set(`${userId}-${date}`, updated);
    return updated;
  }

  async getFoodEntriesForDate(userId: number, date: string): Promise<FoodEntry[]> {
    return Array.from(this.foodEntries.values())
      .filter(entry => entry.userId === userId && entry.date === date)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry> {
    const id = this.currentEntryId++;
    const foodEntry: FoodEntry = {
      ...entry,
      id,
      aiAnalysis: null,
      timestamp: new Date(),
    };
    this.foodEntries.set(id, foodEntry);
    return foodEntry;
  }

  async getFoodEntry(id: number): Promise<FoodEntry | undefined> {
    return this.foodEntries.get(id);
  }

  async deleteFoodEntry(id: number): Promise<void> {
    this.foodEntries.delete(id);
  }

  async getAiSuggestionsForDate(userId: number, date: string): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.userId === userId && suggestion.date === date)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.currentSuggestionId++;
    const aiSuggestion: AiSuggestion = {
      ...suggestion,
      id,
      createdAt: new Date(),
    };
    this.aiSuggestions.set(id, aiSuggestion);
    return aiSuggestion;
  }
}

export const storage = new MemStorage();
