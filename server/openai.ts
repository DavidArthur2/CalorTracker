import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4.1" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});

export interface FoodAnalysis {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  advice?: string;
}

export async function analyzeFood(base64Image: string): Promise<FoodAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert AI. Analyze food images and provide detailed nutritional information. 
          Respond with JSON in this exact format: 
          {
            "description": "Clear description of the food item(s)",
            "calories": number,
            "protein": number (in grams),
            "carbs": number (in grams), 
            "fat": number (in grams),
            "fiber": number (in grams, optional),
            "sugar": number (in grams, optional),
            "sodium": number (in mg, optional),
            "confidence": number (0-1, how confident you are in the analysis),
            "advice": "string (optional advice if image quality is poor or unclear)"
          }
          
          If the image is unclear or doesn't show food clearly, set confidence low and provide helpful advice in the advice field of what photo to make.
          Make reasonable estimates based on visible portion sizes. Be as accurate as possible with nutritional values.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this food image and provide detailed nutritional information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure required fields
    return {
      description: result.description || "Unknown food item",
      calories: Math.max(0, result.calories || 0),
      protein: Math.max(0, result.protein || 0),
      carbs: Math.max(0, result.carbs || 0),
      fat: Math.max(0, result.fat || 0),
      fiber: result.fiber || 0,
      sugar: result.sugar || 0,
      sodium: result.sodium || 0,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      advice: result.advice || undefined,
    };
  } catch (error) {
    console.error("OpenAI food analysis error:", error);
    throw new Error("Failed to analyze food image. Please try again.");
  }
}

export async function generateMealSuggestion(
  remainingCalories: number, 
  currentTime: string, 
  todaysMeals: any[]
): Promise<string> {
  try {
    const mealsContext = todaysMeals.map(meal => 
      `${meal.mealType}: ${meal.description} (${meal.calories} cal)`
    ).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a nutrition AI assistant. Provide personalized meal suggestions based on remaining calories, time of day, and what the user has already eaten. Keep suggestions practical, healthy, and specific. Respond in a friendly, conversational tone. Can contain description about the preparation too. The response always be in HTML formatted text, and can contain emojis to make it more engaging.`
        },
        {
          role: "user",
          content: `Current time: ${currentTime}
          Remaining calories for today: ${remainingCalories}
          Today's meals so far: ${mealsContext || "None yet"}
          
          Please suggest what I should eat next, considering the time of day and my remaining calorie budget. Be specific with food suggestions.`
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Consider having a balanced meal that fits your remaining calorie budget.";
  } catch (error) {
    console.error("OpenAI meal suggestion error:", error);
    throw new Error("Failed to generate meal suggestion. Please try again.");
  }
}

export async function generateExerciseSuggestion(excessCalories: number): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a fitness AI assistant. Provide practical exercise suggestions to burn excess calories. Give specific activities with approximate durations and calorie burn estimates. Keep suggestions realistic and achievable.`
        },
        {
          role: "user",
          content: `I've exceeded my daily calorie goal by ${excessCalories} calories. What exercises can I do to help balance this out? Please provide specific activities with estimated durations and calorie burn.`
        }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || "Consider some light physical activity like a 30-minute walk to help balance your calorie intake.";
  } catch (error) {
    console.error("OpenAI exercise suggestion error:", error);
    throw new Error("Failed to generate exercise suggestion. Please try again.");
  }
}

export interface VoiceAnalysis {
  isRelevant: boolean;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  confidence: number;
  message: string;
}

export interface MealPlan {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  ingredients: string[];
  instructions?: string;
}

export async function generateDailyMealPlans(
  calorieGoal: number,
  proteinGoal: number,
  carbGoal: number,
  fatGoal: number,
  dietaryRestrictions?: string
): Promise<MealPlan[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a nutrition AI assistant. Generate a complete daily meal plan with breakfast, lunch, dinner, and one healthy snack. Each meal should have realistic nutrition estimates and detailed preparation instructions. Respond with JSON in this exact format:
          {
            "meals": [
              {
                "mealType": "breakfast",
                "title": "Meal name",
                "description": "Brief appetizing description",
                "estimatedCalories": number,
                "estimatedProtein": number,
                "estimatedCarbs": number,
                "estimatedFat": number,
                "ingredients": ["ingredient1", "ingredient2"],
                "instructions": "Detailed preparation steps"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Generate a daily meal plan for someone with these nutrition goals:
          - Calories: ${calorieGoal}
          - Protein: ${proteinGoal}g
          - Carbs: ${carbGoal}g  
          - Fat: ${fatGoal}g
          ${dietaryRestrictions ? `- Dietary restrictions: ${dietaryRestrictions}` : ''}
          
          Create balanced, tasty meals that hit these targets. Include breakfast, lunch, dinner, and one healthy snack.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.meals || [];
  } catch (error) {
    console.error("OpenAI meal plan generation error:", error);
    throw new Error("Failed to generate meal plans. Please try again.");
  }
}

export async function analyzeVoiceInput(transcription: string): Promise<VoiceAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert AI that analyzes voice transcriptions about food consumption. 
          Determine if the user is describing food they ate and provide nutritional estimates.
          
          Respond with JSON in this exact format:
          {
            "isRelevant": boolean (true if describing food consumption, false otherwise),
            "description": "string (clear description of the food if relevant)",
            "calories": number (estimated calories if relevant),
            "protein": number (grams if relevant),
            "carbs": number (grams if relevant),
            "fat": number (grams if relevant),
            "fiber": number (grams, optional),
            "sugar": number (grams, optional),
            "sodium": number (mg, optional),
            "mealType": "breakfast|lunch|dinner|snack" (best guess based on context),
            "confidence": number (0-1, confidence in nutritional estimates),
            "message": "string (helpful response to user)"
          }
          
          If not food-related, set isRelevant to false and provide a helpful message asking them to describe food they ate.
          If food-related but unclear, set low confidence and ask for clarification in the message.
          Make reasonable estimates based on typical portion sizes when amounts aren't specified.`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as VoiceAnalysis;
  } catch (error) {
    console.error("OpenAI voice analysis error:", error);
    throw new Error("Failed to analyze voice input. Please try again.");
  }
}
