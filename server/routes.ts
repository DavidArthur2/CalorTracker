import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import { storage } from "./storage";
import { analyzeFood, generateMealSuggestion, generateExerciseSuggestion } from "./openai";
import { insertFoodEntrySchema, insertCalorieGoalSchema, insertAiSuggestionSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User authentication (simplified for demo)
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper session management
      res.json({ user: { id: user.id, username: user.username, email: user.email, subscriptionStatus: user.subscriptionStatus, trialEndsAt: user.trialEndsAt } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/register", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
