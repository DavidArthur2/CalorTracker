import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, Utensils, Activity, Clock } from "lucide-react";

interface AiSuggestion {
  id: number;
  suggestionType: "meal" | "exercise" | "general";
  content: string;
  timeOfDay?: string;
  createdAt: string;
}

interface AiSuggestionsProps {
  suggestions: AiSuggestion[];
}

const suggestionIcons = {
  meal: Utensils,
  exercise: Activity,
  general: Lightbulb,
};

const suggestionColors = {
  meal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  exercise: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default function AiSuggestions({ suggestions }: AiSuggestionsProps) {
  const latestSuggestion = suggestions[0];
  
  if (!latestSuggestion) {
    return null;
  }

  const SuggestionIcon = suggestionIcons[latestSuggestion.suggestionType];

  return (
    <Card className="ai-suggestion-gradient text-white">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className="bg-white/20 rounded-full p-2">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">AI Nutrition Assistant</h3>
              <Badge className={`${suggestionColors[latestSuggestion.suggestionType]} text-xs`}>
                <SuggestionIcon className="mr-1 h-3 w-3" />
                {latestSuggestion.suggestionType}
              </Badge>
            </div>
            
            <p className="text-white/90 text-sm mb-3">
              {latestSuggestion.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-white/70">
                <Clock className="mr-1 h-3 w-3" />
                {latestSuggestion.timeOfDay && (
                  <span className="mr-3">Suggested at {latestSuggestion.timeOfDay}</span>
                )}
                <span>
                  {new Date(latestSuggestion.createdAt).toRelativeTimeString 
                    ? new Date(latestSuggestion.createdAt).toLocaleDateString()
                    : 'Today'}
                </span>
              </div>
              
              <Button 
                size="sm" 
                className="bg-white text-info hover:bg-white/90"
              >
                Get More Suggestions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
