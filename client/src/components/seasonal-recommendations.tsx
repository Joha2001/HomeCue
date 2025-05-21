import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SeasonalTask } from "@shared/seasonal-tasks";
import { Season, getCurrentSeason, getClimateRegionName } from "@shared/climate-regions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LocationSelector from "./location-selector";
import { PlusIcon, ArrowRightIcon, InfoIcon, AlertTriangleIcon } from "lucide-react";
import TaskModal from "./task-modal";

export function SeasonalRecommendations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SeasonalTask | null>(null);
  const [tab, setTab] = useState<"current" | "all">("current");
  
  // Current season
  const currentSeason = getCurrentSeason();
  
  // Get seasonal recommendations
  const { data: seasonalTasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['/api/seasonal-tasks'],
    retry: false,
    enabled: !!user,
  });
  
  // Check if user location is set
  const locationNeeded = isError && (error as any)?.needsLocation;

  // Handle Add Task button click
  const handleAddTask = (task: SeasonalTask) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };
  
  const closeLocationSelector = () => {
    setLocationSelectorOpen(false);
  };
  
  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setSelectedTask(null);
  };
  
  // Group tasks by priority
  const groupedTasks = seasonalTasks && seasonalTasks.length > 0 ? 
    seasonalTasks.reduce((acc: Record<string, SeasonalTask[]>, task: SeasonalTask) => {
      if (!acc[task.priority]) {
        acc[task.priority] = [];
      }
      acc[task.priority].push(task);
      return acc;
    }, {} as Record<string, SeasonalTask[]>) 
    : { high: [], medium: [], low: [] };
  
  const renderTasks = (tasks: SeasonalTask[]) => {
    if (!tasks || tasks.length === 0) {
      return <p className="text-muted-foreground">No tasks available</p>;
    }
    
    return tasks.map((task) => (
      <Card key={task.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle>{task.title}</CardTitle>
            <Badge variant={task.priority === 'high' ? 'destructive' : (task.priority === 'medium' ? 'default' : 'secondary')}>
              {task.priority}
            </Badge>
          </div>
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-sm text-muted-foreground">
            <p>⏱ {task.estimatedTime}</p>
            {task.tools && task.tools.length > 0 && (
              <p>🛠 Tools: {task.tools.join(', ')}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2"
            onClick={() => handleAddTask(task)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </CardFooter>
      </Card>
    ));
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seasonal Recommendations</h2>
          <p className="text-muted-foreground">
            Maintenance tasks recommended for your location and current season
          </p>
        </div>
        {user && (
          <Button onClick={() => setLocationSelectorOpen(true)}>
            {user.climateRegion ? 'Change Location' : 'Set Location'}
          </Button>
        )}
      </div>
      
      {locationNeeded ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
              Set Your Location 
            </CardTitle>
            <CardDescription>
              Location information helps us provide seasonal maintenance recommendations specific to your climate.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocationSelectorOpen(true)}>
              Set Location
            </Button>
          </CardFooter>
        </Card>
      ) : isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-36 animate-pulse bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-dashed border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangleIcon className="h-5 w-5 mr-2 text-destructive" />
              Cannot Load Recommendations
            </CardTitle>
            <CardDescription>
              There was an error loading seasonal recommendations. Please try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          {seasonalTasks && seasonalTasks.length > 0 ? (
            <Tabs defaultValue="current" value={tab} onValueChange={(value) => setTab(value as any)}>
              <TabsList>
                <TabsTrigger value="current">Current Season</TabsTrigger>
                <TabsTrigger value="all">All Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedTasks['high'] && renderTasks(groupedTasks['high'].filter(
                    task => task.seasons.includes(currentSeason)
                  ))}
                  {groupedTasks['medium'] && renderTasks(groupedTasks['medium'].filter(
                    task => task.seasons.includes(currentSeason)
                  ))}
                  {groupedTasks['low'] && renderTasks(groupedTasks['low'].filter(
                    task => task.seasons.includes(currentSeason)
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedTasks['high'] && renderTasks(groupedTasks['high'])}
                  {groupedTasks['medium'] && renderTasks(groupedTasks['medium'])}
                  {groupedTasks['low'] && renderTasks(groupedTasks['low'])}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Recommendations Available</CardTitle>
                <CardDescription>
                  There are no seasonal maintenance recommendations for your region at this time.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      )}
      
      {/* Location Selector Dialog */}
      <LocationSelector 
        isOpen={locationSelectorOpen} 
        onClose={closeLocationSelector}
        currentState={user?.state || undefined}
      />
      
      {/* Task Creation Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={closeTaskModal}
          initialDate={new Date()}
          task={{
            title: selectedTask.title,
            description: selectedTask.description,
            dueDate: new Date(),
            priority: selectedTask.priority,
            frequency: "seasonal",
            isRecurring: false,
            status: "pending"
          }}
        />
      )}
    </div>
  );
}