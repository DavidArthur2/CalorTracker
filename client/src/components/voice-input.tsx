import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Check, X, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface VoiceInputProps {
  onSuccess?: () => void;
}

export default function VoiceInput({ onSuccess }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const analyzeVoiceMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/analyze-voice', {
        transcription: text
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      
      if (!data.isRelevant) {
        toast({
          title: "Not food-related",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        // Food entry was created successfully
        queryClient.invalidateQueries({ 
          queryKey: [`/api/food-entries/${user?.id}/${new Date().toISOString().split('T')[0]}`] 
        });
        toast({
          title: "Meal logged successfully!",
          description: data.message,
        });
        onSuccess?.();
      } else {
        // Low confidence - ask user to clarify
        toast({
          title: "Please clarify",
          description: data.message,
          variant: "default",
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

  const startRecording = async () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRecording(true);
      setTranscription("");
      setAnalysis(null);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscription(transcript);
        analyzeVoiceMutation.mutate(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Recording failed",
          description: "Could not capture your voice. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

      toast({
        title: "Recording started",
        description: "Describe the food you just ate...",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="mr-2 h-5 w-5" />
          Voice Meal Logging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!isSupported && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Speech recognition is not supported in your browser. Please use Chrome or Edge for voice input.
            </p>
          </div>
        )}

        {/* Recording Button */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isSupported || analyzeVoiceMutation.isPending}
            size="lg"
            className={`w-24 h-24 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {analyzeVoiceMutation.isPending ? (
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            ) : isRecording ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            {isRecording 
              ? "Listening... Describe what you ate" 
              : analyzeVoiceMutation.isPending
              ? "Analyzing your food..."
              : "Tap to start recording"
            }
          </p>
        </div>

        {/* Transcription Display */}
        {transcription && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              What you said:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              "{transcription}"
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {analysis.success ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : analysis.isRelevant ? (
                <X className="h-5 w-5 text-yellow-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {analysis.success ? "Meal Logged" : analysis.isRelevant ? "Low Confidence" : "Not Food Related"}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {analysis.message}
            </p>

            {analysis.analysis && analysis.isRelevant && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Calories:</span> {analysis.analysis.calories || 0}
                </div>
                <div>
                  <span className="font-medium">Protein:</span> {analysis.analysis.protein || 0}g
                </div>
                <div>
                  <span className="font-medium">Carbs:</span> {analysis.analysis.carbs || 0}g
                </div>
                <div>
                  <span className="font-medium">Fat:</span> {analysis.analysis.fat || 0}g
                </div>
                {analysis.analysis.confidence && (
                  <div className="col-span-2">
                    <span className="font-medium">Confidence:</span>
                    <Badge variant={analysis.analysis.confidence > 0.7 ? "default" : "secondary"} className="ml-2">
                      {Math.round(analysis.analysis.confidence * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Tips for better recognition:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Speak clearly and describe the food item</li>
            <li>Include portion sizes (e.g., "one slice of pizza")</li>
            <li>Mention cooking method if relevant</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}