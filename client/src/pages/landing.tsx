import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Zap, 
  Brain, 
  Target, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Pause,
  BarChart3,
  Calendar,
  Sparkles,
  Crown,
  Shield
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Camera,
    title: "AI Food Scanner",
    description: "Snap a photo of your meal and get instant nutrition analysis powered by advanced AI",
    demo: "food-scanner",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Get personalized meal and exercise suggestions based on your goals and preferences",
    demo: "ai-suggestions",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your nutrition goals with beautiful charts and detailed analytics",
    demo: "progress-tracking",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Calendar,
    title: "Meal Planning",
    description: "Plan your meals in advance with AI-generated meal plans tailored to your needs",
    demo: "meal-planning",
    gradient: "from-orange-500 to-red-500"
  }
];

const pricingPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "7 days",
    description: "Try all features risk-free",
    features: [
      "AI Food Scanner (10 scans/day)",
      "Basic nutrition tracking",
      "Simple meal suggestions",
      "Progress charts"
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-gray-400 to-gray-600"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "Perfect for serious nutrition tracking",
    features: [
      "Unlimited AI Food Scanner",
      "Advanced nutrition analytics",
      "Personalized meal plans",
      "Exercise recommendations",
      "Goal setting & tracking",
      "Export data & reports"
    ],
    cta: "Upgrade to Pro",
    popular: true,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "month",
    description: "For nutrition professionals & enthusiasts",
    features: [
      "Everything in Pro",
      "Custom nutrition goals",
      "Macro cycling support",
      "Integration with fitness apps",
      "Priority customer support",
      "Early access to new features"
    ],
    cta: "Go Premium",
    popular: false,
    gradient: "from-purple-600 to-pink-600"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fitness Enthusiast",
    content: "CalorTracker's AI scanner is incredibly accurate. I've lost 15 pounds in 2 months just by being more aware of what I eat!",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Mike Chen",
    role: "Busy Professional",
    content: "The meal planning feature saves me hours every week. The AI suggestions are spot-on and fit perfectly with my schedule.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Nutritionist",
    content: "I recommend CalorTracker to all my clients. The detailed analytics help them understand their eating patterns better.",
    rating: 5,
    avatar: "ER"
  }
];

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState("food-scanner");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-rotate through features
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
      setActiveDemo(features[(currentFeature + 1) % features.length].demo);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, currentFeature]);

  const renderDemo = () => {
    switch (activeDemo) {
      case "food-scanner":
        return (
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Point your camera at food</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 dark:text-gray-400">🍎 Apple - 95 calories</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">🥗 Salad - 150 calories</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "ai-suggestions":
        return (
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Smart AI Recommendations</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-left">
                  <p className="text-xs text-gray-600 dark:text-gray-400">💡 Try grilled chicken for protein</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">🏃‍♂️ 20min walk burns excess calories</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "progress-tracking":
        return (
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Track Your Progress</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Calories</span>
                    <span>1,850 / 2,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "meal-planning":
        return (
          <div className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">AI Meal Planning</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-left">
                  <p className="text-xs text-gray-600 dark:text-gray-400">🌅 Breakfast: Oatmeal & berries</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">🌞 Lunch: Quinoa bowl</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">🌙 Dinner: Salmon & vegetables</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CalorTracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:shadow-lg transition-shadow">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Nutrition Tracking
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Transform Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nutrition Journey
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Snap photos of your meals, get instant AI-powered nutrition analysis, and receive personalized recommendations to reach your health goals faster than ever.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Crown className="h-5 w-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200">
                <Play className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Demo */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Experience the Power of AI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how our advanced features work together to make nutrition tracking effortless and accurate
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Display */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {features[currentFeature].title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                  {renderDemo()}
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="order-1 lg:order-2 space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = index === currentFeature;
                
                return (
                  <div
                    key={feature.demo}
                    className={`group cursor-pointer transition-all duration-300 ${
                      isActive ? 'transform scale-105' : 'hover:transform hover:scale-102'
                    }`}
                    onClick={() => {
                      setCurrentFeature(index);
                      setActiveDemo(feature.demo);
                      setIsPlaying(false);
                    }}
                  >
                    <Card className={`border-2 transition-all duration-300 ${
                      isActive 
                        ? `border-transparent bg-gradient-to-r ${feature.gradient} text-white shadow-xl` 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl transition-colors ${
                            isActive 
                              ? 'bg-white/20' 
                              : `bg-gradient-to-r ${feature.gradient} text-white`
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                              {feature.title}
                            </h3>
                            <p className={`text-sm ${
                              isActive ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start with our free trial and upgrade when you're ready for more advanced features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-2xl' 
                    : 'border border-gray-200 dark:border-gray-700 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                    {plan.name === 'Free Trial' && <Zap className="h-8 w-8 text-white" />}
                    {plan.name === 'Pro' && <Target className="h-8 w-8 text-white" />}
                    {plan.name === 'Premium' && <Crown className="h-8 w-8 text-white" />}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.price !== '$0' && (
                        <span className="text-gray-600 dark:text-gray-300">/{plan.period}</span>
                      )}
                    </div>
                    {plan.price === '$0' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth">
                    <Button 
                      className={`w-full transition-all duration-200 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what our users say about their nutrition transformation journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of users who've already improved their health with CalorTracker's AI-powered nutrition tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Crown className="h-5 w-5 mr-2" />
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>10,000+ Happy Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Setup in 2 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CalorTracker</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              Transform your nutrition journey with AI-powered tracking and personalized recommendations.
            </p>
            <div className="pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500">
                © 2025 CalorTracker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}