import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface TaskPrediction {
  title: string;
  description: string;
  suggestedDate: string;
  priority: "high" | "medium" | "low";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "seasonal";
  confidence: number;
}

interface ScheduleOptimization {
  taskId: number;
  currentDueDate: string;
  suggestedDueDate: string;
  reason: string;
}

export function AITaskRecommendations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recommendations");

  // Fetch AI recommendations
  const { 
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError
  } = useQuery<TaskPrediction[]>({
    queryKey: ["/api/predictions/recommendations"],
    refetchInterval: false, // Don't auto-refresh to avoid excessive API calls
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Fetch predicted tasks
  const { 
    data: predictedTasks,
    isLoading: predictionsLoading,
    error: predictionsError
  } = useQuery<TaskPrediction[]>({
    queryKey: ["/api/predictions/tasks"],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === "predictions", // Only fetch when this tab is active
  });

  // Fetch schedule optimizations
  const { 
    data: scheduleOptimizations,
    isLoading: optimizationsLoading,
    error: optimizationsError
  } = useQuery<ScheduleOptimization[]>({
    queryKey: ["/api/predictions/optimize"],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === "optimize", // Only fetch when this tab is active
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

  // Mutation for applying schedule optimization
  const applyOptimizationMutation = useMutation({
    mutationFn: async (optimization: ScheduleOptimization) => {
      const response = await apiRequest("PATCH", `/api/tasks/${optimization.taskId}`, {
        dueDate: new Date(optimization.suggestedDueDate),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule optimized",
        description: "Task has been rescheduled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/optimize"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to optimize schedule",
        description: error.message,
      });
    },
  });

  // Function to apply all optimizations at once
  const applyAllOptimizations = () => {
    if (!scheduleOptimizations || scheduleOptimizations.length === 0) return;
    
    // Confirm before applying all optimizations
    if (window.confirm(`Apply all ${scheduleOptimizations.length} schedule optimizations?`)) {
      // Apply each optimization one by one
      Promise.all(
        scheduleOptimizations.map(optimization => 
          applyOptimizationMutation.mutateAsync(optimization)
        )
      )
        .then(() => {
          toast({
            title: "Schedule optimized",
            description: `Applied ${scheduleOptimizations.length} optimizations`,
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Failed to apply all optimizations",
            description: error.message,
          });
        });
    }
  };

  // Helper function to get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-yellow-500 bg-yellow-50";
      case "low":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  // Helper function to get color for frequency
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "text-blue-500 bg-blue-50";
      case "weekly":
        return "text-indigo-500 bg-indigo-50";
      case "monthly":
        return "text-purple-500 bg-purple-50";
      case "quarterly":
        return "text-cyan-500 bg-cyan-50";
      case "annual":
        return "text-teal-500 bg-teal-50";
      case "seasonal":
        return "text-orange-500 bg-orange-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  // Render confidence score as percentage with visual indicator
  const renderConfidence = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let color = "bg-gray-200";
    
    if (percentage >= 90) color = "bg-green-500";
    else if (percentage >= 70) color = "bg-green-400";
    else if (percentage >= 50) color = "bg-yellow-400";
    else color = "bg-red-400";
    
    return (
      <div className="flex items-center mt-1">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 ml-2">{percentage}%</span>
      </div>
    );
  };

  // Loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6 mt-2" />
            <div className="flex justify-between mt-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error component
  const renderError = (message: string) => (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">Error</CardTitle>
        <CardDescription className="text-red-600">
          Could not load AI recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="text-red-700">
        {message}
      </CardContent>
    </Card>
  );

  return (
    <Card className="shadow-lg border-[#16a1bd]/20">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-[#16a1bd]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a8 8 0 0 1 8 8v12l-8-4-8 4V10a8 8 0 0 1 8-8z"></path>
          </svg>
          <CardTitle className="text-lg text-[#16a1bd]">AI Smart Assistant</CardTitle>
        </div>
        <CardDescription>
          AI-powered recommendations to help you manage your home maintenance tasks more efficiently
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="recommendations" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-3">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="recommendations" className="mt-0 p-4">
          {recommendationsLoading ? (
            renderSkeletons()
          ) : recommendationsError ? (
            renderError(recommendationsError.message)
          ) : !recommendations || recommendations.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No AI recommendations available yet.</p>
                <p className="text-gray-500 text-sm mt-1">Try adding more tasks to improve predictions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-semibold">{recommendation.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority} priority
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getFrequencyColor(recommendation.frequency)}`}>
                        {recommendation.frequency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 mb-1">{recommendation.description}</p>
                    <p className="text-xs text-gray-500">
                      Suggested date: <span className="font-medium">{formatDate(recommendation.suggestedDate)}</span>
                    </p>
                    {renderConfidence(recommendation.confidence)}
                  </CardContent>
                  <CardFooter className="pt-2 justify-end gap-2 border-t bg-gray-50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => createTaskMutation.mutate(recommendation)}
                      disabled={createTaskMutation.isPending}
                    >
                      Add to Tasks
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="predictions" className="mt-0 p-4">
          {predictionsLoading ? (
            renderSkeletons()
          ) : predictionsError ? (
            renderError(predictionsError.message)
          ) : !predictedTasks || predictedTasks.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No task predictions available yet.</p>
                <p className="text-gray-500 text-sm mt-1">AI needs more task data to make predictions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {predictedTasks.map((prediction, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-semibold">{prediction.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(prediction.priority)}`}>
                        {prediction.priority} priority
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getFrequencyColor(prediction.frequency)}`}>
                        {prediction.frequency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 mb-1">{prediction.description}</p>
                    <p className="text-xs text-gray-500">
                      Predicted date: <span className="font-medium">{formatDate(prediction.suggestedDate)}</span>
                    </p>
                    {renderConfidence(prediction.confidence)}
                  </CardContent>
                  <CardFooter className="pt-2 justify-end gap-2 border-t bg-gray-50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => createTaskMutation.mutate(prediction)}
                      disabled={createTaskMutation.isPending}
                    >
                      Add to Tasks
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="optimize" className="mt-0 p-4">
          {optimizationsLoading ? (
            renderSkeletons()
          ) : optimizationsError ? (
            renderError(optimizationsError.message)
          ) : !scheduleOptimizations || scheduleOptimizations.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No schedule optimizations available.</p>
                <p className="text-gray-500 text-sm mt-1">Your schedule is already well-balanced or you need more tasks to optimize.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={applyAllOptimizations}
                  disabled={applyOptimizationMutation.isPending}
                >
                  Apply All Optimizations
                </Button>
              </div>
              <div className="space-y-4">
                {scheduleOptimizations.map((optimization, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-semibold">Schedule Optimization #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="text-gray-600">
                          <span className="font-medium">Current date:</span> {formatDate(optimization.currentDueDate)}
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-gray-400" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                        <div className="text-green-600">
                          <span className="font-medium">Suggested date:</span> {formatDate(optimization.suggestedDueDate)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{optimization.reason}</p>
                    </CardContent>
                    <CardFooter className="pt-2 justify-end gap-2 border-t bg-gray-50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => applyOptimizationMutation.mutate(optimization)}
                        disabled={applyOptimizationMutation.isPending}
                      >
                        Apply Change
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}