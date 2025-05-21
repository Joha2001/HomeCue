import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface TaskPrediction {
  title: string;
  description: string;
  suggestedDate: string;
  priority: "high" | "medium" | "low";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "seasonal";
  confidence: number;
}

export function AIRecommendationsCard() {
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  // Fetch top 3 AI recommendations
  const { 
    data: recommendations,
    isLoading,
    error
  } = useQuery<TaskPrediction[]>({
    queryKey: ["/api/predictions/recommendations"],
    refetchInterval: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for creating a task from recommendation
  const createTaskMutation = useMutation({
    mutationFn: async (recommendation: TaskPrediction) => {
      const taskData = {
        title: recommendation.title,
        description: recommendation.description,
        dueDate: new Date(recommendation.suggestedDate),
        priority: recommendation.priority,
        frequency: recommendation.frequency,
        status: "pending",
        isRecurring: recommendation.frequency !== "seasonal",
        userId: 1, // Default user for demo
      };
      
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task created",
        description: "Task has been added to your schedule",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error.message,
      });
    },
  });

  // Get display recommendations (limited to 3 if not showing all)
  const displayRecommendations = showAll 
    ? recommendations 
    : recommendations?.slice(0, 3);

  // Helper function to get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#16a1bd]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 1 8 8v12l-8-4-8 4V10a8 8 0 0 1 8-8z"></path>
            </svg>
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#16a1bd]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 1 8 8v12l-8-4-8 4V10a8 8 0 0 1 8-8z"></path>
            </svg>
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Unable to load recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#16a1bd]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 1 8 8v12l-8-4-8 4V10a8 8 0 0 1 8-8z"></path>
            </svg>
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No recommendations available yet.</p>
          <p className="text-xs text-gray-400 mt-1">Try adding more tasks to improve predictions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#16a1bd]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a8 8 0 0 1 8 8v12l-8-4-8 4V10a8 8 0 0 1 8-8z"></path>
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a1bd] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a1bd]"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base">Smart Recommendations</span>
              <span className="text-[10px] text-gray-500">AI-powered insights</span>
            </div>
          </div>
          <Link href="/smart-assistant" className="text-xs text-[#16a1bd] hover:underline">
            View all
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayRecommendations?.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2">
              <div 
                className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  getPriorityColor(recommendation.priority)
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium">{recommendation.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:text-[#16a1bd]"
                    onClick={() => createTaskMutation.mutate(recommendation)}
                    disabled={createTaskMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(recommendation.suggestedDate)} • {recommendation.frequency}
                </p>
                
                {/* Add confidence indicator bar */}
                <div className="mt-1.5 flex items-center gap-1">
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#16a1bd]" 
                      style={{ width: `${Math.round(recommendation.confidence * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {Math.round(recommendation.confidence * 100)}% match
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add explanation about AI predictions */}
          {displayRecommendations && displayRecommendations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-full bg-blue-50">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#16a1bd" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M2 12.5c1.4-1.4 3.2-2.2 5.1-2.2s3.7.8 5.1 2.2c1.4 1.4 3.2 2.2 5.1 2.2"></path>
                    <path d="M5.1 14.7V17s0 3 3.4 3 3.4-3 3.4-3v-2.3"></path>
                    <path d="M8.5 11.2V9c0-2.4-1.1-3-2.5-3H5.1"></path>
                    <path d="M17.1 11.2V9c0-2.4 1.1-3 2.5-3h.9"></path>
                  </svg>
                </div>
                <p className="text-xs text-gray-600">
                  These recommendations are personalized based on your location, season, and maintenance history using advanced AI analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}