import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Target, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUser = { id: 1 };

export default function CalendarPlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  });

  const dateString = selectedDate.toISOString().split('T')[0];

  const { data: calorieGoal } = useQuery({
    queryKey: [`/api/calorie-goal/${mockUser.id}/${dateString}`],
  });

  const { data: foodEntries = [] } = useQuery({
    queryKey: [`/api/food-entries/${mockUser.id}/${dateString}`],
  });

  const { data: aiSuggestions = [] } = useQuery({
    queryKey: [`/api/ai-suggestions/${mockUser.id}/${dateString}`],
  });

  const setGoalMutation = useMutation({
    mutationFn: async (goal: any) => {
      const response = await apiRequest('POST', '/api/calorie-goal', {
        ...goal,
        userId: mockUser.id,
        date: dateString,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/calorie-goal/${mockUser.id}/${dateString}`] });
      toast({
        title: "Goal saved!",
        description: "Your daily nutrition goal has been set.",
      });
      setShowGoalForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getMealSuggestionMutation = useMutation({
    mutationFn: async () => {
      const totalCalories = foodEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0);
      const remainingCalories = (calorieGoal?.calories || 2000) - totalCalories;
      const currentTime = new Date().toTimeString().slice(0, 5);
      
      const response = await apiRequest('POST', '/api/meal-suggestion', {
        userId: mockUser.id,
        date: dateString,
        remainingCalories,
        currentTime,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-suggestions/${mockUser.id}/${dateString}`] });
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

  const handleSaveGoal = () => {
    setGoalMutation.mutate(goalForm);
  };

  const totalCalories = foodEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0);
  const goalCalories = calorieGoal?.calories || 2000;
  const remainingCalories = goalCalories - totalCalories;

  const isToday = dateString === new Date().toISOString().split('T')[0];
  const isFuture = selectedDate > new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Calendar Planning</h2>
              <p className="text-sm text-muted-foreground">Plan your nutrition goals and meals</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          
          {/* Calendar and Date Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Selected Date Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {isToday && <Badge variant="default">Today</Badge>}
                    {isFuture && <Badge variant="secondary">Future</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Calorie Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{goalCalories}</div>
                    <div className="text-sm text-muted-foreground">Goal</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{totalCalories}</div>
                    <div className="text-sm text-muted-foreground">Consumed</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${remainingCalories >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {Math.abs(remainingCalories)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {remainingCalories >= 0 ? 'Remaining' : 'Over'}
                    </div>
                  </div>
                </div>

                {/* Meal Count */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-foreground">Meals logged</span>
                  <Badge variant="outline">{foodEntries.length} entries</Badge>
                </div>

                {/* AI Suggestions Count */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-foreground">AI suggestions</span>
                  <Badge variant="outline">{aiSuggestions.length} suggestions</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Goal Setting */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Daily Nutrition Goal
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setGoalForm({
                      calories: calorieGoal?.calories || 2000,
                      protein: calorieGoal?.protein || 150,
                      carbs: calorieGoal?.carbs || 200,
                      fat: calorieGoal?.fat || 70,
                    });
                    setShowGoalForm(!showGoalForm);
                  }}
                >
                  {showGoalForm ? 'Cancel' : 'Edit Goal'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showGoalForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={goalForm.calories}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={goalForm.protein}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={goalForm.carbs}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={goalForm.fat}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveGoal} disabled={setGoalMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Goal
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">{calorieGoal?.calories || 2000}</div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">{calorieGoal?.protein || 150}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">{calorieGoal?.carbs || 200}g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">{calorieGoal?.fat || 70}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Meal Planning */}
          {isToday && (
            <Card>
              <CardHeader>
                <CardTitle>AI Meal Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get personalized meal suggestions based on your remaining calories and preferences.
                </p>
                <Button 
                  onClick={() => getMealSuggestionMutation.mutate()}
                  disabled={getMealSuggestionMutation.isPending}
                  className="w-full"
                >
                  {getMealSuggestionMutation.isPending ? (
                    <>Generating suggestion...</>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Get Meal Suggestion
                    </>
                  )}
                </Button>
                
                {/* Recent AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Suggestions:</h4>
                    {aiSuggestions.slice(0, 3).map((suggestion: any) => (
                      <div key={suggestion.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{suggestion.suggestionType}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.timeOfDay}
                          </span>
                        </div>
                        <p className="text-sm">{suggestion.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}