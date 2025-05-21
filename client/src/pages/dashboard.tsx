import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, Vendor, User } from "@shared/schema";
import TaskCard from "@/components/task-card";
import TaskModal from "@/components/task-modal";
import VendorCard from "@/components/vendor-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeasonalRecommendations } from "@/components/seasonal-recommendations";
import { AIRecommendationsCard } from "@/components/ai-recommendations-card";
import { HouseHealthCard } from "@/components/house-health-card";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    // Get frequency filter from URL if available
    location.includes('frequency=') 
      ? location.split('frequency=')[1] 
      : undefined
  );
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewUser, setIsNewUser] = useState(false);
  const { user } = useAuth();
  // Ensure proper typing for user data from auth context
  const authUser = user as { name?: string } | null | undefined;

  // Queries
  const { data: userData } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  const { data: allTasks = [], isLoading: isTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: tasksToday = [], isLoading: isTodayTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks/today'],
  });

  const { data: upcomingTasks = [], isLoading: isUpcomingTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks/upcoming', 7], // Get tasks for next 7 days
  });

  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  // Filter tasks based on selected filters
  const filteredTasks = tasksToday?.filter(task => {
    if (categoryFilter && task.frequency !== categoryFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  // Add event listener for opening task modal from mobile nav
  useEffect(() => {
    const handleOpenTaskModal = () => {
      setIsTaskModalOpen(true);
    };
    
    document.addEventListener('opentaskmodal', handleOpenTaskModal);
    
    return () => {
      document.removeEventListener('opentaskmodal', handleOpenTaskModal);
    };
  }, []);
  
  // Task stats calculations
  const calculateStats = () => {
    if (!allTasks || !Array.isArray(allTasks) || allTasks.length === 0) {
      return { 
        today: { total: 0, completed: 0 },
        week: { total: 0, completed: 0 },
        month: { total: 0, completed: 0 },
        upcoming: 0
      };
    }
    
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    
    const monthEnd = new Date(now);
    monthEnd.setMonth(now.getMonth() + 1);
    
    const todayTasks = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= todayStart && taskDate.setHours(0, 0, 0, 0) === todayStart.getTime();
    });
    
    const weekTasks = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate > todayStart && taskDate <= weekEnd;
    });
    
    const monthTasks = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate > weekEnd && taskDate <= monthEnd;
    });
    
    const upcomingCount = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate > monthEnd;
    }).length;
    
    return {
      today: {
        total: todayTasks.length,
        completed: todayTasks.filter(task => task.status === 'completed').length
      },
      week: {
        total: weekTasks.length,
        completed: weekTasks.filter(task => task.status === 'completed').length
      },
      month: {
        total: monthTasks.length,
        completed: monthTasks.filter(task => task.status === 'completed').length
      },
      upcoming: upcomingCount
    };
  };

  const stats = calculateStats();

  // Calculate progress percentages
  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleContactVendor = (vendor: any) => {
    // In a real app, this would open a contact form or initiate communication
    window.alert(`Contacting ${vendor.name} at ${vendor.phone || vendor.email || 'No contact info available'}`);
  };

  // Effect to check if user is new and set up initial view
  useEffect(() => {
    // If user has no tasks, consider them a new user
    const userHasTasks = allTasks && Array.isArray(allTasks) && allTasks.length > 0;
    if (user && !userHasTasks) {
      setIsNewUser(true);
    }
  }, [user, allTasks]);

  return (
    <main className="px-4 sm:px-6 pt-4 pb-20 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gradient-to-r from-[#16a1bd] to-[#0d8b9e] bg-clip-text text-transparent">
              {isNewUser ? 'Welcome to HomeCue' : `Welcome Back, ${
                typeof user === 'object' && user && 'name' in user && user.name 
                  ? String(user.name).split(' ')[0] 
                  : userData && userData.name 
                    ? String(userData.name).split(' ')[0] 
                    : 'User'
              }`}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isNewUser 
                ? 'Let\'s get started with setting up your home maintenance tasks.' 
                : 'Here\'s what you need to tackle today.'}
            </p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#16a1bd] to-[#0d8b9e] text-white rounded-md hover:from-[#138ea6] hover:to-[#0a7a8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a1bd] flex items-center justify-center transition-transform active:scale-95 shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1.5" 
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
          </button>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-8">
        <TabsList className="grid w-full grid-cols-6 mb-4 md:mb-6 overflow-x-auto hide-scrollbar md:overflow-visible">
          <TabsTrigger value="overview" className="whitespace-nowrap text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="today" className="whitespace-nowrap text-xs md:text-sm">Today</TabsTrigger>
          <TabsTrigger value="upcoming" className="whitespace-nowrap text-xs md:text-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="seasonal" className="whitespace-nowrap text-xs md:text-sm">Seasonal</TabsTrigger>
          <TabsTrigger value="calendar" className="whitespace-nowrap text-xs md:text-sm">Calendar</TabsTrigger>
          <TabsTrigger value="vendors" className="whitespace-nowrap text-xs md:text-sm">Vendors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isNewUser && (
            <Card className="p-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-[#16a1bd]/20 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to your dashboard, {authUser?.name || userData?.name || 'there'}!</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first maintenance task or browse our task templates for common home maintenance needs.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="px-4 py-2 bg-[#16a1bd] text-white rounded-md hover:bg-[#138ea6] focus:outline-none"
                    >
                      Add First Task
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("today");
                        setTimeout(() => setIsTaskModalOpen(true), 100);
                      }}
                      className="px-4 py-2 bg-white border border-[#16a1bd] text-[#16a1bd] rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                      Browse Templates
                    </button>
                  </div>
                </div>
                <div className="w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#16a1bd" />
                        <stop offset="100%" stopColor="#0d8a9e" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
                      stroke="url(#homeGradient)" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M9 22V12H15V22" 
                      stroke="url(#homeGradient)" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          )}
        
          {/* House Health Score */}
          <div className="mb-6">
            <HouseHealthCard />
          </div>
          
          {/* Task Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Today</h3>
                <span className="text-2xl font-bold text-[#16a1bd]">{stats.today.total}</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#16a1bd] h-2.5 rounded-full" 
                    style={{ width: `${calculatePercentage(stats.today.completed, stats.today.total)}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {calculatePercentage(stats.today.completed, stats.today.total)}%
                </span>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
                <span className="text-2xl font-bold text-green-500">{stats.week.total}</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${calculatePercentage(stats.week.completed, stats.week.total)}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {calculatePercentage(stats.week.completed, stats.week.total)}%
                </span>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">This Month</h3>
                <span className="text-2xl font-bold text-yellow-500">{stats.month.total}</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${calculatePercentage(stats.month.completed, stats.month.total)}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {calculatePercentage(stats.month.completed, stats.month.total)}%
                </span>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
                <span className="text-2xl font-bold text-gray-500">{stats.upcoming}</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">0%</span>
              </div>
            </Card>
          </div>
          
          {/* Quick Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <AIRecommendationsCard />
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                {isTasksLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-[#16a1bd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : Array.isArray(allTasks) && allTasks.length > 0 ? (
                  <div className="space-y-4 task-list scrollable-container" style={{maxHeight: "300px", overflowY: "auto"}}>
                    {allTasks.slice(0, 5).map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between border-b pb-2"
                        style={{
                          minHeight: "48px", 
                          paddingTop: "8px", 
                          paddingBottom: "8px", 
                          touchAction: "manipulation"
                        }}
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span 
                          className={`px-3 py-1.5 rounded-full text-xs ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : task.status === 'overdue' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                          style={{
                            minHeight: "24px", 
                            minWidth: "60px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks yet. Add your first task to get started.</p>
                  </div>
                )}
              </Card>
            </div>
            
            <div>
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top Vendors</h3>
                {isVendorsLoading ? (
                  <div className="flex justify-center py-4">
                    <svg className="animate-spin h-6 w-6 text-[#16a1bd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : Array.isArray(vendors) && vendors.length > 0 ? (
                  <div className="space-y-4 task-list scrollable-container" style={{maxHeight: "250px", overflowY: "auto"}}>
                    {vendors.slice(0, 3).map(vendor => (
                      <div 
                        key={vendor.id} 
                        className="flex items-center space-x-4"
                        style={{
                          minHeight: "48px", 
                          paddingTop: "6px", 
                          paddingBottom: "6px", 
                          touchAction: "manipulation"
                        }}
                      >
                        <div className="bg-gray-100 p-2 rounded-full" style={{minWidth: "40px", minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No vendors available.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="seasonal">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Seasonal Maintenance</h2>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 bg-[#16a1bd] text-white rounded-md hover:bg-[#138ea6] focus:outline-none flex items-center justify-center"
              >
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
              </button>
            </div>
            <SeasonalRecommendations />
          </div>
        </TabsContent>
        
        <TabsContent value="today">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Tasks</h2>
              <div className="flex">
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-[#16a1bd] focus:border-[#16a1bd]"
                    value={categoryFilter || ""}
                    onChange={(e) => setCategoryFilter(e.target.value || undefined)}
                  >
                    <option value="">All Categories</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                <div className="relative ml-3">
                  <select 
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-[#16a1bd] focus:border-[#16a1bd]"
                    value={priorityFilter || ""}
                    onChange={(e) => setPriorityFilter(e.target.value || undefined)}
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {isTodayTasksLoading ? (
                <div className="flex justify-center py-8">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="animate-spin h-8 w-8 text-[#16a1bd]" 
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
              ) : Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={handleEditTask} 
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tasks for today.</p>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#16a1bd] text-white rounded-md hover:bg-[#138ea6] focus:outline-none"
                  >
                    Add Your First Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Tasks</h2>
            {isUpcomingTasksLoading ? (
              <div className="flex justify-center py-8">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="animate-spin h-8 w-8 text-[#16a1bd]" 
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
            ) : Array.isArray(upcomingTasks) && upcomingTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTasks.map(task => {
                  // Determine icon based on task category/frequency
                  let taskIcon;
                  let bgColor;
                  
                  switch(task.frequency) {
                    case 'daily':
                      bgColor = 'bg-indigo-100 text-indigo-600';
                      break;
                    case 'weekly':
                      bgColor = 'bg-green-100 text-green-600';
                      break;
                    case 'monthly':
                      bgColor = 'bg-amber-100 text-amber-600';
                      break;
                    case 'quarterly':
                      bgColor = 'bg-orange-100 text-orange-600';
                      break;
                    case 'annual':
                      bgColor = 'bg-red-100 text-red-600';
                      break;
                    default:
                      bgColor = 'bg-gray-100 text-gray-600';
                  }
                  
                  return (
                    <Card key={task.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 rounded-lg ${bgColor} items-center justify-center flex-shrink-0`}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
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
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-800">{task.title}</h3>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </p>
                          
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-[#16a1bd] text-sm hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming tasks</p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#16a1bd] text-white rounded-md hover:bg-[#138ea6] focus:outline-none"
                >
                  Schedule a Task
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Task Calendar</h2>
              
              <div className="flex items-center mt-3 sm:mt-0">
                <div className="flex space-x-2 mr-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                    <span className="text-xs text-gray-600">High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                    <span className="text-xs text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
                    <span className="text-xs text-gray-600">Low</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-1.5 bg-[#16a1bd] text-white text-sm rounded-md hover:bg-[#138ea6] focus:outline-none flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1" 
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
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Calendar Header */}
              <div className="p-4 flex items-center justify-between border-b">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => {
                    const prevMonth = new Date();
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    // Would update currentMonth state here
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <h3 className="text-lg font-semibold text-gray-700">
                  {format(new Date(), 'MMMM yyyy')}
                </h3>
                
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    // Would update currentMonth state here
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              
              {/* Calendar Grid - Days of Week */}
              <div className="grid grid-cols-7 gap-px">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500 bg-gray-50 border-b">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid - Days */}
              <div className="grid grid-cols-7 h-[500px] sm:h-[600px]">
                {Array.from({ length: 35 }).map((_, index) => {
                  // Create date object for current day in grid
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const startOffset = firstDay.getDay();
                  const day = new Date(firstDay);
                  day.setDate(index - startOffset + 1);
                  
                  // Check if current day is in current month
                  const isCurrentMonth = day.getMonth() === today.getMonth();
                  
                  // Check if day has tasks
                  const tasksForDay = Array.isArray(allTasks) ? allTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return (
                      taskDate.getDate() === day.getDate() &&
                      taskDate.getMonth() === day.getMonth() &&
                      taskDate.getFullYear() === day.getFullYear()
                    );
                  }) : [];
                  
                  const isToday = day.toDateString() === today.toDateString();
                  
                  // Get counts for display
                  const highPriorityCount = tasksForDay.filter(t => t.priority === 'high').length;
                  const mediumPriorityCount = tasksForDay.filter(t => t.priority === 'medium').length;
                  const lowPriorityCount = tasksForDay.filter(t => t.priority === 'low').length;
                  
                  return (
                    <div 
                      key={index} 
                      className={`relative border-r border-b p-1 hover:bg-gray-50 transition-colors ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50/60 text-gray-400'
                      } ${isToday ? 'bg-blue-50/80' : ''}`}
                      onClick={() => {
                        if (tasksForDay.length > 0) {
                          // If multiple tasks, would show a day detail modal
                          // For now, just open the first task
                          handleEditTask(tasksForDay[0]);
                        } else if (isCurrentMonth) {
                          // If no tasks, open new task modal with this date pre-filled
                          setSelectedDate(new Date(day));
                          setIsTaskModalOpen(true);
                        }
                      }}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`text-right p-1 ${isToday ? 'font-bold text-blue-600' : ''}`}>
                          {day.getDate()}
                        </div>
                        
                        <div className="flex-grow overflow-y-auto">
                          {tasksForDay.length > 0 && (
                            <div className="mt-1">
                              {tasksForDay.slice(0, 2).map(task => (
                                <div 
                                  key={task.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  className={`p-1 mb-1 text-xs rounded cursor-pointer truncate ${
                                    task.priority === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : task.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              
                              {/* More tasks indicator */}
                              {tasksForDay.length > 2 && (
                                <div className="text-xs text-center font-medium text-gray-500 py-1">
                                  +{tasksForDay.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Priority dots indicator */}
                        {(highPriorityCount > 0 || mediumPriorityCount > 0 || lowPriorityCount > 0) && (
                          <div className="absolute bottom-1 right-1 flex space-x-1">
                            {highPriorityCount > 0 && (
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            )}
                            {mediumPriorityCount > 0 && (
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            )}
                            {lowPriorityCount > 0 && (
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6 sm:hidden flex justify-center">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full px-4 py-2 bg-[#16a1bd] text-white rounded-md hover:bg-[#138ea6] focus:outline-none flex items-center justify-center"
              >
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
                Add New Task
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vendors">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Service Providers</h2>
            {isVendorsLoading ? (
              <div className="flex justify-center py-8">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="animate-spin h-8 w-8 text-[#16a1bd]" 
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
            ) : Array.isArray(vendors) && vendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map(vendor => (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={vendor} 
                    onContactClick={handleContactVendor} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No vendors available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Task modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        task={editingTask}
      />
    </main>
  );
};

export default Dashboard;