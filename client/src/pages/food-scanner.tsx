import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const mockUser = { id: 1 };

export default function FoodScanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [foodEntry, setFoodEntry] = useState({
    description: "",
    mealType: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiRequest('POST', '/api/analyze-food', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setFoodEntry({
        description: data.description,
        mealType: "",
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      });
      
      if (data.confidence < 0.7 && data.advice) {
        toast({
          title: "Analysis completed with low confidence",
          description: data.advice,
          variant: "default",
        });
      } else {
        toast({
          title: "Food analyzed successfully!",
          description: `Found: ${data.description}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (entry: any) => {
      const response = await apiRequest('POST', '/api/food-entries', {
        ...entry,
        userId: mockUser.id,
        date: new Date().toISOString().split('T')[0],
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries'] });
      toast({
        title: "Food entry saved!",
        description: "Added to your daily nutrition log.",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
    setFoodEntry({
      description: "",
      mealType: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };

  const handleCameraCapture = () => {
    // Basic mobile device detection
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    if (!isMobile) {
      toast({
        title: "Camera not available",
        description: "Photo capture is only supported on mobile devices. Please upload an image instead.",
        variant: "destructive",
      });
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeMutation.mutate(selectedFile);
    }
  };

  const handleSave = () => {
    if (!foodEntry.mealType) {
      toast({
        title: "Missing meal type",
        description: "Please select a meal type before saving.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(foodEntry);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      
      <main className="main-content">
        <header className="bg-white dark:bg-card border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Food Scanner</h2>
              <p className="text-sm text-muted-foreground">Analyze your food with AI</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
          
          {/* Camera/Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Capture or Upload Food Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Image Preview */}
              {previewUrl ? (
                <div className="camera-preview">
                  <img src={previewUrl} alt="Food preview" className="w-full h-full object-cover rounded-lg" />
                </div>
              ) : (
                <div className="camera-preview">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>No image selected</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={handleCameraCapture} variant="default" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button onClick={handleFileUpload} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload from Gallery
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {/* Analyze Button */}
              {selectedFile && !analysisResult && (
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzeMutation.isPending}
                  className="w-full"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Food'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Confidence Warning */}
                {analysisResult.confidence < 0.7 && analysisResult.advice && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Low confidence analysis ({Math.round(analysisResult.confidence * 100)}%)
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {analysisResult.advice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Food Entry Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Food Description</Label>
                    <Textarea
                      id="description"
                      value={foodEntry.description}
                      onChange={(e) => setFoodEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the food item..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="mealType">Meal Type</Label>
                    <Select onValueChange={(value) => setFoodEntry(prev => ({ ...prev, mealType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={foodEntry.calories}
                        onChange={(e) => setFoodEntry(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        value={foodEntry.protein}
                        onChange={(e) => setFoodEntry(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        value={foodEntry.carbs}
                        onChange={(e) => setFoodEntry(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        value={foodEntry.fat}
                        onChange={(e) => setFoodEntry(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    disabled={saveMutation.isPending || !foodEntry.mealType}
                    className="w-full"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Add to Today\'s Meals'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
