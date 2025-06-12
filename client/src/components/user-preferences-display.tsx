import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Activity, Target, Utensils, AlertTriangle } from "lucide-react";
import UserPreferencesForm from "./user-preferences-form";

interface UserPreferencesDisplayProps {
  preferences: any;
  onUpdate: () => void;
}

const ACTIVITY_LABELS = {
  sedentary: "Sedentary (Little or no exercise)",
  lightly_active: "Lightly Active (Light exercise 1-3 days/week)",
  moderately_active: "Moderately Active (Moderate exercise 3-5 days/week)",
  very_active: "Very Active (Heavy exercise 6-7 days/week)",
  extremely_active: "Extremely Active (Very heavy exercise, physical job)"
};

const GOAL_LABELS = {
  lose_weight: "🏃‍♀️ Lose Weight",
  maintain_weight: "⚖️ Maintain Weight",
  gain_weight: "📈 Gain Weight",
  gain_muscle: "💪 Gain Muscle",
  improve_health: "❤️ Improve Health"
};

export default function UserPreferencesDisplay({ preferences, onUpdate }: UserPreferencesDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <UserPreferencesForm
        initialData={preferences}
        onSuccess={() => {
          setIsEditing(false);
          onUpdate();
        }}
        isRegistration={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Physical Information
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Update Preferences
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Height</label>
              <div className="text-xl font-semibold text-gray-900">
                {preferences.height || 'Not set'} {preferences.height && 'cm'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Weight</label>
              <div className="text-xl font-semibold text-gray-900">
                {preferences.weight || 'Not set'} {preferences.weight && 'kg'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Age</label>
              <div className="text-xl font-semibold text-gray-900">
                {preferences.age || 'Not set'} {preferences.age && 'years'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <div className="text-xl font-semibold text-gray-900 capitalize">
                {preferences.gender || 'Not set'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Activity & Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Activity Level</label>
            <div className="text-lg font-medium text-gray-900 mt-1">
              {preferences.activityLevel ? ACTIVITY_LABELS[preferences.activityLevel as keyof typeof ACTIVITY_LABELS] : 'Not set'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Health Goal</label>
            <div className="text-lg font-medium text-gray-900 mt-1">
              {preferences.goal ? GOAL_LABELS[preferences.goal as keyof typeof GOAL_LABELS] : 'Not set'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Preferences</label>
            <div className="flex flex-wrap gap-2">
              {preferences.dietaryPreferences && preferences.dietaryPreferences.length > 0 ? (
                preferences.dietaryPreferences.map((pref: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {pref}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No dietary preferences set</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <label className="text-sm font-medium text-gray-600">Allergies & Restrictions</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.allergies && preferences.allergies.length > 0 ? (
                preferences.allergies.map((allergy: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No allergies reported</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Nutrition Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {preferences.dailyCalorieGoal || 'Auto'}
              </div>
              <div className="text-sm text-red-600">Daily Calories</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {preferences.dailyProteinGoal || 'Auto'}
              </div>
              <div className="text-sm text-blue-600">Protein (g)</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {preferences.dailyCarbGoal || 'Auto'}
              </div>
              <div className="text-sm text-yellow-600">Carbs (g)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {preferences.dailyFatGoal || 'Auto'}
              </div>
              <div className="text-sm text-green-600">Fat (g)</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Goals marked as "Auto" are calculated based on your physical characteristics and health goals
          </p>
        </CardContent>
      </Card>
    </div>
  );
}