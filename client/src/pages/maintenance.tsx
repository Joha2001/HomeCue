import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import TaskCard from "@/components/task-card";
import TaskModal from "@/components/task-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Maintenance = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Open task modal for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    if (!tasks) return [];
    
    if (activeTab === "all") {
      return tasks;
    } else if (activeTab === "pending") {
      return tasks.filter(task => task.status === "pending");
    } else if (activeTab === "completed") {
      return tasks.filter(task => task.status === "completed");
    } else if (activeTab === "overdue") {
      return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return task.status === "pending" && taskDate < today;
      });
    } else {
      // Filter by frequency
      return tasks.filter(task => task.frequency === activeTab);
    }
  };

  const filteredTasks = getFilteredTasks();

  // Group tasks by their category for display
  const groupTasksByCategory = () => {
    const grouped: { [key: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      if (!grouped[task.frequency]) {
        grouped[task.frequency] = [];
      }
      grouped[task.frequency].push(task);
    });
    
    return grouped;
  };

  const groupedTasks = groupTasksByCategory();

  // Get the display name for a frequency
  const getFrequencyDisplayName = (frequency: string) => {
    const displayNames: { [key: string]: string } = {
      daily: "Daily Tasks",
      weekly: "Weekly Tasks",
      monthly: "Monthly Tasks",
      quarterly: "Quarterly Tasks",
      annual: "Annual Tasks",
      seasonal: "Seasonal Tasks"
    };
    
    return displayNames[frequency] || frequency;
  };

  return (
    <main className="px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Tasks</h2>
          <Button onClick={() => setIsTaskModalOpen(true)} className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="animate-spin h-8 w-8 text-primary" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
              </div>
            ) : filteredTasks.length > 0 ? (
              activeTab === "all" ? (
                // Group tasks by category when showing all tasks
                Object.keys(groupedTasks).map(frequency => (
                  <div key={frequency} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {getFrequencyDisplayName(frequency)}
                    </h3>
                    <div className="space-y-4">
                      {groupedTasks[frequency].map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask} 
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show a flat list for filtered tasks
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask} 
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks found in this category.</p>
                <Button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-4"
                >
                  Add New Task
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={closeTaskModal} 
        task={editingTask}
      />
    </main>
  );
};

export default Maintenance;
