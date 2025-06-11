import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { storage } from "./storage";
import { analyzeFood, generateMealSuggestion, generateExerciseSuggestion } from "./openai";
import { insertFoodEntrySchema, insertCalorieGoalSchema, insertAiSuggestionSchema, insertDailyMealPlanSchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import { setupSecurity } from "./security";
import { setupAuth, requireAuth } from "./auth";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with local storage
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `food-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Stock meal icons data
const STOCK_MEAL_ICONS = [
  { id: 'salad', name: 'Salad', icon: '🥗', category: 'healthy' },
  { id: 'burger', name: 'Burger', icon: '🍔', category: 'fast-food' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', category: 'fast-food' },
  { id: 'sandwich', name: 'Sandwich', icon: '🥪', category: 'meal' },
  { id: 'soup', name: 'Soup', icon: '🍲', category: 'healthy' },
  { id: 'rice', name: 'Rice Bowl', icon: '🍚', category: 'meal' },
  { id: 'pasta', name: 'Pasta', icon: '🍝', category: 'meal' },
  { id: 'fish', name: 'Fish', icon: '🐟', category: 'protein' },
  { id: 'chicken', name: 'Chicken', icon: '🍗', category: 'protein' },
  { id: 'eggs', name: 'Eggs', icon: '🥚', category: 'protein' },
  { id: 'fruit', name: 'Fruit', icon: '🍎', category: 'snack' },
  { id: 'nuts', name: 'Nuts', icon: '🥜', category: 'snack' },
  { id: 'yogurt', name: 'Yogurt', icon: '🥛', category: 'dairy' },
  { id: 'smoothie', name: 'Smoothie', icon: '🥤', category: 'drink' },
  { id: 'coffee', name: 'Coffee', icon: '☕', category: 'drink' },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup security middleware
  setupSecurity(app);
  
  // Setup email/password authentication
  setupAuth(app);
  
  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  // Demo data endpoint for guest mode
  app.get('/api/demo/food-entries', async (req, res) => {
    try {
      const demoEntries = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          mealType: "breakfast",
          description: "Oatmeal with berries and honey",
          calories: 320,
          protein: "12.5",
          carbs: "58.0",
          fat: "6.2",
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          mealType: "lunch",
          description: "Grilled chicken salad",
          calories: 450,
          protein: "35.0",
          carbs: "15.0",
          fat: "28.0",
          timestamp: new Date().toISOString(),
        }
      ];
      res.json(demoEntries);
    } catch (error) {
      console.error("Error fetching demo entries:", error);
      res.status(500).json({ message: "Failed to fetch demo entries" });
    }
  });

  // User preferences routes
  app.get('/api/user/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertUserPreferencesSchema.parse({ ...req.body, userId });
      
      // Check if preferences exist
      const existing = await storage.getUserPreferences(userId);
      let preferences;
      
      if (existing) {
        preferences = await storage.updateUserPreferences(userId, validation);
      } else {
        preferences = await storage.createUserPreferences(validation);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  // Stock meal icons endpoint
  app.get('/api/meal-icons', (req, res) => {
    res.json(STOCK_MEAL_ICONS);
  });

  // Manual food entry with stock icons
  app.post('/api/food-entries/manual', isAuthenticated, async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username) || await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email, subscriptionStatus: user.subscriptionStatus, trialEndsAt: user.trialEndsAt } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Calorie goals
  app.get("/api/calorie-goal/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const goal = await storage.getCalorieGoal(parseInt(userId), date);
      
      if (!goal) {
        // Return default goal if none set
        const defaultGoal = {
          calories: 2000,
          protein: 150,
          carbs: 200,
          fat: 70
        };
        return res.json(defaultGoal);
      }
      
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/calorie-goal", async (req, res) => {
    try {
      const goalData = insertCalorieGoalSchema.parse(req.body);
      const goal = await storage.setCalorieGoal(goalData);
      res.json(goal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Food entries
  app.get("/api/food-entries/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const entries = await storage.getFoodEntriesForDate(parseInt(userId), date);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/analyze-food", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const base64Image = req.file.buffer.toString('base64');
      const analysis = await analyzeFood(base64Image);
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to analyze food: " + error.message });
    }
  });

  app.post("/api/food-entries", async (req, res) => {
    try {
      const entryData = insertFoodEntrySchema.parse(req.body);
      const entry = await storage.createFoodEntry(entryData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/food-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFoodEntry(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI suggestions
  app.get("/api/ai-suggestions/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const suggestions = await storage.getAiSuggestionsForDate(parseInt(userId), date);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/meal-suggestion", async (req, res) => {
    try {
      const { userId, date, remainingCalories, currentTime } = req.body;
      
      const foodEntries = await storage.getFoodEntriesForDate(userId, date);
      const suggestion = await generateMealSuggestion(remainingCalories, currentTime, foodEntries);
      
      const aiSuggestion = await storage.createAiSuggestion({
        userId,
        date,
        suggestionType: "meal",
        content: suggestion,
        timeOfDay: currentTime,
      });
      
      res.json(aiSuggestion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/exercise-suggestion", async (req, res) => {
    try {
      const { userId, date, excessCalories } = req.body;
      
      const suggestion = await generateExerciseSuggestion(excessCalories);
      
      const aiSuggestion = await storage.createAiSuggestion({
        userId,
        date,
        suggestionType: "exercise",
        content: suggestion,
        timeOfDay: new Date().toTimeString().slice(0, 5),
      });
      
      res.json(aiSuggestion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.id, customerId);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: process.env.STRIPE_PRICE_ID || "price_1234567890", // Replace with actual price ID
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customerId, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Daily meal plans
  app.get("/api/daily-meal-plans/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const plans = await storage.getDailyMealPlans(parseInt(userId), date);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/generate-daily-meal-plans", async (req, res) => {
    try {
      const { userId, date, calorieGoal, proteinGoal, carbGoal, fatGoal, dietaryRestrictions } = req.body;
      
      // Check if plans already exist for this date
      const existingPlans = await storage.getDailyMealPlans(userId, date);
      if (existingPlans.length > 0) {
        return res.json(existingPlans);
      }

      // Generate new meal plans using AI
      const aiMealPlans = await generateDailyMealPlans(
        calorieGoal || 2000,
        proteinGoal || 150,
        carbGoal || 200,
        fatGoal || 70,
        dietaryRestrictions
      );

      // Save the generated plans to storage
      const savedPlans = [];
      for (const aiPlan of aiMealPlans) {
        const planData = {
          userId,
          date,
          mealType: aiPlan.mealType,
          title: aiPlan.title,
          description: aiPlan.description,
          estimatedCalories: aiPlan.estimatedCalories,
          estimatedProtein: aiPlan.estimatedProtein,
          estimatedCarbs: aiPlan.estimatedCarbs,
          estimatedFat: aiPlan.estimatedFat,
          ingredients: aiPlan.ingredients,
          instructions: aiPlan.instructions,
          isSelected: false,
        };
        
        const savedPlan = await storage.createDailyMealPlan(planData);
        savedPlans.push(savedPlan);
      }

      res.json(savedPlans);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate meal plans: " + error.message });
    }
  });

  app.post("/api/select-meal-plan", async (req, res) => {
    try {
      const { planId, isSelected } = req.body;
      const updatedPlan = await storage.updateMealPlanSelection(planId, isSelected);
      res.json(updatedPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
