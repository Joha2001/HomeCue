import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'High Priority' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Priority' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Low Priority' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No Priority' };
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Daily' };
      case 'weekly':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Weekly' };
      case 'monthly':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Monthly' };
      case 'quarterly':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Quarterly' };
      case 'annual':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Annual' };
      case 'seasonal':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Seasonal' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: frequency };
    }
  };

  const getDueLabel = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    
    return new Date(dueDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Mutation for marking task as complete
  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      setIsCompleting(true);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const response = await apiRequest('PATCH', `/api/tasks/${task.id}/status`, { status: newStatus });
      const data = await response.json();
      return data;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      
      // If task was marked as completed, store its date for calendar synchronization
      if (task.status !== 'completed' && task.dueDate) {
        sessionStorage.setItem('last_completed_task_date', new Date(task.dueDate).toISOString());
      }
      
      toast({
        title: task.status === 'completed' ? "Task marked as pending" : "Task completed!",
        description: task.title,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error.message,
      });
    },
    onSettled: () => {
      setIsCompleting(false);
    }
  });

  // Mutation for deleting task
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/tasks/${task.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      toast({
        title: "Task deleted",
        description: task.title,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: error.message,
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate();
    }
  };

  const priorityBadge = getPriorityBadge(task.priority);
  const frequencyBadge = getFrequencyBadge(task.frequency);

  return (
    <div className={`task-card bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-lg transition-all duration-300 active:scale-[0.985]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
          <div className="pt-1">
            <div className="relative inline-flex h-5 w-5 sm:h-6 sm:w-6">
              <input 
                type="checkbox" 
                checked={task.status === 'completed'}
                onChange={() => toggleCompleteMutation.mutate()}
                disabled={isCompleting}
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-[#16a1bd] text-[#16a1bd] focus:ring-[#16a1bd] transition-all duration-200 cursor-pointer relative z-10"
                style={{
                  touchAction: "manipulation",
                  WebkitAppearance: "none",
                  appearance: "none"
                }}
              />
              {isCompleting && (
                <span className="absolute inset-0 flex items-center justify-center z-0">
                  <svg className="animate-spin h-4 w-4 text-[#16a1bd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base sm:text-lg font-medium truncate ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center flex-wrap mt-2 gap-1.5 sm:gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                {priorityBadge.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${frequencyBadge.bg} ${frequencyBadge.text}`}>
                {frequencyBadge.label}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 mr-1 flex-shrink-0" 
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
                <span className="truncate">{getDueLabel(task.dueDate)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 space-x-2 sm:space-x-3">
          <button 
            type="button" 
            className="text-gray-500 hover:text-[#16a1bd] p-2 sm:p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 active:scale-95"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            style={{
              minHeight: "44px",
              minWidth: "44px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              touchAction: "manipulation"
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 sm:h-6 sm:w-6" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </button>
          <button 
            type="button" 
            className="text-gray-500 hover:text-red-500 p-2 sm:p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 active:scale-95"
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
            aria-label="Delete task"
            style={{
              minHeight: "44px",
              minWidth: "44px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              touchAction: "manipulation"
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 sm:h-6 sm:w-6" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
