import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import DailyProgress from "@/components/daily-progress";
import MealsTimeline from "@/components/meals-timeline";
import AiSuggestions from "@/components/ai-suggestions";
import DailyMealPlans from "@/components/daily-meal-plans";
import FoodScannerModal from "@/components/food-scanner-modal";
import VoiceInput from "@/components/voice-input";
import ManualFoodEntry from "@/components/manual-food-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Crown, Bell, Lightbulb, Activity, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
// import OnboardingTour, { useOnboarding } from "@/components/onboarding-tour";

export default function Dashboard() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedAction, setSelectedAction] = useState<'scan' | 'voice' | 'manual'>('scan');
  const { user } = useAuth();
  // const { showTour, completeTour, skipTour } = useOnboarding();

  // Auto-dismiss welcome message after 3 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const { data: calorieGoal } = useQuery({
    queryKey: [`/api/calorie-goal/${user?.id}/${currentDate}`],
    enabled: !!user?.id,
  });

  const { data: foodEntries = [] } = useQuery({
    queryKey: [`/api/food-entries/${user?.id}/${currentDate}`],
    enabled: !!user?.id,
  });

  const { data: aiSuggestions = [] } = useQuery({
    queryKey: [`/api/ai-suggestions/${user?.id}/${currentDate}`],
    enabled: !!user?.id,
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
  // Remove trial logic for now since we don't have subscription data
  const isTrialExpiring = false;
  const daysRemaining = 0;

  const getMealSuggestionMutation = useMutation({
    mutationFn: async () => {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const response = await apiRequest('POST', '/api/meal-suggestion', {
        userId: user?.id,
        date: currentDate,
        remainingCalories,
        currentTime,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-suggestions/${user?.id}/${currentDate}`] });
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
        userId: user?.id,
        date: currentDate,
        excessCalories,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-suggestions/${user?.id}/${currentDate}`] });
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
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                </h2>
                {showWelcome && (
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                )}
              </div>
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
          <div data-tour="daily-progress">
            <DailyProgress 
              goal={goalData}
              consumed={{
                calories: totalCalories,
                protein: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.protein || 0), 0),
                carbs: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.carbs || 0), 0),
                fat: foodEntriesArray.reduce((sum: number, entry: any) => sum + parseFloat(entry?.fat || 0), 0),
              }}
            />
          </div>

          {/* Daily Meal Plans */}
          <DailyMealPlans 
            userId={user?.id}
            date={currentDate}
            calorieGoal={goalData.calories}
            proteinGoal={goalData.protein}
            carbGoal={goalData.carbs}
            fatGoal={goalData.fat}
          />

          {/* AI Suggestions */}
          {aiSuggestionsArray.length > 0 && (
            <div data-tour="ai-suggestions">
              <AiSuggestions suggestions={aiSuggestionsArray} />
            </div>
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
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold text-gray-800 dark:text-gray-200">
                Log Your Food
              </CardTitle>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred method to track your meal
              </p>
            </CardHeader>
            <CardContent>
              {/* Action Selection Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Button
                  variant={selectedAction === 'scan' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('scan')}
                  className={`flex-1 h-12 transition-all duration-200 ${
                    selectedAction === 'scan'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                  }`}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Scan Food
                </Button>
                <Button
                  variant={selectedAction === 'voice' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('voice')}
                  className={`flex-1 h-12 transition-all duration-200 ${
                    selectedAction === 'voice'
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                      : 'border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20'
                  }`}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Voice Input
                </Button>
                <Button
                  variant={selectedAction === 'manual' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('manual')}
                  className={`flex-1 h-12 transition-all duration-200 ${
                    selectedAction === 'manual'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg'
                      : 'border-purple-300 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                  }`}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Manual Entry
                </Button>
              </div>

              {/* Selected Action Content */}
              {selectedAction === 'scan' && (
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-blue-600 h-10 w-10" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-lg">Scan Your Food</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Take a photo and let AI analyze the nutrition content automatically</p>
                  <Button 
                    onClick={() => setScannerOpen(true)} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 h-12"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Scanning
                  </Button>
                </div>
              )}

              {selectedAction === 'voice' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 p-4">
                  <VoiceInput onSuccess={() => {
                    queryClient.invalidateQueries({ 
                      queryKey: [`/api/food-entries/${user?.id}/${currentDate}`] 
                    });
                  }} />
                </div>
              )}

              {selectedAction === 'manual' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                  <ManualFoodEntry 
                    userId={user?.id || 0} 
                    date={currentDate} 
                    onSuccess={() => {
                      queryClient.invalidateQueries({ 
                        queryKey: [`/api/food-entries/${user?.id}/${currentDate}`] 
                      });
                    }} 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <MealsTimeline entries={foodEntriesArray} userId={user?.id} date={currentDate} />

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
        userId={user?.id}
        date={currentDate}
      />

      {/* Onboarding Tour - Disabled */}
      {/* <OnboardingTour
        isOpen={showTour}
        onClose={skipTour}
        onComplete={completeTour}
      /> */}
    </div>
  );
}
