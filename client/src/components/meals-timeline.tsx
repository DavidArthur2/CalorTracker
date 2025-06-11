import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FoodEntry {
  id: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  imageUrl?: string;
}

interface MealsTimelineProps {
  entries: FoodEntry[];
  userId: number;
  date: string;
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

const defaultFoodImages = {
  breakfast: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  lunch: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100", 
  dinner: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  snack: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
};

export default function MealsTimeline({ entries, userId, date }: MealsTimelineProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest('DELETE', `/api/food-entries/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/food-entries/${userId}/${date}`] });
      toast({
        title: "Entry deleted",
        description: "Food entry has been removed from your log.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (entryId: number) => {
    deleteMutation.mutate(entryId);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.mealType]) {
      acc[entry.mealType] = [];
    }
    acc[entry.mealType].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Meals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No meals logged yet today.</p>
            <p className="text-sm">Start by scanning your first meal!</p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([mealType, mealEntries]) => (
            <div key={mealType} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className={mealTypeColors[mealType as keyof typeof mealTypeColors]}>
                  {mealTypeLabels[mealType as keyof typeof mealTypeLabels]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {mealEntries.length} item{mealEntries.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {mealEntries.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
                  <img 
                    src={entry.imageUrl || defaultFoodImages[entry.mealType as keyof typeof defaultFoodImages]}
                    alt={entry.description}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultFoodImages[entry.mealType as keyof typeof defaultFoodImages];
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{entry.description}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>{entry.calories} cal</span>
                      <span>{parseFloat(entry.carbs.toString()).toFixed(1)}g carbs</span>
                      <span>{parseFloat(entry.protein.toString()).toFixed(1)}g protein</span>
                      <span>{parseFloat(entry.fat.toString()).toFixed(1)}g fat</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Entry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Add Meal Button */}
        <Button variant="outline" className="w-full border-dashed border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add meal or snack
        </Button>
      </CardContent>
    </Card>
  );
}
