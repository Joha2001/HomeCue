import OpenAI from "openai";
import { Task } from "@shared/schema";
import { storage } from "./storage";
import { format, addDays, parseISO } from "date-fns";
import { stateToClimateRegion, getCurrentSeason } from "@shared/climate-regions";
import { getCurrentSeasonalTasks } from "@shared/seasonal-tasks";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskPrediction {
  title: string;
  description: string;
  suggestedDate: Date;
  priority: "high" | "medium" | "low";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "seasonal";
  confidence: number; // 0-1 value indicating AI confidence in this prediction
}

export interface ScheduleOptimization {
  taskId: number;
  currentDueDate: Date;
  suggestedDueDate: Date;
  reason: string;
}

/**
 * Analyze a user's task patterns and history to predict future tasks
 */
export async function predictTasks(userId: number): Promise<TaskPrediction[]> {
  try {
    // Get user's task history
    const tasks = await storage.getTasksByUserId(userId);
    
    if (tasks.length === 0) {
      return []; // No task history to analyze
    }

    // Get user information including location for regional tasks
    const user = await storage.getUser(userId);
    const userState = user?.state;
    
    // Prepare the data for AI analysis
    const taskData = tasks.map(task => ({
      title: task.title,
      description: task.description,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      frequency: task.frequency,
      priority: task.priority,
      status: task.status,
      isRecurring: task.isRecurring,
    }));

    // Current date for reference
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    
    // Get climate region and seasonal data if user location is set
    let regionalContext = "";
    if (userState) {
      const climateRegion = stateToClimateRegion[userState];
      const currentSeason = getCurrentSeason();
      
      if (climateRegion) {
        const seasonalTasks = getCurrentSeasonalTasks(climateRegion);
        regionalContext = `
          User lives in ${userState} which is in climate region: ${climateRegion}.
          Current season is ${currentSeason}.
          Common seasonal tasks for this region and season include: ${seasonalTasks.map(t => t.title).join(', ')}.
        `;
      }
    }

    // Build the prompt for prediction
    const prompt = `
      Analyze this homeowner's task history and predict the most likely new tasks they should consider adding to their home maintenance schedule.
      
      Current date: ${currentDate}
      
      ${regionalContext}
      
      User task history:
      ${JSON.stringify(taskData, null, 2)}
      
      Based on patterns in their task history, time of year, and home maintenance best practices, suggest 3-5 new tasks the user might need to do soon.
      For each task, determine:
      1. Task title
      2. Brief description
      3. Suggested due date (YYYY-MM-DD format)
      4. Priority (high, medium, or low)
      5. Frequency (daily, weekly, monthly, quarterly, annual, or seasonal)
      6. Confidence score (0.0-1.0)
      
      Provide your response in the following JSON format:
      [
        {
          "title": "Task title",
          "description": "Brief description",
          "suggestedDate": "YYYY-MM-DD",
          "priority": "high|medium|low",
          "frequency": "daily|weekly|monthly|quarterly|annual|seasonal",
          "confidence": 0.85
        }
      ]
    `;

    // Call OpenAI API for task prediction with proper error handling
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an AI assistant that specializes in home maintenance task scheduling and prediction." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });
  
      const content = response.choices[0].message.content || "";
      const predictions = JSON.parse(content);
      
      if (!Array.isArray(predictions.predictions)) {
        return getFallbackRecommendations();
      }
      
      // Parse and format the predictions
      return predictions.predictions.map((prediction: any) => ({
        title: prediction.title,
        description: prediction.description,
        suggestedDate: parseISO(prediction.suggestedDate),
        priority: prediction.priority,
        frequency: prediction.frequency,
        confidence: prediction.confidence
      }));
    } catch (error) {
      console.error("Error generating task predictions:", error);
      
      // Provide fallback recommendations
      return getFallbackRecommendations();
    }

  } catch (error) {
    console.error("Error generating task predictions:", error);
    return getFallbackRecommendations();
  }
}

/**
 * Optimize a user's existing task schedule to better distribute workload
 */
export async function optimizeSchedule(userId: number): Promise<ScheduleOptimization[]> {
  try {
    // Get user's upcoming tasks
    const tasks = await storage.getUpcomingTasks(userId, 30); // Get tasks for next 30 days
    
    if (tasks.length <= 1) {
      return []; // Not enough tasks to optimize
    }

    // Prepare the task data for AI analysis
    const taskData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      priority: task.priority
    }));

    // Current date for reference
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    // Build the prompt for schedule optimization
    const prompt = `
      Analyze this homeowner's upcoming tasks and suggest schedule optimizations to better distribute their workload.
      
      Current date: ${currentDate}
      
      Upcoming tasks:
      ${JSON.stringify(taskData, null, 2)}
      
      Identify tasks that should be rescheduled to create a more balanced workload.
      For each task that should be moved:
      1. Provide the task ID
      2. Current due date
      3. Suggested new due date
      4. Reason for the change
      
      Consider:
      - Avoiding days with many high-priority tasks
      - Grouping similar tasks when efficient
      - Maintaining a balanced weekly workload
      - Keeping high priority tasks on their original dates when possible
      
      Provide your response in the following JSON format:
      [
        {
          "taskId": 123,
          "currentDueDate": "YYYY-MM-DD",
          "suggestedDueDate": "YYYY-MM-DD",
          "reason": "Explanation for the suggested change"
        }
      ]
    `;

    // Call OpenAI API for schedule optimization
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant that specializes in optimizing home maintenance schedules." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    const optimizations = JSON.parse(content);
    
    if (!Array.isArray(optimizations.optimizations)) {
      return [];
    }

    // Parse and format the optimizations
    return optimizations.optimizations.map((opt: any) => ({
      taskId: parseInt(opt.taskId),
      currentDueDate: parseISO(opt.currentDueDate),
      suggestedDueDate: parseISO(opt.suggestedDueDate),
      reason: opt.reason
    }));
  } catch (error) {
    console.error("Error generating schedule optimizations:", error);
    return [];
  }
}

/**
 * Generate personalized task recommendations based on user behavior and data
 */
export async function generateTaskRecommendations(userId: number, count: number = 5): Promise<TaskPrediction[]> {
  try {
    // Get user information
    const user = await storage.getUser(userId);
    const userState = user?.state;
    
    // Get user's completed tasks for analysis
    const tasks = await storage.getTasksByUserId(userId);
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    if (completedTasks.length === 0) {
      // Not enough data for personalized recommendations
      // Fall back to general recommendations
      try {
        return generateGeneralRecommendations(userState || undefined);
      } catch (error) {
        // If even the general recommendations fail, use hardcoded fallback
        console.error("Error generating general recommendations:", error);
        return getFallbackRecommendations();
      }
    }

    // Extract patterns from completed tasks
    const taskCategories = completedTasks.reduce((acc: Record<string, number>, task) => {
      acc[task.frequency] = (acc[task.frequency] || 0) + 1;
      return acc;
    }, {});
    
    // Get most frequent task categories
    const preferredCategories = Object.entries(taskCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    // Get the best day of week based on when tasks are typically completed
    const completedDays = completedTasks.map(task => new Date(task.dueDate).getDay());
    const dayFrequency = completedDays.reduce((acc: Record<number, number>, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    
    const preferredDay = Object.entries(dayFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([day]) => parseInt(day))[0] || 6; // Default to Saturday if no preference
    
    // Current date
    const now = new Date();
    
    // Find the next occurrence of the preferred day
    let suggestedDate = new Date();
    while (suggestedDate.getDay() !== preferredDay) {
      suggestedDate = addDays(suggestedDate, 1);
    }
    
    // Format the date
    const formattedDate = format(suggestedDate, 'yyyy-MM-dd');
    
    // Get climate region and seasonal data if user location is set
    let regionalContext = "";
    let seasonalTaskSuggestions = [];
    
    if (userState) {
      const climateRegion = stateToClimateRegion[userState];
      const currentSeason = getCurrentSeason();
      
      if (climateRegion) {
        const seasonalTasks = getCurrentSeasonalTasks(climateRegion);
        seasonalTaskSuggestions = seasonalTasks.slice(0, 3);
        
        regionalContext = `
          User lives in ${userState} which is in climate region: ${climateRegion}.
          Current season is ${currentSeason}.
          Common seasonal tasks for this region and season include: ${seasonalTasks.map(t => t.title).join(', ')}.
        `;
      }
    }

    // Prepare completed task data
    const completedTaskData = completedTasks.map(task => ({
      title: task.title,
      frequency: task.frequency,
      priority: task.priority,
      completedDate: format(new Date(task.dueDate), 'yyyy-MM-dd')
    }));

    // Build the prompt for personalized recommendations
    const prompt = `
      Generate personalized task recommendations for this homeowner based on their task history and preferences.
      
      User details:
      - Preferred task categories: ${preferredCategories.join(', ')}
      - Preferred day for tasks: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][preferredDay]}
      - Next suggested task date: ${formattedDate}
      
      ${regionalContext}
      
      Completed task history:
      ${JSON.stringify(completedTaskData, null, 2)}
      
      Based on this user's preferences and regional factors, generate ${count} personalized task recommendations.
      For each recommendation, provide:
      1. Task title
      2. Brief description
      3. Suggested due date (YYYY-MM-DD format)
      4. Priority (high, medium, or low)
      5. Frequency (daily, weekly, monthly, quarterly, annual, or seasonal)
      6. Confidence score (0.0-1.0)
      
      Focus on tasks in the user's preferred categories but include at least one seasonal task appropriate for their location if available.
      
      Provide your response in the following JSON format:
      [
        {
          "title": "Task title",
          "description": "Brief description",
          "suggestedDate": "YYYY-MM-DD",
          "priority": "high|medium|low",
          "frequency": "daily|weekly|monthly|quarterly|annual|seasonal",
          "confidence": 0.85
        }
      ]
    `;

    // Call OpenAI API for personalized recommendations
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant that specializes in personalized home maintenance recommendations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    const recommendations = JSON.parse(content);
    
    if (!Array.isArray(recommendations.recommendations)) {
      return [];
    }

    // Parse and format the recommendations
    return recommendations.recommendations.map((rec: any) => ({
      title: rec.title,
      description: rec.description,
      suggestedDate: parseISO(rec.suggestedDate),
      priority: rec.priority,
      frequency: rec.frequency,
      confidence: rec.confidence
    }));
  } catch (error) {
    console.error("Error generating task recommendations:", error);
    // Return general recommendations when OpenAI API fails (e.g., rate limit)
    return getFallbackRecommendations();
  }
}

/**
 * Get fallback recommendations when OpenAI API fails (e.g., rate limits)
 */
function getFallbackRecommendations(): TaskPrediction[] {
  // Hardcoded fallback recommendations for when API is unavailable
  const currentDate = new Date();
  return [
    {
      title: "Check HVAC Filters",
      description: "Inspect and replace HVAC filters if needed for optimal air quality and system efficiency.",
      suggestedDate: addDays(currentDate, 3),
      priority: "medium",
      frequency: "monthly",
      confidence: 0.9
    },
    {
      title: "Test Smoke Detectors",
      description: "Test all smoke and carbon monoxide detectors to ensure they are functioning properly.",
      suggestedDate: addDays(currentDate, 7),
      priority: "high",
      frequency: "monthly",
      confidence: 0.95
    },
    {
      title: "Clean Refrigerator Coils",
      description: "Vacuum refrigerator coils to remove dust and debris for better efficiency.",
      suggestedDate: addDays(currentDate, 14),
      priority: "low",
      frequency: "quarterly",
      confidence: 0.85
    },
    {
      title: "Check for Water Leaks",
      description: "Inspect under sinks, around toilets, and check water heater for any signs of leaks.",
      suggestedDate: addDays(currentDate, 2),
      priority: "medium",
      frequency: "monthly",
      confidence: 0.9
    },
    {
      title: "Clean Gutters",
      description: "Remove debris from gutters and downspouts to prevent water damage.",
      suggestedDate: addDays(currentDate, 10),
      priority: "medium",
      frequency: "quarterly",
      confidence: 0.85
    }
  ];
}

/**
 * Generate general task recommendations based on location
 */
async function generateGeneralRecommendations(userState?: string): Promise<TaskPrediction[]> {
  // If we have the user's location, use it for regional recommendations
  if (userState) {
    const climateRegion = stateToClimateRegion[userState as keyof typeof stateToClimateRegion];
    const currentSeason = getCurrentSeason();
    
    if (climateRegion) {
      const seasonalTasks = getCurrentSeasonalTasks(climateRegion);
      
      // Convert seasonal tasks to task predictions
      return seasonalTasks.slice(0, 5).map(task => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Set due date to 1 week from now
        
        return {
          title: task.title,
          description: task.description,
          suggestedDate: dueDate,
          priority: task.priority,
          frequency: "seasonal",
          confidence: 0.8
        };
      });
    }
  }
  
  // Default recommendations if no location data
  const defaultTasks: TaskPrediction[] = [
    {
      title: "Check HVAC Filters",
      description: "Inspect and replace HVAC filters if needed for optimal air quality and system efficiency.",
      suggestedDate: addDays(new Date(), 3),
      priority: "medium",
      frequency: "monthly",
      confidence: 0.9
    },
    {
      title: "Test Smoke Detectors",
      description: "Test all smoke and carbon monoxide detectors to ensure they are functioning properly.",
      suggestedDate: addDays(new Date(), 7),
      priority: "high",
      frequency: "monthly",
      confidence: 0.95
    },
    {
      title: "Clean Refrigerator Coils",
      description: "Vacuum refrigerator coils to remove dust and debris for better efficiency.",
      suggestedDate: addDays(new Date(), 14),
      priority: "low",
      frequency: "quarterly",
      confidence: 0.85
    },
    {
      title: "Check for Water Leaks",
      description: "Inspect under sinks, around toilets, and check water heater for any signs of leaks.",
      suggestedDate: addDays(new Date(), 2),
      priority: "medium",
      frequency: "monthly",
      confidence: 0.9
    },
    {
      title: "Clean Gutters",
      description: "Remove debris from gutters and downspouts to prevent water damage.",
      suggestedDate: addDays(new Date(), 10),
      priority: "medium",
      frequency: "quarterly",
      confidence: 0.85
    }
  ];
  
  return defaultTasks;
}