import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, LogOut, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth.tsx";
import Navigation from "@/components/navigation";
import UserPreferencesForm from "@/components/user-preferences-form";
import UserPreferencesDisplay from "@/components/user-preferences-display";

export default function Profile() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: [`/api/user-preferences/${user?.id}`],
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    // For now, redirect to logout endpoint directly
    window.location.href = "/api/logout";
  };

  const onPreferencesUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <Target className="mr-2 h-4 w-4" />
                Health Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        {user?.firstName || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        {user?.lastName || "Not provided"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="flex items-center"
                      disabled={false}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              {userPreferences && Object.keys(userPreferences).length > 0 ? (
                <UserPreferencesDisplay 
                  preferences={userPreferences}
                  onUpdate={onPreferencesUpdate}
                />
              ) : (
                <UserPreferencesForm 
                  initialData={userPreferences as any}
                  onSuccess={onPreferencesUpdate}
                  isRegistration={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}