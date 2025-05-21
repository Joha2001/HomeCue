import { storage } from "./storage";
import { Task, InsertHouseHealthScore, HouseHealthScore } from "@shared/schema";
import { stateToClimateRegion, getCurrentSeason, Season } from "@shared/climate-regions";

/**
 * Calculate house health score based on completed tasks and maintenance history
 */
export async function calculateHouseHealthScore(userId: number): Promise<InsertHouseHealthScore> {
  try {
    // Get all user tasks
    const tasks = await storage.getTasksByUserId(userId);
    
    // Get user's climate region (default to MIDWEST if not set)
    let climateRegion = "midwest";
    
    // Calculate scores for different categories
    const { 
      dailyScore, 
      weeklyScore, 
      monthlyScore, 
      seasonalScore, 
      annualScore 
    } = calculateCategoryScores(tasks, climateRegion);
    
    // Calculate overall score
    const overallScore = calculateOverallScore({
      dailyScore,
      weeklyScore,
      monthlyScore,
      seasonalScore,
      annualScore
    });
    
    return {
      userId,
      overallScore,
      dailyScore,
      weeklyScore,
      monthlyScore,
      seasonalScore,
      annualScore,
      lastCalculated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error calculating house health score:", error);
    
    // Return a default score in case of error
    return {
      userId,
      overallScore: 50,
      dailyScore: 50,
      weeklyScore: 50,
      monthlyScore: 50,
      seasonalScore: 50,
      annualScore: 50,
      lastCalculated: new Date().toISOString()
    };
  }
}

/**
 * Calculate scores for each frequency category
 */
function calculateCategoryScores(tasks: Task[], climateRegion: string) {
  // Filter tasks by frequency
  const dailyTasks = tasks.filter(task => task.frequency === 'daily');
  const weeklyTasks = tasks.filter(task => task.frequency === 'weekly');
  const monthlyTasks = tasks.filter(task => task.frequency === 'monthly');
  const quarterlyTasks = tasks.filter(task => task.frequency === 'quarterly');
  const annualTasks = tasks.filter(task => task.frequency === 'annual');
  const seasonalTasks = tasks.filter(task => task.frequency === 'seasonal');
  
  // Calculate scores
  const dailyScore = calculateCompletionScore(dailyTasks);
  const weeklyScore = calculateCompletionScore(weeklyTasks);
  const monthlyScore = calculateCompletionScore(monthlyTasks);
  const quarterlyScore = calculateCompletionScore(quarterlyTasks);
  const annualScore = calculateCompletionScore(annualTasks);
  const seasonalScore = calculateSeasonalScore(seasonalTasks, climateRegion);
  
  return {
    dailyScore,
    weeklyScore,
    monthlyScore: (monthlyScore + quarterlyScore) / 2, // Combine monthly and quarterly
    seasonalScore,
    annualScore
  };
}

/**
 * Calculate completion score for a group of tasks (0-100)
 */
function calculateCompletionScore(tasks: Task[]): number {
  if (tasks.length === 0) return 100; // If no tasks, score is perfect
  
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const completionRate = completedTasks.length / tasks.length;
  
  return Math.round(completionRate * 100);
}

/**
 * Calculate seasonal task score based on recommended tasks for the season and climate
 */
function calculateSeasonalScore(seasonalTasks: Task[], climateRegion: string): number {
  const currentSeason = getCurrentSeason();
  
  // Filter for current season's tasks
  const currentSeasonTasks = seasonalTasks.filter(
    task => task.seasonalPeriod === currentSeason.toLowerCase()
  );
  
  return calculateCompletionScore(currentSeasonTasks);
}

/**
 * Calculate overall health score as a weighted average of category scores
 */
function calculateOverallScore(
  {
    dailyScore,
    weeklyScore,
    monthlyScore,
    seasonalScore,
    annualScore
  }: {
    dailyScore: number;
    weeklyScore: number;
    monthlyScore: number;
    seasonalScore: number;
    annualScore: number;
  }
): number {
  // Weight factors (adjust as needed)
  const weights = {
    daily: 0.15,
    weekly: 0.2,
    monthly: 0.25,
    seasonal: 0.25,
    annual: 0.15
  };
  
  const weightedScore = 
    dailyScore * weights.daily +
    weeklyScore * weights.weekly +
    monthlyScore * weights.monthly +
    seasonalScore * weights.seasonal +
    annualScore * weights.annual;
  
  return Math.round(weightedScore);
}

/**
 * Get health score status and recommendations based on the score
 */
export function getHealthScoreStatus(score: number): { 
  status: 'excellent' | 'good' | 'fair' | 'needs-attention' | 'critical';
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      status: 'excellent',
      color: '#22c55e', // Green
      message: 'Your home is in excellent condition!'
    };
  } else if (score >= 75) {
    return {
      status: 'good',
      color: '#84cc16', // Light green
      message: 'Your home is in good condition.'
    };
  } else if (score >= 60) {
    return {
      status: 'fair',
      color: '#eab308', // Yellow
      message: 'Your home maintenance could use some attention.'
    };
  } else if (score >= 40) {
    return {
      status: 'needs-attention',
      color: '#f97316', // Orange
      message: 'Your home needs maintenance attention soon.'
    };
  } else {
    return {
      status: 'critical',
      color: '#ef4444', // Red
      message: 'Critical maintenance tasks need immediate attention!'
    };
  }
}

/**
 * Get recommendations to improve house health score
 */
export function getHealthScoreRecommendations(
  healthScore: HouseHealthScore
): string[] {
  const recommendations: string[] = [];
  
  // Check daily tasks
  if (healthScore.dailyScore < 70) {
    recommendations.push('Complete more daily maintenance tasks to improve your score.');
  }
  
  // Check weekly tasks
  if (healthScore.weeklyScore < 70) {
    recommendations.push('Focus on completing your weekly maintenance tasks.');
  }
  
  // Check monthly tasks
  if (healthScore.monthlyScore < 70) {
    recommendations.push('Schedule time for your monthly and quarterly maintenance tasks.');
  }
  
  // Check seasonal tasks
  if (healthScore.seasonalScore < 70) {
    const season = getCurrentSeason();
    recommendations.push(`Complete your ${season.toLowerCase()} maintenance tasks for better seasonal preparedness.`);
  }
  
  // Check annual tasks
  if (healthScore.annualScore < 70) {
    recommendations.push('Plan for your annual maintenance tasks to prevent future issues.');
  }
  
  // Add general recommendations
  recommendations.push('Set reminders for upcoming maintenance tasks.');
  recommendations.push('Consider scheduling a professional home inspection.');
  
  // Return at most 5 recommendations
  return recommendations.slice(0, 5);
}