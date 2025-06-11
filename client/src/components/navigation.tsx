import { Link, useLocation } from "wouter";
import { Home, Camera, Calendar, TrendingUp, User, Crown, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/scanner", icon: Camera, label: "Scan" },
  { href: "/plan", icon: Calendar, label: "Plan" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/profile", icon: User, label: "Profile" },
];

const mockUser = {
  subscriptionStatus: "trial" as const,
  trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
};

export default function Navigation() {
  const [location] = useLocation();
  const daysRemaining = Math.ceil((new Date(mockUser.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">NutriTrack</h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Nutrition AI</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          
          <Link href="/subscription">
            <div className={`sidebar-nav-item ${location === '/subscription' ? 'active' : ''}`}>
              <Crown className="mr-3 h-5 w-5" />
              Subscription
            </div>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          {mockUser.subscriptionStatus === "trial" && (
            <Card className="trial-status-gradient text-white">
              <CardContent className="p-4">
                <h3 className="font-semibold">Free Trial</h3>
                <p className="text-sm text-white/90">{daysRemaining} days remaining</p>
                <Link href="/subscription">
                  <Button size="sm" className="mt-2 bg-white text-primary hover:bg-white/90">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </aside>
    </>
  );
}
