import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ChefHat, Clock } from "lucide-react";

interface AiSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisData: {
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
    confidence: number;
    message: string;
  };
}

export default function AiSuccessDialog({ open, onOpenChange, analysisData }: AiSuccessDialogProps) {
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍪';
      default: return '🍽️';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'lunch': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'snack': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-green-800 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Meal Logged Successfully!
            <Sparkles className="w-5 h-5" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Message */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <ChefHat className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 mb-1">AI Analysis</p>
                <div 
                  className="text-sm text-blue-700"
                  dangerouslySetInnerHTML={{ __html: analysisData.message }}
                />
              </div>
            </div>
          </div>

          {/* Meal Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">📝 Meal Details</h3>
              <Badge className={getMealTypeColor(analysisData.mealType)}>
                {getMealTypeIcon(analysisData.mealType)} {analysisData.mealType}
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-4 font-medium">
              {analysisData.description}
            </p>

            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="text-red-600 text-xl font-bold">{analysisData.calories}</div>
                <div className="text-red-600 text-xs font-medium">🔥 Calories</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="text-blue-600 text-xl font-bold">{analysisData.protein}g</div>
                <div className="text-blue-600 text-xs font-medium">💪 Protein</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="text-yellow-600 text-xl font-bold">{analysisData.carbs}g</div>
                <div className="text-yellow-600 text-xs font-medium">⚡ Carbs</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="text-orange-600 text-xl font-bold">{analysisData.fat}g</div>
                <div className="text-orange-600 text-xs font-medium">🥑 Fat</div>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-green-700 text-sm font-medium">🎯 AI Confidence</span>
              <div className="flex items-center gap-2">
                <div className="bg-green-200 rounded-full h-2 w-16">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysisData.confidence * 100}%` }}
                  />
                </div>
                <span className="text-green-700 font-bold text-sm">
                  {Math.round(analysisData.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-medium text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Perfect! Continue Tracking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}