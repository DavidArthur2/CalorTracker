import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth.tsx";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import FoodScanner from "@/pages/food-scanner";
import Subscription from "@/pages/subscription";
import CalendarPlanning from "@/pages/calendar-planning";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function GuestLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            CalorTracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI-powered nutrition tracking with demo mode
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/demo'} 
              className="w-full sm:w-auto"
            >
              Try Demo
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>📸 Photo Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload food photos for instant AI-powered nutritional analysis
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📊 Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your daily calories, macros, and nutrition goals
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>🎯 Smart Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized meal suggestions and AI-powered insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
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
      <Route path="/auth" component={AuthPage} />
      <Route path="/demo">
        {() => <GuestLanding />}
      </Route>
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
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
