import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEAL_ICON_OPTIONS, getMealIcon } from "@/lib/mealIcons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertFoodEntrySchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const manualEntrySchema = insertFoodEntrySchema.extend({
  iconName: z.string().optional(),
});

interface ManualFoodEntryProps {
  userId: string;
  date: string;
  onSuccess: () => void;
}

export default function ManualFoodEntry({ userId, date, onSuccess }: ManualFoodEntryProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>("apple");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof manualEntrySchema>>({
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

  const createFoodEntry = useMutation({
    mutationFn: async (data: z.infer<typeof manualEntrySchema>) => {
      return await apiRequest("/api/food-entries", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          imageUrl: data.iconName ? `/icons/${data.iconName}.svg` : null,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Food entry added",
        description: "Your manual food entry has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries', userId, date] });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save food entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof manualEntrySchema>) => {
    createFoodEntry.mutate({
      ...data,
      iconName: selectedIcon,
    });
  };

  const IconComponent = getMealIcon(selectedIcon);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Manual Food Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Icon Selection */}
            <div className="space-y-3">
              <Label>Choose Meal Icon</Label>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                  <IconComponent className="w-8 h-8" />
                </div>
                <Badge variant="outline">{MEAL_ICON_OPTIONS.find(opt => opt.value === selectedIcon)?.label}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {MEAL_ICON_OPTIONS.map((option) => {
                  const Icon = getMealIcon(option.value);
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selectedIcon === option.value ? "default" : "outline"}
                      className="h-16 flex flex-col gap-1"
                      onClick={() => setSelectedIcon(option.value)}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your meal..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
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
                control={form.control}
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

            {/* Optional Fields */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fiber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiber (g) - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sugar (g) - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sodium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sodium (mg) - Optional</FormLabel>
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
              {createFoodEntry.isPending ? "Adding..." : "Add Food Entry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}