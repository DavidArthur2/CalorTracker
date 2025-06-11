import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink
} from "lucide-react";

interface FriendlyErrorProps {
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  onHome?: () => void;
  showDetails?: boolean;
  type?: "error" | "warning" | "info";
}

export default function FriendlyError({
  title = "Oops! Something went wrong",
  message = "We encountered an unexpected issue. Don't worry, this happens sometimes!",
  details,
  onRetry,
  onHome,
  showDetails = false,
  type = "error"
}: FriendlyErrorProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = async () => {
    if (details) {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getErrorIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case "info":
        return <MessageCircle className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  const getGradientClass = () => {
    switch (type) {
      case "warning":
        return "from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20";
      case "info":
        return "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20";
      default:
        return "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20";
    }
  };

  const getBorderClass = () => {
    switch (type) {
      case "warning":
        return "border-orange-200 dark:border-orange-800";
      case "info":
        return "border-blue-200 dark:border-blue-800";
      default:
        return "border-red-200 dark:border-red-800";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className={`max-w-lg w-full shadow-2xl border-2 ${getBorderClass()} bg-gradient-to-br ${getGradientClass()}`}>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
            {getErrorIcon()}
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {message}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Solutions */}
          <Alert className="border-0 bg-white/50 dark:bg-gray-800/50">
            <MessageCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Quick fixes to try:</strong>
              <ul className="mt-2 ml-4 space-y-1 list-disc text-xs">
                <li>Refresh the page and try again</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Try again in a few minutes</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onHome && (
              <Button
                onClick={onHome}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>

          {/* Technical Details (Expandable) */}
          {(showDetails && details) && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="w-full flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                size="sm"
              >
                <span className="text-sm">Technical Details</span>
                {detailsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {detailsExpanded && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {details}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyDetails}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open("mailto:support@calortracker.com", "_blank")}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Information */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Still having trouble? Contact our{" "}
              <button 
                onClick={() => window.open("mailto:support@calortracker.com", "_blank")}
                className="text-blue-500 hover:text-blue-600 underline transition-colors"
              >
                support team
              </button>
              {" "}for help.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing error states
export function useErrorHandler() {
  const [error, setError] = useState<{
    title?: string;
    message?: string;
    details?: string;
    type?: "error" | "warning" | "info";
  } | null>(null);

  const showError = (errorInfo: {
    title?: string;
    message?: string;
    details?: string;
    type?: "error" | "warning" | "info";
  }) => {
    setError(errorInfo);
  };

  const clearError = () => {
    setError(null);
  };

  const handleApiError = (err: any) => {
    console.error("API Error:", err);
    
    if (err.message?.includes("401")) {
      showError({
        title: "Authentication Required",
        message: "Your session has expired. Please sign in again to continue.",
        type: "warning"
      });
    } else if (err.message?.includes("403")) {
      showError({
        title: "Access Denied",
        message: "You don't have permission to perform this action.",
        type: "warning"
      });
    } else if (err.message?.includes("404")) {
      showError({
        title: "Not Found",
        message: "The requested resource could not be found.",
        type: "info"
      });
    } else if (err.message?.includes("500")) {
      showError({
        title: "Server Error",
        message: "We're experiencing technical difficulties. Please try again in a few minutes.",
        details: err.message
      });
    } else {
      showError({
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again.",
        details: err.message
      });
    }
  };

  return {
    error,
    showError,
    clearError,
    handleApiError
  };
}