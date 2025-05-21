import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TaskFormData } from "@shared/schema";
import { Input } from "@/components/ui/input";

// Define task template interface
interface TaskTemplate {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "seasonal";
  priority: "high" | "medium" | "low";
}

// Define template category interface
interface TemplateCategory {
  label: string;
  value: string;
  icon: JSX.Element;
  tasks: TaskTemplate[];
}

// Props for the TaskTemplates component
interface TaskTemplatesProps {
  onSelectTemplate: (template: TaskFormData) => void;
  onClose: () => void;
  onSelectMultiple?: (templates: TaskFormData[]) => void;
}

// Empty state component
const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center py-8">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8 text-blue-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </div>
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

// Task template data organized by frequency categories
const taskTemplateData: TemplateCategory[] = [
  {
    label: "Daily / As-Needed",
    value: "daily",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    tasks: [
      {
        title: "Check for water leaks",
        description: "Check under sinks, A/C lines, hot water heater",
        frequency: "daily",
        priority: "high"
      },
      {
        title: "Wipe down kitchen and bathroom surfaces",
        description: "Daily cleaning to prevent mold",
        frequency: "daily",
        priority: "medium"
      },
      {
        title: "Monitor indoor humidity levels",
        description: "Keep below 60%",
        frequency: "daily",
        priority: "medium"
      },
      {
        title: "Run water in unused sinks/showers",
        description: "Prevent dry p-traps and sewer gas",
        frequency: "daily",
        priority: "low"
      },
      {
        title: "Check security system",
        description: "Verify all doors and windows are locked",
        frequency: "daily",
        priority: "high"
      },
      {
        title: "Check refrigerator/freezer temperature",
        description: "Ensure optimal cooling temperatures",
        frequency: "daily",
        priority: "medium"
      }
    ]
  },
  {
    label: "Weekly",
    value: "weekly",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-green-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
      </svg>
    ),
    tasks: [
      {
        title: "Mow lawn / trim shrubs",
        description: "Weekly lawn maintenance",
        frequency: "weekly",
        priority: "medium"
      },
      {
        title: "Inspect pool water and balance chemicals",
        description: "If applicable - check chemical levels and clean surface",
        frequency: "weekly",
        priority: "medium"
      },
      {
        title: "Clean debris from property",
        description: "Clear driveway, patio, and around A/C unit",
        frequency: "weekly",
        priority: "low"
      },
      {
        title: "Clean ceiling fans and vents",
        description: "Dust removal on fans and air vents",
        frequency: "weekly",
        priority: "low"
      },
      {
        title: "Empty dehumidifiers or check A/C",
        description: "Check for moisture and proper drainage",
        frequency: "weekly",
        priority: "medium"
      },
      {
        title: "Check sprinkler heads and irrigation",
        description: "Ensure proper coverage and no broken heads",
        frequency: "weekly",
        priority: "medium"
      },
      {
        title: "Clean out garbage disposal",
        description: "Use ice cubes with vinegar or citrus peels",
        frequency: "weekly",
        priority: "low"
      },
      {
        title: "Check water softener salt level",
        description: "Add salt if below half full",
        frequency: "weekly",
        priority: "medium"
      }
    ]
  },
  {
    label: "Monthly",
    value: "monthly",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-yellow-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
        <line x1="8" x2="8" y1="14" y2="14"></line>
      </svg>
    ),
    tasks: [
      {
        title: "Replace HVAC air filters",
        description: "Monthly replacement for maximum efficiency",
        frequency: "monthly",
        priority: "high"
      },
      {
        title: "Clean kitchen exhaust filter",
        description: "Prevent grease buildup and fire hazards",
        frequency: "monthly",
        priority: "medium"
      },
      {
        title: "Test smoke & carbon monoxide detectors",
        description: "Monthly safety check of all detectors",
        frequency: "monthly",
        priority: "high"
      },
      {
        title: "Flush and clean garbage disposal",
        description: "Prevent clogs and odors in kitchen",
        frequency: "monthly",
        priority: "medium"
      },
      {
        title: "Inspect for pests",
        description: "Check for ants, termites, roaches, rodents",
        frequency: "monthly",
        priority: "medium"
      },
      {
        title: "Check irrigation/sprinkler system",
        description: "Check for leaks, clogs, or overspray",
        frequency: "monthly",
        priority: "medium"
      }
    ]
  },
  {
    label: "Quarterly",
    value: "quarterly",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-purple-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M3 6h18"></path>
        <path d="M3 12h18"></path>
        <path d="M3 18h18"></path>
      </svg>
    ),
    tasks: [
      {
        title: "Inspect roof for issues",
        description: "Check for loose shingles, flashing, or debris",
        frequency: "quarterly",
        priority: "high"
      },
      {
        title: "Pressure wash exterior surfaces",
        description: "Clean mold and salt buildup from walls/driveway",
        frequency: "quarterly",
        priority: "medium"
      },
      {
        title: "Inspect caulking around windows and doors",
        description: "Check for gaps or cracks to prevent water entry",
        frequency: "quarterly",
        priority: "medium"
      },
      {
        title: "Garage door maintenance",
        description: "Lubricate tracks and check safety sensors",
        frequency: "quarterly",
        priority: "medium"
      },
      {
        title: "Clean pool filter",
        description: "If applicable - deep clean filter system",
        frequency: "quarterly",
        priority: "medium"
      }
    ]
  },
  {
    label: "Annual",
    value: "annual",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-red-500" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <path d="M16 2v4"></path>
        <path d="M8 2v4"></path>
        <path d="M3 10h18"></path>
        <path d="M8 14h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 18h.01"></path>
        <path d="M12 18h.01"></path>
        <path d="M16 18h.01"></path>
      </svg>
    ),
    tasks: [
      {
        title: "Full termite inspection",
        description: "Professional pest inspection of entire property",
        frequency: "annual",
        priority: "high"
      },
      {
        title: "Deep clean carpets and rugs",
        description: "Professional cleaning recommended for deep soil removal",
        frequency: "annual",
        priority: "medium"
      },
      {
        title: "Drain and flush hot water heater",
        description: "Remove sediment buildup to extend lifespan",
        frequency: "annual",
        priority: "high"
      },
      {
        title: "Exterior maintenance",
        description: "Seal driveway and touch up exterior paint",
        frequency: "annual",
        priority: "medium"
      },
      {
        title: "Renew hurricane insurance",
        description: "Verify coverage before hurricane season",
        frequency: "annual",
        priority: "high"
      }
    ]
  }
];

const TaskTemplates = ({ onSelectTemplate, onClose, onSelectMultiple }: TaskTemplatesProps) => {
  // State management
  const [activeTab, setActiveTab] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<{[key: string]: TaskTemplate}>({});
  
  // Calculate number of selected tasks
  const selectedTasksCount = Object.keys(selectedTasks).length;
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTasks({});
  };
  
  // Toggle task selection
  const toggleTaskSelection = (template: TaskTemplate, taskId: string) => {
    setSelectedTasks(prev => {
      const newSelection = { ...prev };
      if (newSelection[taskId]) {
        delete newSelection[taskId];
      } else {
        newSelection[taskId] = template;
      }
      return newSelection;
    });
  };
  
  // Filter tasks based on search term
  const getFilteredTasks = (tasks: TaskTemplate[]) => {
    if (!searchTerm) return tasks;
    
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  // Convert template to task data
  const templateToTaskData = (template: TaskTemplate): TaskFormData => {
    return {
      title: template.title,
      description: template.description || "",
      priority: template.priority,
      frequency: template.frequency,
      status: "pending",
      dueDate: new Date()
    };
  };
  
  // Create a task from a template
  const createTaskFromTemplate = (template: TaskTemplate) => {
    const taskData = templateToTaskData(template);
    onSelectTemplate(taskData);
  };
  
  // Handle adding multiple selected tasks
  const handleAddSelectedTasks = () => {
    if (onSelectMultiple && selectedTasksCount > 0) {
      const selectedTemplates = Object.values(selectedTasks).map(templateToTaskData);
      onSelectMultiple(selectedTemplates);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-xl md:text-2xl">Task Templates</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="text-gray-500"
            >
              Close
            </Button>
            <Button 
              onClick={toggleSelectionMode} 
              variant={selectionMode ? "secondary" : "outline"} 
              size="sm"
              className={selectionMode ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
            >
              {selectionMode ? "Cancel Selection" : "Select Multiple"}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 absolute top-3 right-3 text-gray-400" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
          <div className="flex h-10 items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 rounded-l-md ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-600" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3"></rect>
                <rect width="7" height="7" x="14" y="3"></rect>
                <rect width="7" height="7" x="14" y="14"></rect>
                <rect width="7" height="7" x="3" y="14"></rect>
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 rounded-r-md ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-600" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
        
        {selectionMode && (
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-blue-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span className="text-blue-700 text-sm">
                {selectedTasksCount === 0 
                  ? "Select multiple templates to add at once" 
                  : `${selectedTasksCount} template${selectedTasksCount > 1 ? 's' : ''} selected`}
              </span>
            </div>
            
            {selectedTasksCount > 0 && (
              <Button
                size="sm"
                onClick={handleAddSelectedTasks}
                className="bg-[#16a1bd] hover:bg-[#138ea6]"
              >
                Add {selectedTasksCount} Task{selectedTasksCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2 -mx-4 px-4" style={{WebkitOverflowScrolling: 'touch'}}>
            <TabsList className="inline-flex w-full whitespace-nowrap mb-6" style={{touchAction: 'pan-x'}}>
              {taskTemplateData.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center justify-center gap-1.5 flex-1 min-h-[44px]"
                  style={{WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation'}}
                >
                  {category.icon}
                  <span className="text-xs md:text-sm whitespace-nowrap">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {taskTemplateData.map((category) => {
            const filteredTasks = getFilteredTasks(category.tasks);
            
            return (
              <TabsContent key={category.value} value={category.value} className="max-h-[60vh] overflow-y-auto pb-4" style={{WebkitOverflowScrolling: 'touch'}}>
                {filteredTasks.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTasks.map((task, index) => {
                        const taskId = `${category.value}-${index}`;
                        const isSelected = !!selectedTasks[taskId];
                        
                        return (
                          <div 
                            key={index}
                            style={{touchAction: 'manipulation'}}
                          >
                            <Card 
                              className={`overflow-hidden hover:shadow-md transition-shadow border-l-4 ${
                                isSelected 
                                  ? 'border-l-blue-500 ring-1 ring-blue-500 bg-blue-50' 
                                  : 'border-l-[#16a1bd]/60'
                              }`}
                            >
                              <div 
                                className="w-full h-full cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (selectionMode) {
                                    toggleTaskSelection(task, taskId);
                                  }
                                }}
                                style={{touchAction: 'manipulation'}}
                              >
                                <CardHeader className={`p-4 ${isSelected ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                      {selectionMode && (
                                        <div className={`w-5 h-5 flex-shrink-0 rounded border ${
                                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                        } flex items-center justify-center`}>
                                          {isSelected && (
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-3 w-3 text-white" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="3" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            >
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          )}
                                        </div>
                                      )}
                                      <CardTitle className="text-base md:text-lg">{task.title}</CardTitle>
                                    </div>
                                    <Badge
                                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                                      className="ml-2 whitespace-nowrap"
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                                  <div className="flex justify-between items-center">
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                      {category.label}
                                    </Badge>
                                    {!selectionMode && (
                                      <Button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          createTaskFromTemplate(task);
                                        }}
                                        size="sm"
                                        className="bg-[#16a1bd] hover:bg-[#138ea6]"
                                      >
                                        Use Template
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            {selectionMode && <th className="p-3 text-left w-10"></th>}
                            <th className="p-3 text-left">Task</th>
                            <th className="p-3 text-center">Priority</th>
                            <th className="p-3 text-center">Frequency</th>
                            {!selectionMode && <th className="p-3 text-right">Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((task, index) => {
                            const taskId = `${category.value}-${index}`;
                            const isSelected = !!selectedTasks[taskId];
                            
                            return (
                              <tr 
                                key={index} 
                                className={`border-b hover:bg-gray-50 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                {selectionMode && (
                                  <td className="p-3 align-middle">
                                    <div 
                                      style={{touchAction: 'manipulation'}}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskSelection(task, taskId);
                                      }}
                                    >
                                      <div className={`w-5 h-5 flex-shrink-0 rounded border ${
                                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                      } flex items-center justify-center mx-auto`}>
                                        {isSelected && (
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-3 w-3 text-white" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="3" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                )}
                                <td className="p-3 align-middle">
                                  <div 
                                    style={{touchAction: 'manipulation'}}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (selectionMode) {
                                        toggleTaskSelection(task, taskId);
                                      }
                                    }}
                                  >
                                    <div className="font-medium">{task.title}</div>
                                    {task.description && (
                                      <div className="text-sm text-gray-500 truncate max-w-[200px]">{task.description}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-center align-middle">
                                  <Badge
                                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                                  >
                                    {task.priority}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center align-middle">
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                    {task.frequency}
                                  </Badge>
                                </td>
                                {!selectionMode && (
                                  <td className="p-3 text-right align-middle">
                                    <Button 
                                      onClick={() => createTaskFromTemplate(task)}
                                      size="sm" 
                                      variant="outline"
                                      className="bg-[#16a1bd] text-white hover:bg-[#138ea6] hover:text-white"
                                    >
                                      Use
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <EmptyState 
                    title="No templates found" 
                    description="Try adjusting your search or select a different category."
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskTemplates;