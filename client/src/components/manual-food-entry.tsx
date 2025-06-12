import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertFoodEntrySchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Brain, Edit, Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";

// Predefined food icons
const FOOD_ICONS = [
  { id: 'pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'burger', emoji: '🍔', name: 'Burger' },
  { id: 'salad', emoji: '🥗', name: 'Salad' },
  { id: 'chicken', emoji: '🍗', name: 'Chicken' },
  { id: 'fish', emoji: '🐟', name: 'Fish' },
  { id: 'rice', emoji: '🍚', name: 'Rice' },
  { id: 'pasta', emoji: '🍝', name: 'Pasta' },
  { id: 'sandwich', emoji: '🥪', name: 'Sandwich' },
  { id: 'apple', emoji: '🍎', name: 'Apple' },
  { id: 'banana', emoji: '🍌', name: 'Banana' },
];

const manualEntrySchema = insertFoodEntrySchema.extend({
  iconName: z.string().optional(),
});

const descriptionSchema = z.object({
  description: z.string().min(5, "Please describe your food in more detail"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  iconName: z.string().optional(),
});

interface ManualFoodEntryProps {
  userId: number;
  date: string;
  onSuccess: () => void;
}

export default function ManualFoodEntry({ userId, date, onSuccess }: ManualFoodEntryProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>("apple");
  const [entryMode, setEntryMode] = useState<"description" | "manual">("description");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for manual entry
  const manualForm = useForm<z.infer<typeof manualEntrySchema>>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      userId,
      date,
      mealType: "lunch",
      description: "",
      calories: 0,
      protein: "0",
      carbs: "0",
      fat: "0",
      iconName: "apple",
    },
  });

  // Form for description-based entry
  const descriptionForm = useForm<z.infer<typeof descriptionSchema>>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: "",
      mealType: "lunch",
      iconName: "apple",
    },
  });

  // AI analysis mutation for description
  const analyzeDescriptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof descriptionSchema>) => {
      const response = await apiRequest('POST', '/api/analyze-voice', {
        transcription: data.description
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      
      if (!data.isRelevant) {
        toast({
          title: "Not food-related",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        // Food entry was created successfully
        queryClient.invalidateQueries({ 
          queryKey: [`/api/food-entries/${userId}/${date}`] 
        });
        toast({
          title: "🎉 Meal logged successfully!",
          description: data.message,
          variant: "success",
        });
        onSuccess();
      } else {
        // Show analysis but allow manual adjustment
        const analysis = data.analysis;
        manualForm.setValue('description', analysis.description || '');
        manualForm.setValue('calories', analysis.calories || 0);
        manualForm.setValue('protein', analysis.protein?.toString() || '0');
        manualForm.setValue('carbs', analysis.carbs?.toString() || '0');
        manualForm.setValue('fat', analysis.fat?.toString() || '0');
        manualForm.setValue('mealType', analysis.mealType || 'snack');
        
        toast({
          title: "Low confidence analysis",
          description: "Please review and adjust the values below.",
          variant: "default",
        });
        setEntryMode("manual");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manual entry mutation
  const createFoodEntry = useMutation({
    mutationFn: async (data: z.infer<typeof manualEntrySchema>) => {
      const response = await apiRequest('POST', '/api/food-entries', {
        ...data,
        iconName: selectedIcon
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/food-entries/${userId}/${date}`] 
      });
      toast({
        title: "✅ Food entry added!",
        description: "Your meal has been logged successfully.",
        variant: "success",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDescriptionSubmit = (data: z.infer<typeof descriptionSchema>) => {
    setSelectedIcon(data.iconName || "apple");
    analyzeDescriptionMutation.mutate(data);
  };

  const onManualSubmit = (data: z.infer<typeof manualEntrySchema>) => {
    createFoodEntry.mutate({
      ...data,
      iconName: selectedIcon
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit className="mr-2 h-5 w-5" />
          Add Food Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={entryMode} onValueChange={(value) => setEntryMode(value as "description" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description" className="flex items-center">
              <Brain className="mr-2 h-4 w-4" />
              AI Description
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* Food Icons Selection */}
          <div className="mt-4">
            <Label className="text-sm font-medium">Choose an icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {FOOD_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelectedIcon(icon.id)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedIcon === icon.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon.emoji}</div>
                  <div className="text-xs text-center">{icon.name}</div>
                </button>
              ))}
            </div>
          </div>

          <TabsContent value="description" className="space-y-4">
            <Form {...descriptionForm}>
              <form onSubmit={descriptionForm.handleSubmit(onDescriptionSubmit)} className="space-y-4">
                <FormField
                  control={descriptionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your food</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I ate a 100g slice of margherita pizza"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={descriptionForm.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={analyzeDescriptionMutation.isPending}
                >
                  {analyzeDescriptionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* AI Analysis Results */}
            {aiAnalysis && aiAnalysis.isRelevant && !aiAnalysis.success && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  AI Analysis (Low Confidence)
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  {aiAnalysis.message}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Calories:</strong> {aiAnalysis.analysis?.calories || 0}</div>
                  <div><strong>Protein:</strong> {aiAnalysis.analysis?.protein || 0}g</div>
                  <div><strong>Carbs:</strong> {aiAnalysis.analysis?.carbs || 0}g</div>
                  <div><strong>Fat:</strong> {aiAnalysis.analysis?.fat || 0}g</div>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Switch to Manual Entry tab to review and adjust these values.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                <FormField
                  control={manualForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Margherita Pizza Slice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={manualForm.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={manualForm.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={manualForm.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createFoodEntry.isPending}
                >
                  {createFoodEntry.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Entry...
                    </>
                  ) : (
                    "Add Food Entry"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}