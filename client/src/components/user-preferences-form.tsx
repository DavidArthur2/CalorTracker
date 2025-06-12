import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Target, Activity, Heart, Utensils, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const userPreferencesSchema = z.object({
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  age: z.number().min(13, "Age must be at least 13").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
  goal: z.enum(["lose_weight", "maintain_weight", "gain_weight", "gain_muscle", "improve_health"]),
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;

interface UserPreferencesFormProps {
  initialData?: Partial<UserPreferencesFormData>;
  onSuccess?: () => void;
  isRegistration?: boolean;
}

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", description: "Heavy exercise 6-7 days/week" },
  { value: "extremely_active", label: "Extremely Active", description: "Very heavy exercise, physical job" },
];

const HEALTH_GOALS = [
  { value: "lose_weight", label: "Lose Weight", description: "Reduce body weight gradually", icon: "⬇️" },
  { value: "maintain_weight", label: "Maintain Weight", description: "Keep current weight stable", icon: "↔️" },
  { value: "gain_weight", label: "Gain Weight", description: "Increase body weight healthily", icon: "⬆️" },
  { value: "gain_muscle", label: "Gain Muscle", description: "Build lean muscle mass", icon: "💪" },
  { value: "improve_health", label: "Improve Health", description: "General health and wellness", icon: "❤️" },
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Low-carb", "High-protein", 
  "Gluten-free", "Dairy-free", "Intermittent fasting", "Balanced diet"
];

const COMMON_ALLERGIES = [
  "Milk/Dairy", "Eggs", "Peanuts", "Tree nuts", "Fish", "Shellfish", 
  "Soy", "Gluten/Wheat", "Sesame", "None"
];

export default function UserPreferencesForm({ initialData, onSuccess, isRegistration = false }: UserPreferencesFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(initialData?.dietaryPreferences || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(initialData?.allergies || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<UserPreferencesFormData>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      height: initialData?.height || 170,
      weight: initialData?.weight || 70,
      age: initialData?.age || 25,
      gender: initialData?.gender || "male",
      activityLevel: initialData?.activityLevel || "moderately_active",
      goal: initialData?.goal || "maintain_weight",
      dietaryPreferences: selectedDietary,
      allergies: selectedAllergies,
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferencesFormData) => {
      const response = await apiRequest("POST", "/api/user-preferences", {
        ...data,
        dietaryPreferences: selectedDietary,
        allergies: selectedAllergies,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-preferences"] });
      toast({
        title: isRegistration ? "Welcome!" : "Preferences Updated",
        description: isRegistration 
          ? "Your profile has been set up successfully. Let's start tracking your nutrition!"
          : "Your preferences have been updated successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserPreferencesFormData) => {
    savePreferencesMutation.mutate({
      ...data,
      dietaryPreferences: selectedDietary,
      allergies: selectedAllergies,
    });
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await form.trigger(['height', 'weight', 'age', 'gender']);
        break;
      case 2:
        isValid = await form.trigger(['activityLevel']);
        break;
      case 3:
        isValid = await form.trigger(['goal']);
        break;
      case 4:
        isValid = true; // Dietary preferences and allergies are optional
        break;
    }
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDietaryPreference = (preference: string) => {
    setSelectedDietary(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === "None") {
      setSelectedAllergies(allergy === selectedAllergies[0] ? [] : ["None"]);
    } else {
      setSelectedAllergies(prev => {
        const filtered = prev.filter(a => a !== "None");
        return filtered.includes(allergy) 
          ? filtered.filter(a => a !== allergy)
          : [...filtered, allergy];
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
              <p className="text-gray-600">Tell us about yourself to personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="170"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="70"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Activity className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Activity Level</h3>
              <p className="text-gray-600">How active are you in your daily life?</p>
            </div>

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid gap-4">
                      {ACTIVITY_LEVELS.map((level) => (
                        <div
                          key={level.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === level.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            field.onChange(level.value);
                            form.setValue('activityLevel', level.value as any);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{level.label}</h4>
                              <p className="text-sm text-gray-600">{level.description}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              field.value === level.value 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300'
                            }`}>
                              {field.value === level.value && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Health Goal</h3>
              <p className="text-gray-600">What's your primary health objective?</p>
            </div>

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {HEALTH_GOALS.map((goal) => (
                        <div
                          key={goal.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === goal.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            field.onChange(goal.value);
                            form.setValue('goal', goal.value as any);
                          }}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">{goal.icon}</div>
                            <h4 className="font-semibold text-gray-900">{goal.label}</h4>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                            {field.value === goal.value && (
                              <div className="mt-2">
                                <div className="w-6 h-6 bg-purple-500 text-white rounded-full mx-auto flex items-center justify-center text-sm">
                                  ✓
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Utensils className="mx-auto h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Dietary Preferences & Allergies</h3>
              <p className="text-gray-600">Help us personalize your meal recommendations</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Dietary Preferences (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <Badge
                      key={option}
                      variant={selectedDietary.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleDietaryPreference(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Allergies & Food Restrictions
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant={selectedAllergies.includes(allergy) ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAllergy(allergy)}
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This information helps our AI avoid recommending foods that could cause adverse reactions
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">
          {isRegistration ? "Complete Your Profile" : "Update Preferences"}
        </CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={savePreferencesMutation.isPending}
                  className="flex items-center"
                >
                  {savePreferencesMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      {isRegistration ? "Complete Setup" : "Save Changes"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}