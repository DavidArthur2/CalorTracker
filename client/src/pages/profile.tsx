import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Settings, Save, Edit, LogOut, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch user preferences
  const { data: userPreferences } = useQuery({
    queryKey: [`/api/user-preferences/${user?.id}`],
    enabled: !!user?.id,
  });

  const [profileForm, setProfileForm] = useState({
    height: userPreferences?.height?.toString() || "",
    weight: userPreferences?.weight || "",
    age: userPreferences?.age?.toString() || "",
    gender: userPreferences?.gender || "other",
    activityLevel: userPreferences?.activityLevel || "moderate",
    dietaryPreferences: userPreferences?.dietaryPreferences || "",
    allergies: userPreferences?.allergies || "",
    goal: userPreferences?.goal || "weight_maintenance",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/user-preferences/${user?.id}`, {
        height: data.height ? parseInt(data.height) : null,
        weight: data.weight || null,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        activityLevel: data.activityLevel,
        dietaryPreferences: data.dietaryPreferences,
        allergies: data.allergies,
        goal: data.goal,
      });
      return response.json();
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Navigation />
        <main className="main-content">
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
              </div>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <p className="text-foreground font-medium">{user.firstName || 'Not set'}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p className="text-foreground font-medium">{user.lastName || 'Not set'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-foreground font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Health & Fitness Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Select
                      value={profileForm.gender}
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={profileForm.activityLevel}
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, activityLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal">Health Goal</Label>
                    <Select
                      value={profileForm.goal}
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, goal: value }))}
                    >
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
                  <div className="md:col-span-2">
                    <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                    <Textarea
                      id="dietaryPreferences"
                      value={profileForm.dietaryPreferences}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, dietaryPreferences: e.target.value }))}
                      placeholder="e.g., Vegetarian, Vegan, Keto, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="allergies">Allergies & Restrictions</Label>
                    <Textarea
                      id="allergies"
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="e.g., Nuts, Dairy, Gluten, etc."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Height</Label>
                    <p className="text-foreground font-medium">{userPreferences?.height ? `${userPreferences.height} cm` : 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <p className="text-foreground font-medium">{userPreferences?.weight || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-foreground font-medium">{userPreferences?.age || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-foreground font-medium capitalize">{userPreferences?.gender || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Activity Level</Label>
                    <p className="text-foreground font-medium capitalize">{userPreferences?.activityLevel ? userPreferences.activityLevel.replace('_', ' ') : 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Health Goal</Label>
                    <p className="text-foreground font-medium capitalize">{userPreferences?.goal ? userPreferences.goal.replace('_', ' ') : 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Dietary Preferences</Label>
                    <p className="text-foreground font-medium">{userPreferences?.dietaryPreferences || 'None specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Allergies & Restrictions</Label>
                    <p className="text-foreground font-medium">{userPreferences?.allergies || 'None specified'}</p>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}