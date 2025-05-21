import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";
import TaskModal from "@/components/task-modal";
import CalendarComponent from "@/components/calendar-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    // Check if there's a recently created or completed task date in sessionStorage
    const lastCreatedTaskDate = sessionStorage.getItem('last_created_task_date');
    const lastCompletedTaskDate = sessionStorage.getItem('last_completed_task_date');
    
    // Prioritize the most recent date
    if (lastCreatedTaskDate) {
      // Clear the storage after using it
      sessionStorage.removeItem('last_created_task_date');
      return new Date(lastCreatedTaskDate);
    }
    
    if (lastCompletedTaskDate) {
      // Clear the storage after using it
      sessionStorage.removeItem('last_completed_task_date');
      return new Date(lastCompletedTaskDate);
    }
    
    return new Date();
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get tasks for selected date
  const getTasksForSelectedDate = () => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  };

  // Format task time for display
  const formatTaskTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  // Open task modal for new task on selected date
  const openAddTaskModal = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  // Open task modal for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  // Get prioritized tasks for a specific date
  const getTasksForDate = (date: Date) => {
    if (!tasks) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Get color for priority indicator
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const selectedDateTasks = getTasksForSelectedDate();

  return (
    <main className="px-4 md:px-6 py-4 md:py-8 max-w-full overflow-x-hidden">
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Calendar View</h2>
          <Button onClick={openAddTaskModal} className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 md:h-5 md:w-5 mr-1" 
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
            <span className="text-sm md:text-base">Add Task</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2">
          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Calendar</h2>
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 md:h-5 md:w-5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </Button>
                <span className="text-xs md:text-sm font-medium px-2">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 md:h-5 md:w-5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-60 md:h-80">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="animate-spin h-6 w-6 md:h-8 md:w-8 text-primary" 
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
            ) : (
              <CalendarComponent 
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                tasks={tasks || []}
              />
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
              Tasks on {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedDateTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center p-2 md:p-3 rounded-md ${task.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'} hover:bg-gray-100 cursor-pointer transition-colors`}
                    onClick={() => handleEditTask(task)}
                  >
                    <span className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full mr-2 md:mr-3`}></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs md:text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                          {task.title}
                        </span>
                        {task.status === 'completed' && (
                          <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {formatTaskTime(task.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6 md:py-10 text-sm">No tasks scheduled for this date</p>
            )}
            
            <Button onClick={openAddTaskModal} className="w-full mt-4 text-sm md:text-base">
              Add Task for This Date
            </Button>
          </Card>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={closeTaskModal} 
        task={editingTask}
        initialDate={selectedDate}
      />
    </main>
  );
};

export default Calendar;
