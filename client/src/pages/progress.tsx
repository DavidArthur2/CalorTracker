import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Calendar, Target, Award } from "lucide-react";

const mockUser = { id: 1 };

export default function Progress() {
  const [timeRange, setTimeRange] = useState("7"); // days

  // Generate date range for the selected period
  const getDatesInRange = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = getDatesInRange(parseInt(timeRange));

  // Fetch data for all dates (simplified for demo)
  const { data: recentEntries = [] } = useQuery({
    queryKey: [`/api/food-entries/${mockUser.id}/${new Date().toISOString().split('T')[0]}`],
  });

  const { data: todayGoal } = useQuery({
    queryKey: [`/api/calorie-goal/${mockUser.id}/${new Date().toISOString().split('T')[0]}`],
  });

  // Calculate progress metrics (simplified demo data)
  const entriesArray = Array.isArray(recentEntries) ? recentEntries : [];
  const totalCaloriesToday = entriesArray.reduce((sum: number, entry: any) => sum + (entry?.calories || 0), 0);
  const goalCalories = todayGoal?.calories || 2000;
  const weeklyAverage = Math.round(totalCaloriesToday * 0.9); // Simplified calculation
  
  const progressMetrics = {
    calorieGoalHit: Math.round((totalCaloriesToday / goalCalories) * 100),
    averageCalories: weeklyAverage,
    streakDays: 5, // Demo data
    totalEntries: entriesArray.length + 24, // Demo data
  };

  const weeklyData = [
    { day: 'Mon', calories: 1950, goal: 2000 },
    { day: 'Tue', calories: 2100, goal: 2000 },
    { day: 'Wed', calories: 1800, goal: 2000 },
    { day: 'Thu', calories: 2050, goal: 2000 },
    { day: 'Fri', calories: 1900, goal: 2000 },
    { day: 'Sat', calories: 2200, goal: 2000 },
    { day: 'Sun', calories: totalCaloriesToday, goal: goalCalories },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Progress Tracking</h2>
              <p className="text-sm text-muted-foreground">Monitor your nutrition journey</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{progressMetrics.calorieGoalHit}%</p>
                    <p className="text-xs text-muted-foreground">Goal Achievement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">{progressMetrics.averageCalories}</p>
                    <p className="text-xs text-muted-foreground">Avg Daily Calories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{progressMetrics.streakDays}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-info" />
                  <div>
                    <p className="text-2xl font-bold">{progressMetrics.totalEntries}</p>
                    <p className="text-xs text-muted-foreground">Total Meals Logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calorie Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((data, index) => {
                  const percentage = (data.calories / data.goal) * 100;
                  const isOver = percentage > 100;
                  const isUnder = percentage < 80;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{data.day}</span>
                        <div className="flex items-center space-x-2">
                          <span>{data.calories} / {data.goal} cal</span>
                          {isOver && <Badge variant="destructive" className="text-xs">Over</Badge>}
                          {isUnder && <Badge variant="secondary" className="text-xs">Under</Badge>}
                          {!isOver && !isUnder && <Badge variant="default" className="text-xs">On Track</Badge>}
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isOver ? 'bg-destructive' : 
                            isUnder ? 'bg-muted-foreground' : 
                            'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Macro Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Macro Distribution Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbohydrates</span>
                    <span className="text-sm text-muted-foreground">45-65% recommended</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '52%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current: 52%</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm text-muted-foreground">10-35% recommended</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '28%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current: 28%</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fat</span>
                    <span className="text-sm text-muted-foreground">20-35% recommended</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current: 20%</span>
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">5-Day Streak</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Consistent tracking</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Goal Achiever</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Hit calorie goals 4/7 days</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Weekly Warrior</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Completed first week</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Health Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-green-900 dark:text-green-100">Improving</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your protein intake has increased by 15% this week
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-600 mb-2" />
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Focus Area</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Consider adding more healthy fats to your diet
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Well Done</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Excellent consistency in meal tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}