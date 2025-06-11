export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface DailyGoal extends NutritionData {
  date: string;
}

export interface FoodAnalysis extends NutritionData {
  description: string;
  confidence: number;
  advice?: string;
}

export const DEFAULT_GOALS: NutritionData = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
};

export function calculateMacroPercentages(nutrition: NutritionData) {
  const totalCalories = nutrition.calories;
  const proteinCalories = nutrition.protein * 4;
  const carbCalories = nutrition.carbs * 4;
  const fatCalories = nutrition.fat * 9;
  
  return {
    protein: totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0,
    carbs: totalCalories > 0 ? (carbCalories / totalCalories) * 100 : 0,
    fat: totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0,
  };
}

export function calculateProgress(consumed: NutritionData, goal: NutritionData) {
  return {
    calories: Math.min(100, (consumed.calories / goal.calories) * 100),
    protein: Math.min(100, (consumed.protein / goal.protein) * 100),
    carbs: Math.min(100, (consumed.carbs / goal.carbs) * 100),
    fat: Math.min(100, (consumed.fat / goal.fat) * 100),
  };
}

export function getRemainingNutrition(consumed: NutritionData, goal: NutritionData): NutritionData {
  return {
    calories: goal.calories - consumed.calories,
    protein: goal.protein - consumed.protein,
    carbs: goal.carbs - consumed.carbs,
    fat: goal.fat - consumed.fat,
    fiber: (goal.fiber || 0) - (consumed.fiber || 0),
    sugar: (goal.sugar || 0) - (consumed.sugar || 0),
    sodium: (goal.sodium || 0) - (consumed.sodium || 0),
  };
}

export function getMealTypeFromTime(time: string = new Date().toTimeString().slice(0, 5)): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = parseInt(time.split(':')[0]);
  
  if (hour >= 5 && hour < 11) {
    return "breakfast";
  } else if (hour >= 11 && hour < 15) {
    return "lunch";
  } else if (hour >= 17 && hour < 22) {
    return "dinner";
  } else {
    return "snack";
  }
}

export function formatNutritionValue(value: number, unit: string = ""): string {
  if (value === 0) return `0${unit}`;
  if (value < 1) return `${value.toFixed(1)}${unit}`;
  if (value < 10) return `${value.toFixed(1)}${unit}`;
  return `${Math.round(value)}${unit}`;
}

export function getTotalNutrition(entries: any[]): NutritionData {
  return entries.reduce((total, entry) => ({
    calories: total.calories + (entry.calories || 0),
    protein: total.protein + parseFloat(entry.protein || 0),
    carbs: total.carbs + parseFloat(entry.carbs || 0),
    fat: total.fat + parseFloat(entry.fat || 0),
    fiber: total.fiber + parseFloat(entry.fiber || 0),
    sugar: total.sugar + parseFloat(entry.sugar || 0),
    sodium: total.sodium + parseFloat(entry.sodium || 0),
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });
}

export function validateNutritionData(data: Partial<NutritionData>): boolean {
  const required = ['calories', 'protein', 'carbs', 'fat'];
  return required.every(field => 
    data[field as keyof NutritionData] !== undefined && 
    data[field as keyof NutritionData]! >= 0
  );
}

export function getCalorieStatus(consumed: number, goal: number): "under" | "on-track" | "over" {
  const percentage = (consumed / goal) * 100;
  
  if (percentage < 80) return "under";
  if (percentage > 110) return "over";
  return "on-track";
}

export const MACRO_COLORS = {
  carbs: "hsl(217, 91%, 60%)",
  protein: "hsl(43, 96%, 56%)",
  fat: "hsl(0, 84%, 60%)",
  calories: "hsl(158, 64%, 52%)",
} as const;
