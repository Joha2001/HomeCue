import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Task, taskFormSchema, TaskFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import TaskTemplates from "./task-templates";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  initialDate?: Date | null;
}

const TaskModal = ({ isOpen, onClose, task, initialDate }: TaskModalProps) => {
  const { toast } = useToast();
  const isEditing = !!task;
  
  const [dueTime, setDueTime] = useState<string>("12:00");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("form");
  // Show templates by default for demonstration
  const [showTemplates, setShowTemplates] = useState(true);
  
  // For multi-task creation flow
  const [multiTaskData, setMultiTaskData] = useState<TaskFormData[]>([]);
  const [showMultiConfirm, setShowMultiConfirm] = useState(false);

  // Fetch vendors for the vendor selection dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    enabled: isOpen,
  });

  // Format the date and time for the form
  const formatForDateInput = (date: Date | string | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const formatForTimeInput = (date: Date | string | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'HH:mm');
  };

  // Default values for the form
  const getDefaultValues = (): TaskFormData => {
    if (isEditing && task) {
      const reminderTime = task.reminderTime ? formatForTimeInput(task.reminderTime) : '';
      setReminderEnabled(!!reminderTime);
      setDueTime(formatForTimeInput(task.dueDate));
      
      return {
        title: task.title,
        description: task.description || '',
        dueDate: formatForDateInput(task.dueDate),
        reminderTime,
        frequency: task.frequency,
        priority: task.priority,
        status: task.status,
        isRecurring: task.isRecurring,
        userId: task.userId,
        vendorId: task.vendorId,
      };
    }
    
    // Use initialDate if provided from calendar view
    const dateToUse = initialDate || new Date();
    
    // Default values for new task
    return {
      title: '',
      description: '',
      dueDate: formatForDateInput(dateToUse),
      frequency: 'monthly',
      priority: 'medium',
      status: 'pending',
      isRecurring: false,
      userId: 1,
    };
  };

  // Initialize the form
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Update form values when task changes
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, task]);
  
  // Mutation for creating multiple tasks at once
  const createMultipleTasksMutation = useMutation({
    mutationFn: async (dataList: TaskFormData[]) => {
      // Create a promise for each task creation
      const promises = dataList.map(data => 
        apiRequest('POST', '/api/tasks', data)
          .then(response => response.json())
      );
      
      // Wait for all promises to resolve
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      toast({
        title: "Tasks created",
        description: `Successfully created ${results.length} tasks.`,
      });
      
      // Invalidate all task queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      
      // Close the dialog and reset state
      setShowMultiConfirm(false);
      setMultiTaskData([]);
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create tasks",
        description: error.message,
      });
    }
  });

  // Mutations for creating and updating tasks
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest('POST', '/api/tasks', data);
      return response.json();
    },
    onSuccess: (newTask) => {
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
      // Invalidate all task-related queries to ensure calendar view is updated
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      
      // Store the new task's date in sessionStorage for calendar view synchronization
      if (newTask && newTask.dueDate) {
        sessionStorage.setItem('last_created_task_date', newTask.dueDate);
      }
      
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error.message,
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest('PUT', `/api/tasks/${task?.id}`, data);
      return response.json();
    },
    onSuccess: (updatedTask) => {
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      
      // If status changed to completed, update calendar to show completed task
      if (updatedTask && updatedTask.status === 'completed' && updatedTask.dueDate) {
        sessionStorage.setItem('last_completed_task_date', updatedTask.dueDate);
      }
      
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error.message,
      });
    }
  });
  
  // Function to handle multiple template selection
  const handleMultipleTemplatesSelect = (templatesData: TaskFormData[]) => {
    if (templatesData.length === 0) return;
    
    setMultiTaskData(templatesData);
    setShowMultiConfirm(true);
  };

  // Function to handle single template selection
  const handleTemplateSelect = (templateData: TaskFormData) => {
    // Reset the form with template data
    form.reset(templateData);
    
    // Parse the date and set time
    if (templateData.dueDate) {
      const dueDate = new Date(templateData.dueDate);
      setDueTime(format(dueDate, 'HH:mm'));
    }
    
    // Set reminder if available
    if (templateData.reminderTime) {
      setReminderEnabled(true);
    }
    
    // Switch back to form tab
    setActiveTab("form");
    setShowTemplates(false);
  };

  const onSubmit = (data: TaskFormData) => {
    // Add time to the due date
    const [hours, minutes] = dueTime.split(':').map(Number);
    const dueDate = new Date(data.dueDate);
    dueDate.setHours(hours, minutes, 0, 0);
    data.dueDate = dueDate.toISOString();
    
    // Only add reminder time if enabled
    if (reminderEnabled && data.reminderTime) {
      // If just a time format (HH:MM), add the date part
      if (data.reminderTime.includes(':') && !data.reminderTime.includes('T')) {
        const [rHours, rMinutes] = data.reminderTime.split(':').map(Number);
        const reminderDate = new Date(data.dueDate);
        reminderDate.setHours(rHours, rMinutes, 0, 0);
        data.reminderTime = reminderDate.toISOString();
      }
    } else {
      data.reminderTime = undefined;
    }
    
    if (isEditing) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };
  
  // Function to create multiple tasks
  const handleCreateMultipleTasks = () => {
    if (multiTaskData.length === 0) return;
    
    // Process each task data with time formatting
    const formattedTasks = multiTaskData.map(data => {
      // Add default time to the due date if not specified
      try {
        const dueDate = new Date(data.dueDate);
        dueDate.setHours(12, 0, 0, 0); // Default to noon
        
        return {
          ...data,
          dueDate: dueDate.toISOString(),
          // Clear reminder time for batch operations for simplicity
          reminderTime: undefined
        };
      } catch (e) {
        // If date parsing fails, return data as is
        return data;
      }
    });
    
    // Start the mutation
    createMultipleTasksMutation.mutate(formattedTasks);
  };

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending || createMultipleTasksMutation.isPending;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`${showTemplates ? "sm:max-w-[900px]" : "sm:max-w-[500px]"}`}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update your task details below.' 
                : showTemplates 
                  ? 'Choose from our pre-defined task templates or create your own.' 
                  : 'Fill in the details for your new task.'}
            </DialogDescription>
          </DialogHeader>

          {showTemplates ? (
            <TaskTemplates 
              onSelectTemplate={handleTemplateSelect}
              onSelectMultiple={handleMultipleTemplatesSelect}
              onClose={() => setShowTemplates(false)} 
            />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!isEditing && (
                  <div className="mb-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowTemplates(true)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                      </svg>
                      Browse Task Templates
                    </Button>
                  </div>
                )}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description" 
                        rows={3} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="ios-date-input" 
                          style={{
                            fontSize: '16px', // Prevents iOS zoom on focus
                            touchAction: 'manipulation',
                            WebkitAppearance: 'none', // Better iOS styling
                            height: '44px', // Larger touch target
                            cursor: 'pointer'
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel htmlFor="dueTime">Due Time</FormLabel>
                  <Input
                    id="dueTime"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="mt-1 ios-time-input"
                    style={{
                      fontSize: '16px', // Prevents iOS zoom on focus
                      touchAction: 'manipulation',
                      WebkitAppearance: 'none', // Better iOS styling
                      height: '44px', // Larger touch target
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                  id="reminder-switch"
                />
                <label htmlFor="reminder-switch" className="text-sm font-medium text-gray-700">
                  Set Reminder
                </label>
              </div>

              {reminderEnabled && (
                <FormField
                  control={form.control}
                  name="reminderTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          className="ios-time-input"
                          style={{
                            fontSize: '16px', // Prevents iOS zoom on focus
                            touchAction: 'manipulation',
                            WebkitAppearance: 'none', // Better iOS styling
                            height: '44px', // Larger touch target
                            cursor: 'pointer'
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Vendor (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} 
                      defaultValue={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Array.isArray(vendors) && vendors.map((vendor: any) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Make this a recurring task</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Multi-task Confirmation Dialog */}
      <AlertDialog open={showMultiConfirm} onOpenChange={setShowMultiConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Multiple Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to create {multiTaskData.length} tasks from the selected templates. 
              These tasks will be scheduled based on their frequency, and you can always edit them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="max-h-60 overflow-y-auto my-4 border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Task</th>
                  <th className="text-left py-2 px-3 hidden sm:table-cell">Category</th>
                  <th className="text-left py-2 px-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {multiTaskData.map((task, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-2 px-3 font-medium">{task.title}</td>
                    <td className="py-2 px-3 hidden sm:table-cell">{task.frequency}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowMultiConfirm(false);
                setMultiTaskData([]);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateMultipleTasks}
              className="bg-[#16a1bd] hover:bg-[#138ea6]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                `Create ${multiTaskData.length} Tasks`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskModal;