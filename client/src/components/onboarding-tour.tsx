import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  Brain, 
  BarChart3, 
  Target,
  CheckCircle,
  Sparkles,
  Play,
  Hand
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  icon: React.ComponentType<any>;
  actionText?: string;
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to CalorTracker!",
    description: "Let's take a quick tour to help you get started with AI-powered nutrition tracking.",
    target: "body",
    position: "bottom",
    icon: Sparkles,
    highlight: true
  },
  {
    id: "food-scanner",
    title: "AI Food Scanner",
    description: "Simply take a photo of your meal and our AI will instantly analyze the nutrition content.",
    target: "[data-tour='food-scanner']",
    position: "bottom",
    icon: Camera,
    actionText: "Try scanning some food!"
  },
  {
    id: "daily-progress",
    title: "Track Your Progress",
    description: "Monitor your daily nutrition goals with beautiful visual progress indicators.",
    target: "[data-tour='daily-progress']",
    position: "right",
    icon: BarChart3
  },
  {
    id: "ai-suggestions",
    title: "Smart Recommendations",
    description: "Get personalized meal and exercise suggestions based on your goals and current intake.",
    target: "[data-tour='ai-suggestions']",
    position: "left",
    icon: Brain,
    actionText: "Get AI suggestions"
  },
  {
    id: "navigation",
    title: "Easy Navigation",
    description: "Access all features easily from the sidebar. Track meals, view progress, and manage your profile.",
    target: "[data-tour='navigation']",
    position: "right",
    icon: Target
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start tracking your nutrition journey. Remember, you can access this tour anytime from your profile.",
    target: "body",
    position: "bottom",
    icon: CheckCircle,
    highlight: true
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);

      if (element && step.target !== "body") {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect without blocking interaction
        element.style.position = "relative";
        element.style.zIndex = "1001";
        element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)";
        element.style.borderRadius = "8px";
        element.style.transition = "all 0.3s ease";
      }

      return () => {
        if (element && step.target !== "body") {
          element.style.position = "";
          element.style.zIndex = "";
          element.style.boxShadow = "";
          element.style.borderRadius = "";
          element.style.transition = "";
        }
      };
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onClose();
  };

  const getTooltipPosition = (step: TourStep) => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;

    switch (step.position) {
      case "top":
        return {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + (rect.width - tooltipWidth) / 2,
        };
      case "bottom":
        return {
          top: rect.bottom + offset,
          left: rect.left + (rect.width - tooltipWidth) / 2,
        };
      case "left":
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.left - tooltipWidth - offset,
        };
      case "right":
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.right + offset,
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Tour Tooltip - no blocking overlay */}
      <div
        className="fixed z-[1002] w-80 transition-all duration-300 ease-out pointer-events-auto"
        style={currentStepData.target === "body" ? 
          { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } : 
          getTooltipPosition(currentStepData)
        }
      >
        <Card className={`shadow-2xl border-2 transition-all duration-300 ${
          currentStepData.highlight 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                currentStepData.highlight
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">
                  {currentStepData.title}
                </CardTitle>
                <Progress value={progress} className="mt-2 h-1" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CardDescription className="text-sm leading-relaxed">
              {currentStepData.description}
            </CardDescription>

            {currentStepData.actionText && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <Hand className="h-4 w-4" />
                <span>{currentStepData.actionText}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip Tour
                </Button>
                
                <Button
                  onClick={handleNext}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    currentStepData.highlight
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                  }`}
                >
                  <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStep === tourSteps.length - 1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointer for non-centered tooltips */}
        {currentStepData.target !== "body" && (
          <div
            className={`absolute w-3 h-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rotate-45 ${
              currentStepData.position === "top" ? "bottom-[-7px] left-1/2 transform -translate-x-1/2" :
              currentStepData.position === "bottom" ? "top-[-7px] left-1/2 transform -translate-x-1/2" :
              currentStepData.position === "left" ? "right-[-7px] top-1/2 transform -translate-y-1/2" :
              "left-[-7px] top-1/2 transform -translate-y-1/2"
            }`}
          />
        )}
      </div>
    </>
  );
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('calortracker-onboarding-completed');
    if (!hasCompletedOnboarding) {
      setIsFirstVisit(true);
      // Delay showing tour to allow page to load
      setTimeout(() => setShowTour(true), 1500);
    }
  }, []);

  const startTour = () => {
    setShowTour(true);
  };

  const completeTour = () => {
    localStorage.setItem('calortracker-onboarding-completed', 'true');
    setIsFirstVisit(false);
    setShowTour(false);
  };

  const skipTour = () => {
    setShowTour(false);
  };

  return {
    isFirstVisit,
    showTour,
    startTour,
    completeTour,
    skipTour
  };
}