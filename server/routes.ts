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

// Configure multer for file uploads
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Demo stock meal icons
const DEMO_MEAL_ICONS = [
  { id: 'pizza', name: 'Pizza', icon: '🍕', category: 'main' },
  { id: 'burger', name: 'Burger', icon: '🍔', category: 'main' },
  { id: 'salad', name: 'Salad', icon: '🥗', category: 'main' },
  { id: 'chicken', name: 'Chicken', icon: '🍗', category: 'protein' },
  { id: 'fish', name: 'Fish', icon: '🐟', category: 'protein' },
  { id: 'apple', name: 'Apple', icon: '🍎', category: 'fruit' },
  { id: 'banana', name: 'Banana', icon: '🍌', category: 'fruit' },
  { id: 'bread', name: 'Bread', icon: '🍞', category: 'carb' },
  { id: 'rice', name: 'Rice', icon: '🍚', category: 'carb' },
  { id: 'milk', name: 'Milk', icon: '🥛', category: 'drink' },
  { id: 'water', name: 'Water', icon: '💧', category: 'drink' },
  { id: 'coffee', name: 'Coffee', icon: '☕', category: 'drink' },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup security middleware
  setupSecurity(app);
  
  // Setup email/password authentication
  setupAuth(app);
  
  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  // Demo data endpoints for guest mode
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
          iconName: "apple"
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
          iconName: "salad"
        }
      ];
      res.json(demoEntries);
    } catch (error) {
      console.error("Error fetching demo entries:", error);
      res.status(500).json({ message: "Failed to fetch demo entries" });
    }
  });

  app.get('/api/demo/suggestions', async (req, res) => {
    try {
      const demoSuggestions = [
        {
          id: 1,
          suggestionType: "meal",
          content: "Try adding more protein to your breakfast for better satiety",
          timeOfDay: "morning",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          suggestionType: "exercise",
          content: "Consider a 20-minute walk after lunch to aid digestion",
          timeOfDay: "afternoon",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(demoSuggestions);
    } catch (error) {
      console.error("Error fetching demo suggestions:", error);
      res.status(500).json({ message: "Failed to fetch demo suggestions" });
    }
  });

  // Stock meal icons endpoint
  app.get('/api/meal-icons', async (req, res) => {
    try {
      res.json(DEMO_MEAL_ICONS);
    } catch (error) {
      console.error("Error fetching meal icons:", error);
      res.status(500).json({ message: "Failed to fetch meal icons" });
    }
  });

  // User preferences routes
  app.get('/api/user/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertUserPreferencesSchema.parse({ ...req.body, userId });
      
      const existingPreferences = await storage.getUserPreferences(userId);
      let preferences;
      
      if (existingPreferences) {
        preferences = await storage.updateUserPreferences(userId, validatedData);
      } else {
        preferences = await storage.createUserPreferences(validatedData);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Calorie goals routes
  app.get('/api/calorie-goals/:date', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.params;
      const goal = await storage.getCalorieGoal(userId, date);
      res.json(goal);
    } catch (error) {
      console.error("Error fetching calorie goal:", error);
      res.status(500).json({ message: "Failed to fetch calorie goal" });
    }
  });

  app.post('/api/calorie-goals', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCalorieGoalSchema.parse({ ...req.body, userId });
      
      const existingGoal = await storage.getCalorieGoal(userId, validatedData.date);
      let goal;
      
      if (existingGoal) {
        goal = await storage.updateCalorieGoal(userId, validatedData.date, validatedData);
      } else {
        goal = await storage.setCalorieGoal(validatedData);
      }
      
      res.json(goal);
    } catch (error) {
      console.error("Error setting calorie goal:", error);
      res.status(500).json({ message: "Failed to set calorie goal" });
    }
  });

  // Food entries routes
  app.get('/api/food-entries/:date', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.params;
      const entries = await storage.getFoodEntriesForDate(userId, date);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching food entries:", error);
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  app.post('/api/food-entries', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertFoodEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createFoodEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating food entry:", error);
      res.status(500).json({ message: "Failed to create food entry" });
    }
  });

  app.delete('/api/food-entries/:id', requireAuth, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getFoodEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      
      // Ensure user owns the entry
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteFoodEntry(entryId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting food entry:", error);
      res.status(500).json({ message: "Failed to delete food entry" });
    }
  });

  // AI suggestions routes
  app.get('/api/ai-suggestions/:date', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.params;
      const suggestions = await storage.getAiSuggestionsForDate(userId, date);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Daily meal plans routes
  app.get('/api/meal-plans/:date', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.params;
      const plans = await storage.getDailyMealPlans(userId, date);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post('/api/meal-plans/generate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.body;
      const plans = await storage.generateDailyMealPlans(userId, date);
      res.json(plans);
    } catch (error) {
      console.error("Error generating meal plans:", error);
      res.status(500).json({ message: "Failed to generate meal plans" });
    }
  });

  app.patch('/api/meal-plans/:id/selection', requireAuth, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const { isSelected } = req.body;
      const plan = await storage.updateMealPlanSelection(planId, isSelected);
      res.json(plan);
    } catch (error) {
      console.error("Error updating meal plan selection:", error);
      res.status(500).json({ message: "Failed to update meal plan selection" });
    }
  });

  // Food photo analysis route
  app.post('/api/analyze-food', requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Process and optimize the image
      const processedImagePath = path.join(uploadsDir, `processed_${req.file.filename}.webp`);
      await sharp(req.file.path)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(processedImagePath);

      // Read the processed image as base64
      const imageBuffer = fs.readFileSync(processedImagePath);
      const base64Image = imageBuffer.toString('base64');

      // Analyze the food using OpenAI
      const analysis = await analyzeFood(base64Image);

      // Create food entry
      const userId = req.user.id;
      const date = req.body.date || new Date().toISOString().split('T')[0];
      
      const foodEntry = await storage.createFoodEntry({
        userId,
        date,
        mealType: req.body.mealType || 'snack',
        description: analysis.description,
        calories: analysis.calories,
        protein: analysis.protein.toString(),
        carbs: analysis.carbs.toString(),
        fat: analysis.fat.toString(),
        fiber: analysis.fiber?.toString(),
        sugar: analysis.sugar?.toString(),
        sodium: analysis.sodium?.toString(),
        imageUrl: `/uploads/processed_${req.file.filename}.webp`
      });

      // Clean up original uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        analysis,
        foodEntry
      });
    } catch (error) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ message: "Failed to analyze food" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}