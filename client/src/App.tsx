import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import FoodScanner from "@/pages/food-scanner";
import Subscription from "@/pages/subscription";
import CalendarPlanning from "@/pages/calendar-planning";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NutriTracker</CardTitle>
          <CardDescription>
            Track your nutrition with AI-powered food analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI-powered food photo analysis</li>
              <li>• Manual food entry with icons</li>
              <li>• Daily calorie and macro tracking</li>
              <li>• Personalized meal suggestions</li>
              <li>• Progress tracking and goals</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'} 
            className="w-full"
          >
            Login with Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Dashboard />
                </main>
              </div>
            )}
          </Route>
          <Route path="/scanner">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <FoodScanner />
                </main>
              </div>
            )}
          </Route>
          <Route path="/subscription">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Subscription />
                </main>
              </div>
            )}
          </Route>
          <Route path="/plan">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <CalendarPlanning />
                </main>
              </div>
            )}
          </Route>
          <Route path="/progress">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Progress />
                </main>
              </div>
            )}
          </Route>
          <Route path="/profile">
            {() => (
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Profile />
                </main>
              </div>
            )}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
