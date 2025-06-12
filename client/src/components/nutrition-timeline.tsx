import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Target, Zap } from "lucide-react";
import { format } from "date-fns";

interface NutritionTimelineEntry {
  id: number;
  timestamp: string;
  description: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

interface NutritionTimelineProps {
  entries: NutritionTimelineEntry[];
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

interface TimelineStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  avgCaloriesPerMeal: number;
}

export default function NutritionTimeline({ 
  entries, 
  calorieGoal, 
  proteinGoal, 
  carbGoal, 
  fatGoal 
}: NutritionTimelineProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Calculate timeline statistics
  const stats: TimelineStats = {
    totalCalories: entries.reduce((sum, entry) => sum + entry.calories, 0),
    totalProtein: entries.reduce((sum, entry) => sum + entry.protein, 0),
    totalCarbs: entries.reduce((sum, entry) => sum + entry.carbs, 0),
    totalFat: entries.reduce((sum, entry) => sum + entry.fat, 0),
    mealCount: entries.length,
    avgCaloriesPerMeal: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.calories, 0) / entries.length : 0
  };

  // Color coding based on nutritional density and meal type
  const getEntryColor = (entry: NutritionTimelineEntry) => {
    const caloriesPerGram = entry.calories / 100; // Assume 100g portion for calculation
    const proteinRatio = entry.protein / entry.calories * 100; // Protein percentage of calories
    
    // High protein, moderate calories = Green (healthy)
    if (proteinRatio > 20 && caloriesPerGram < 3) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    // High calories, low protein = Red (less optimal)
    else if (caloriesPerGram > 4 && proteinRatio < 10) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    // Balanced nutrition = Blue (good)
    else if (proteinRatio >= 15 && caloriesPerGram <= 4) {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
    // Default = Yellow (moderate)
    else {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-orange-500';
      case 'lunch': return 'bg-yellow-500';
      case 'dinner': return 'bg-purple-500';
      case 'snack': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍪';
      default: return '🍽️';
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 70) return 'bg-red-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Nutrition Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedTimeframe === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('today')}
            >
              Today
            </Button>
            <Button
              variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('week')}
            >
              Week
            </Button>
            <Button
              variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Daily Progress Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-700 font-medium text-sm">🔥 Calories</span>
              <Target className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-800">{stats.totalCalories}</div>
            <div className="text-xs text-red-600">Goal: {calorieGoal}</div>
            <Progress 
              value={(stats.totalCalories / calorieGoal) * 100} 
              className="mt-2 h-2"
              style={{ 
                backgroundColor: '#fecaca',
                '--progress-foreground': getProgressColor(stats.totalCalories, calorieGoal)
              } as any}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700 font-medium text-sm">💪 Protein</span>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">{Math.round(stats.totalProtein)}g</div>
            <div className="text-xs text-blue-600">Goal: {proteinGoal}g</div>
            <Progress 
              value={(stats.totalProtein / proteinGoal) * 100} 
              className="mt-2 h-2"
              style={{ 
                backgroundColor: '#bfdbfe',
                '--progress-foreground': getProgressColor(stats.totalProtein, proteinGoal)
              } as any}
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-700 font-medium text-sm">⚡ Carbs</span>
              <Target className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-800">{Math.round(stats.totalCarbs)}g</div>
            <div className="text-xs text-yellow-600">Goal: {carbGoal}g</div>
            <Progress 
              value={(stats.totalCarbs / carbGoal) * 100} 
              className="mt-2 h-2"
              style={{ 
                backgroundColor: '#fef3c7',
                '--progress-foreground': getProgressColor(stats.totalCarbs, carbGoal)
              } as any}
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-700 font-medium text-sm">🥑 Fat</span>
              <Target className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-800">{Math.round(stats.totalFat)}g</div>
            <div className="text-xs text-orange-600">Goal: {fatGoal}g</div>
            <Progress 
              value={(stats.totalFat / fatGoal) * 100} 
              className="mt-2 h-2"
              style={{ 
                backgroundColor: '#fed7aa',
                '--progress-foreground': getProgressColor(stats.totalFat, fatGoal)
              } as any}
            />
          </div>
        </div>

        {/* Timeline Entries */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Timeline ({entries.length} meals)
          </h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No meals logged yet today</p>
              <p className="text-sm">Start tracking your nutrition!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getEntryColor(entry)}`}
                >
                  {/* Timeline connector */}
                  {index < entries.length - 1 && (
                    <div className="absolute left-6 -bottom-3 w-0.5 h-6 bg-gray-300"></div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Time indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${getMealTypeColor(entry.mealType)} flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="text-xs font-medium text-gray-600 mt-1">
                          {formatTime(entry.timestamp)}
                        </div>
                      </div>

                      {/* Entry content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {getMealTypeIcon(entry.mealType)} {entry.mealType}
                          </Badge>
                          {entry.imageUrl && entry.imageUrl.length === 2 && (
                            <span className="text-xl">{entry.imageUrl}</span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1">{entry.description}</h4>
                        
                        {/* Nutrition breakdown */}
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-red-600">
                            <span className="font-medium">{entry.calories}</span> cal
                          </div>
                          <div className="text-blue-600">
                            <span className="font-medium">{Math.round(entry.protein)}</span>g protein
                          </div>
                          <div className="text-yellow-600">
                            <span className="font-medium">{Math.round(entry.carbs)}</span>g carbs
                          </div>
                          <div className="text-orange-600">
                            <span className="font-medium">{Math.round(entry.fat)}</span>g fat
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nutrition quality indicator */}
                    <div className="flex flex-col items-end space-y-1">
                      <div className="text-xs font-medium">Quality</div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < Math.round((entry.protein / entry.calories * 100) / 5)
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Statistics */}
        {entries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-800">{stats.mealCount}</div>
                <div className="text-gray-600">Meals Today</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-800">{Math.round(stats.avgCaloriesPerMeal)}</div>
                <div className="text-gray-600">Avg Cal/Meal</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-800">
                  {Math.round((stats.totalCalories / calorieGoal) * 100)}%
                </div>
                <div className="text-gray-600">Goal Progress</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-800">
                  {Math.round((stats.totalProtein / stats.totalCalories) * 100 * 4)}%
                </div>
                <div className="text-gray-600">Protein Ratio</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}