import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Crown, Bell, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUser = {
  id: 1,
  username: "demo_user",
  email: "demo@example.com",
  subscriptionStatus: "trial" as const,
  trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
};

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: mockUser.username,
    email: mockUser.email,
    height: "170",
    weight: "70",
    age: "25",
    gender: "other",
    activityLevel: "moderate",
    dietaryPreferences: "",
    allergies: "",
    healthGoals: "weight_maintenance",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real app, this would update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const daysRemaining = Math.ceil((new Date(mockUser.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
          
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Account Information
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {mockUser.subscriptionStatus === "trial" && (
                    <Badge variant="outline" className="trial-status-gradient text-white">
                      Free Trial • {daysRemaining} days left
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <p className="text-foreground font-medium">{mockUser.username}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground font-medium">{mockUser.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profileForm.gender} onValueChange={(value) => setProfileForm(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Height</Label>
                    <p className="text-foreground font-medium">{profileForm.height} cm</p>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <p className="text-foreground font-medium">{profileForm.weight} kg</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-foreground font-medium">{profileForm.age} years</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-foreground font-medium capitalize">{profileForm.gender}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health & Fitness Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Health & Fitness Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select value={profileForm.activityLevel} onValueChange={(value) => setProfileForm(prev => ({ ...prev, activityLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (2x/day, intense)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="healthGoals">Primary Health Goal</Label>
                    <Select value={profileForm.healthGoals} onValueChange={(value) => setProfileForm(prev => ({ ...prev, healthGoals: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="weight_gain">Weight Gain</SelectItem>
                        <SelectItem value="weight_maintenance">Weight Maintenance</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="general_health">General Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Activity Level</Label>
                    <p className="text-foreground font-medium capitalize">{profileForm.activityLevel.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Primary Health Goal</Label>
                    <p className="text-foreground font-medium capitalize">{profileForm.healthGoals.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences & Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                    <Textarea
                      id="dietaryPreferences"
                      placeholder="e.g., vegetarian, vegan, keto, Mediterranean..."
                      value={profileForm.dietaryPreferences}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, dietaryPreferences: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies & Restrictions</Label>
                    <Textarea
                      id="allergies"
                      placeholder="e.g., nuts, dairy, gluten, seafood..."
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, allergies: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Dietary Preferences</Label>
                    <p className="text-foreground">{profileForm.dietaryPreferences || "None specified"}</p>
                  </div>
                  <div>
                    <Label>Allergies & Restrictions</Label>
                    <p className="text-foreground">{profileForm.allergies || "None specified"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {mockUser.subscriptionStatus === "trial" ? "Free Trial" : "NutriTrack Pro"}
                  </p>
                </div>
                <Badge variant={mockUser.subscriptionStatus === "trial" ? "secondary" : "default"}>
                  {mockUser.subscriptionStatus === "trial" ? `${daysRemaining} days left` : "Active"}
                </Badge>
              </div>

              {mockUser.subscriptionStatus === "trial" && (
                <div className="p-4 subscription-gradient text-white rounded-lg">
                  <h4 className="font-medium mb-2">Upgrade to Pro</h4>
                  <p className="text-sm text-white/90 mb-3">
                    Get unlimited AI food analysis, advanced insights, and meal planning for just $10/month.
                  </p>
                  <Button variant="secondary" size="sm">
                    Upgrade Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Meal Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified to log your meals</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Suggestions</p>
                    <p className="text-sm text-muted-foreground">Receive personalized nutrition tips</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Progress Updates</p>
                    <p className="text-sm text-muted-foreground">Weekly progress summaries</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}