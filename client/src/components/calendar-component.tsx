import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isSameMonth } from "date-fns";
import { Task } from "@shared/schema";

interface CalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  tasks: Task[];
}

const CalendarComponent = ({ currentMonth, selectedDate, setSelectedDate, tasks }: CalendarProps) => {
  // Generate days array for current month view
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateArray = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    const startDay = getDay(monthStart);
    
    // Add days from previous month to fill the first row
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      prevMonthDays.push(null);
    }

    // Add the first day of the next month to fill last row if needed
    const lastDayOfMonth = getDay(monthEnd);
    const nextMonthDays = [];
    for (let i = lastDayOfMonth + 1; i <= 6; i++) {
      nextMonthDays.push(null);
    }

    return [...prevMonthDays, ...dateArray, ...nextMonthDays];
  }, [currentMonth]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date | null) => {
    if (!date || !tasks.length) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };
  
  // Get completed tasks for a specific date
  const getCompletedTasksForDate = (date: Date | null) => {
    if (!date || !tasks.length) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date) && task.status === 'completed';
    });
  };

  // Get priority-based color for task indicators
  const getTaskIndicators = (date: Date | null) => {
    if (!date) return [];
    
    const dateTasks = getTasksForDate(date);
    const uniquePriorities = new Set(dateTasks.map(task => task.priority));
    
    return Array.from(uniquePriorities).map(priority => {
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
    });
  };
  
  // Check if there are completed tasks for the date
  const hasCompletedTasks = (date: Date | null) => {
    if (!date) return false;
    return getCompletedTasksForDate(date).length > 0;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        <div className="text-xs font-medium text-gray-500">Sun</div>
        <div className="text-xs font-medium text-gray-500">Mon</div>
        <div className="text-xs font-medium text-gray-500">Tue</div>
        <div className="text-xs font-medium text-gray-500">Wed</div>
        <div className="text-xs font-medium text-gray-500">Thu</div>
        <div className="text-xs font-medium text-gray-500">Fri</div>
        <div className="text-xs font-medium text-gray-500">Sat</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, i) => {
          if (!day) {
            // Render empty cells for days outside current month
            return (
              <div key={`empty-${i}`} className="p-2 text-sm text-gray-400"></div>
            );
          }
          
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const taskIndicators = getTaskIndicators(day);
          const hasTask = taskIndicators.length > 0;
          const hasCompleted = hasCompletedTasks(day);
          
          return (
            <div
              key={day.toString()}
              className={`p-2 text-sm rounded cursor-pointer relative
                ${isSelected ? "bg-indigo-50 text-primary font-medium" : "hover:bg-gray-50"}
                ${!isCurrentMonth && "text-gray-400"}
                ${isCurrentDay && !isSelected && "font-bold"}
                ${hasCompleted && "ring-1 ring-green-300 ring-inset"}
              `}
              onClick={() => setSelectedDate(day)}
            >
              {format(day, "d")}
              
              {/* Task indicators */}
              {hasTask && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {taskIndicators.map((color, index) => (
                    <span 
                      key={index} 
                      className={`${color} w-1 h-1 rounded-full`}
                    ></span>
                  ))}
                </div>
              )}
              
              {/* Completed tasks indicator */}
              {hasCompleted && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
              
              {/* High priority indicator */}
              {taskIndicators.includes('bg-red-500') && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarComponent;
