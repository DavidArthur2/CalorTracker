import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyProgressProps {
  goal: MacroData;
  consumed: MacroData;
}

export default function DailyProgress({ goal, consumed }: DailyProgressProps) {
  const calorieProgress = Math.min(100, (consumed.calories / goal.calories) * 100);
  const proteinProgress = Math.min(100, (consumed.protein / goal.protein) * 100);
  const carbsProgress = Math.min(100, (consumed.carbs / goal.carbs) * 100);
  const fatProgress = Math.min(100, (consumed.fat / goal.fat) * 100);
  
  const remainingCalories = goal.calories - consumed.calories;
  const circumference = 2 * Math.PI * 64; // radius = 64
  const strokeDashoffset = circumference - (calorieProgress / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Progress</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            Edit Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Circular Progress for Calories */}
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 progress-ring" viewBox="0 0 144 144">
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none"
                className="text-muted"
              />
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{consumed.calories.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">of {goal.calories.toLocaleString()} cal</span>
              <span className={`text-xs font-medium ${remainingCalories >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {remainingCalories >= 0 ? `${remainingCalories} remaining` : `${Math.abs(remainingCalories)} over`}
              </span>
            </div>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Progress value={carbsProgress} className="mb-2" />
            <p className="text-sm font-medium text-foreground">Carbs</p>
            <p className="text-xs text-muted-foreground">
              {consumed.carbs.toFixed(1)}g of {goal.carbs}g
            </p>
          </div>
          
          <div className="text-center">
            <Progress value={proteinProgress} className="mb-2" />
            <p className="text-sm font-medium text-foreground">Protein</p>
            <p className="text-xs text-muted-foreground">
              {consumed.protein.toFixed(1)}g of {goal.protein}g
            </p>
          </div>
          
          <div className="text-center">
            <Progress value={fatProgress} className="mb-2" />
            <p className="text-sm font-medium text-foreground">Fat</p>
            <p className="text-xs text-muted-foreground">
              {consumed.fat.toFixed(1)}g of {goal.fat}g
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
