import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import DailyProgress from "@/components/daily-progress";
import MealsTimeline from "@/components/meals-timeline";
import AiSuggestions from "@/components/ai-suggestions";
import DailyMealPlans from "@/components/daily-meal-plans";
import FoodScannerModal from "@/components/food-scanner-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Crown, Bell, Lightbulb, Activity } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Mock user for demo (in real app, this would come from authentication)
const mockUser = {
  id: 1,
  username: "demo_user",
  email: "demo@example.com",
  subscriptionStatus: "trial" as const,
  trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
};

export default function Dashboard() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: calorieGoal } = useQuery({
    queryKey: [`/api/calorie-goal/${mockUser.id}/${currentDate}`],
  });

  const { data: foodEntries = [] } = useQuery({
    queryKey: [`/api/food-entries/${mockUser.id}/${currentDate}`],
  });

  const { data: aiSuggestions = [] } = useQuery({
    queryKey: [`/api/ai-suggestions/${mockUser.id}/${currentDate}`],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const foodEntriesArray: any[] = Array.isArray(foodEntries) ? foodEntries : [];
  const aiSuggestionsArray: any[] = Array.isArray(aiSuggestions) ? aiSuggestions : [];
  
  const totalCalories = foodEntriesArray.reduce((sum: number, entry: any) => sum + (entry?.calories || 0), 0);
  const goalData = {
    calories: (calorieGoal as any)?.calories || 2000,
    protein: (calorieGoal as any)?.protein || 150,
    carbs: (calorieGoal as any)?.carbs || 200,
    fat: (calorieGoal as any)?.fat || 70,
  };
  const remainingCalories = Number(goalData.calories) - totalCalories;
  const isTrialExpiring = mockUser.subscriptionStatus === "trial";
  const daysRemaining = isTrialExpiring ? 
    Math.ceil((new Date(mockUser.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const getMealSuggestionMutation = useMutation({
    mutationFn: async () => {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const response = await apiRequest('POST', '/api/meal-suggestion', {
        userId: mockUser.id,
        date: currentDate,
        remainingCalories,
        currentTime,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-suggestions/${mockUser.id}/${currentDate}`] });
      toast({
        title: "AI suggestion generated!",
        description: "Check your new meal recommendation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to get suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getExerciseSuggestionMutation = useMutation({
    mutationFn: async () => {
      const excessCalories = Math.abs(remainingCalories);
      const response = await apiRequest('POST', '/api/exercise-suggestion', {
        userId: mockUser.id,
        date: currentDate,
        excessCalories,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-suggestions/${mockUser.id}/${currentDate}`] });
      toast({
        title: "Exercise suggestion generated!",
        description: "Check your new workout recommendation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to get exercise suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Today's Nutrition</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isTrialExpiring && (
                <div className="hidden md:block trial-status-gradient px-3 py-1 rounded-full text-white text-sm">
                  Free Trial • {daysRemaining} days left
                </div>
              )}
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 space-y-6">
          
          {/* Daily Progress Overview */}
          <DailyProgress 
            goal={goalData}
            consumed={{
              calories: totalCalories,
              protein: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.protein || 0), 0),
              carbs: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.carbs || 0), 0),
              fat: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.fat || 0), 0),
            }}
          />

          {/* AI Suggestions */}
          {aiSuggestionsArray.length > 0 && (
            <AiSuggestions suggestions={aiSuggestionsArray} />
          )}

          {/* AI Meal Suggestion */}
          {remainingCalories > 100 && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                    <Lightbulb className="text-blue-600 h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Meal Suggestion</h3>
                    <p className="text-blue-700 dark:text-blue-200 text-sm mb-3">
                      You have {remainingCalories} calories remaining. Get a personalized meal suggestion based on the time of day.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => getMealSuggestionMutation.mutate()}
                      disabled={getMealSuggestionMutation.isPending}
                    >
                      {getMealSuggestionMutation.isPending ? "Getting suggestion..." : "Get Meal Suggestion"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Food Scanner Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Scan Your Food</h3>
                  <p className="text-sm text-muted-foreground mb-4">Take a photo and let AI analyze the nutrition</p>
                  <Button onClick={() => setScannerOpen(true)} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-secondary h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Manual Entry</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add food manually from our database</p>
                  <Button variant="secondary" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Search Foods
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Meals */}
          <MealsTimeline entries={foodEntriesArray} userId={mockUser.id} date={currentDate} />

          {/* Exercise Recommendations (shown when calories exceeded) */}
          {remainingCalories < -50 && (
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-2">
                    <Activity className="text-orange-600 h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Burn Extra Calories</h3>
                    <p className="text-orange-700 dark:text-orange-200 text-sm mb-3">
                      You've exceeded your daily goal by {Math.abs(remainingCalories)} calories. Consider some physical activity to help balance it out.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => getExerciseSuggestionMutation.mutate()}
                      disabled={getExerciseSuggestionMutation.isPending}
                    >
                      {getExerciseSuggestionMutation.isPending ? "Getting suggestions..." : "Get Exercise Suggestions"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Prompt */}
          {isTrialExpiring && (
            <Card className="subscription-gradient text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Unlock Full Potential</h3>
                  <p className="text-white/90 mb-4">Get unlimited AI food analysis, advanced insights, and meal planning</p>
                  
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Free Trial</span>
                      <span className="font-semibold">{daysRemaining} days remaining</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.max(0, (daysRemaining / 3) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white text-gray-900 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">$10</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    <ul className="text-left text-sm mt-3 space-y-1">
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited AI food scans</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced nutrition insights</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Meal planning & recommendations</li>
                      <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Progress tracking & analytics</li>
                    </ul>
                  </div>

                  <Link href="/subscription">
                    <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                      Start Subscription - $10/month
                    </Button>
                  </Link>
                  <p className="text-xs text-white/70 mt-2">Cancel anytime • 30-day money-back guarantee</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Food Scanner Modal */}
      <FoodScannerModal 
        open={scannerOpen} 
        onOpenChange={setScannerOpen}
        userId={mockUser.id}
        date={currentDate}
      />
    </div>
  );
}
