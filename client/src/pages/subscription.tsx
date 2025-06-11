import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

const mockUser = {
  id: 1,
  subscriptionStatus: "trial" as const,
  trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
};

export default function Subscription() {
  const daysRemaining = Math.ceil((new Date(mockUser.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground">Upgrade to unlock all features</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
          
          {/* Trial Status */}
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Free Trial Active
                </h3>
                <p className="text-yellow-700 dark:text-yellow-200 mb-4">
                  You have {daysRemaining} days remaining in your free trial
                </p>
                <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(0, (daysRemaining / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="subscription-gradient text-white">
            <CardHeader>
              <CardTitle className="text-center text-2xl">CalorTracker Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$10</div>
                <div className="text-white/80">per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Unlimited AI food analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Advanced nutrition insights</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Personalized meal recommendations</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Exercise suggestions</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Calendar meal planning</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Progress tracking & analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-3 h-5 w-5" />
                  <span>Priority customer support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Payment processing is not configured yet.</p>
                <p className="text-sm text-muted-foreground mb-6">Contact support to set up your subscription.</p>
                <Button disabled className="w-full">
                  Subscribe for $10/month
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Cancel anytime • 30-day money-back guarantee
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Secure payment processing coming soon
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Free vs Pro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b border-border pb-2">
                  <div>Feature</div>
                  <div className="text-center">Free Trial</div>
                  <div className="text-center">Pro</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>AI Food Analysis</div>
                  <div className="text-center">3 days only</div>
                  <div className="text-center text-green-600">Unlimited</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Manual Food Entry</div>
                  <div className="text-center text-green-600">✓</div>
                  <div className="text-center text-green-600">✓</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Meal Recommendations</div>
                  <div className="text-center">Limited</div>
                  <div className="text-center text-green-600">Unlimited</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Exercise Suggestions</div>
                  <div className="text-center">—</div>
                  <div className="text-center text-green-600">✓</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Calendar Planning</div>
                  <div className="text-center">—</div>
                  <div className="text-center text-green-600">✓</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Advanced Analytics</div>
                  <div className="text-center">—</div>
                  <div className="text-center text-green-600">✓</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}