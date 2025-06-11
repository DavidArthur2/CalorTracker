import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Clock, Users, Check, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyMealPlan {
  id: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  ingredients: string[];
  instructions?: string;
  isSelected: boolean;
}

interface DailyMealPlansProps {
  userId: number;
  date: string;
  calorieGoal?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack"
};

const mealTypeColors = {
  breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  snack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
};

export default function DailyMealPlans({ 
  userId, 
  date, 
  calorieGoal = 2000, 
  proteinGoal = 150, 
  carbGoal = 200, 
  fatGoal = 70 
}: DailyMealPlansProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const { data: mealPlans = [], isLoading } = useQuery({
    queryKey: [`/api/daily-meal-plans/${userId}/${date}`],
  });

  const generatePlansMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate-daily-meal-plans', {
        userId,
        date,
        calorieGoal,
        proteinGoal,
        carbGoal,
        fatGoal,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/daily-meal-plans/${userId}/${date}`] });
      toast({
        title: "Daily meal plan generated!",
        description: "Your personalized meal plan is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectPlanMutation = useMutation({
    mutationFn: async ({ planId, isSelected }: { planId: number; isSelected: boolean }) => {
      const response = await apiRequest('POST', '/api/select-meal-plan', {
        planId,
        isSelected,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/daily-meal-plans/${userId}/${date}`] });
      toast({
        title: "Meal plan updated!",
        description: "Your meal selection has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update selection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: number, currentlySelected: boolean) => {
    selectPlanMutation.mutate({ planId, isSelected: !currentlySelected });
  };

  const handleGeneratePlans = () => {
    generatePlansMutation.mutate();
  };

  const mealPlansArray: DailyMealPlan[] = Array.isArray(mealPlans) ? mealPlans : [];
  const totalSelectedCalories = mealPlansArray
    .filter(plan => plan.isSelected)
    .reduce((sum, plan) => sum + plan.estimatedCalories, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meal plans...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ChefHat className="mr-2 h-5 w-5" />
            AI Daily Meal Plan
          </CardTitle>
          <div className="flex items-center space-x-2">
            {mealPlansArray.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalSelectedCalories} / {calorieGoal} cal selected
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGeneratePlans}
              disabled={generatePlansMutation.isPending}
            >
              {generatePlansMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {mealPlansArray.length > 0 ? 'Regenerate' : 'Generate Plan'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealPlansArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No meal plan generated yet</p>
            <p className="text-sm">Click "Generate Plan" to create your personalized daily meal plan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mealPlansArray.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={mealTypeColors[plan.mealType]}>
                      {mealTypeLabels[plan.mealType]}
                    </Badge>
                    <h4 className="font-semibold text-foreground">{plan.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">
                      {plan.estimatedCalories} cal
                    </div>
                    <Button
                      variant={plan.isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectPlan(plan.id, plan.isSelected)}
                      disabled={selectPlanMutation.isPending}
                    >
                      {plan.isSelected ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{plan.description}</p>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium">{plan.estimatedCalories}</div>
                    <div className="text-muted-foreground">cal</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium">{plan.estimatedProtein}g</div>
                    <div className="text-muted-foreground">protein</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium">{plan.estimatedCarbs}g</div>
                    <div className="text-muted-foreground">carbs</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium">{plan.estimatedFat}g</div>
                    <div className="text-muted-foreground">fat</div>
                  </div>
                </div>

                {expandedPlan === plan.id && (
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <h5 className="font-medium mb-2">Ingredients:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.instructions && (
                      <div>
                        <h5 className="font-medium mb-2">Instructions:</h5>
                        <p className="text-sm text-muted-foreground">{plan.instructions}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="w-full"
                >
                  {expandedPlan === plan.id ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}