import { db } from "./db";
import { tasks, type Task } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

/**
 * Calculate the next due date based on the task frequency
 */
export function calculateNextDueDate(task: Task): Date {
  const currentDueDate = new Date(task.dueDate);
  
  switch (task.frequency) {
    case "daily":
      return addDays(currentDueDate, 1);
    case "weekly":
      return addWeeks(currentDueDate, 1);
    case "monthly":
      return addMonths(currentDueDate, 1);
    case "quarterly":
      return addMonths(currentDueDate, 3);
    case "annual":
      return addYears(currentDueDate, 1);
    case "seasonal":
      // For seasonal tasks, add 3 months by default
      return addMonths(currentDueDate, 3);
    default:
      // If frequency is not recognized, return the same date
      return currentDueDate;
  }
}

/**
 * Process all completed recurring tasks to create the next occurrence
 */
export async function processRecurringTasks(): Promise<number> {
  try {
    // Find all completed recurring tasks
    const completedRecurringTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "completed"),
          eq(tasks.isRecurring, true)
        )
      );
    
    let newTasksCreated = 0;
    
    // Create new task instances for each recurring task
    for (const task of completedRecurringTasks) {
      const nextDueDate = calculateNextDueDate(task);
      
      // Calculate reminder time if it exists
      let nextReminderTime = undefined;
      if (task.reminderTime) {
        const currentDueDate = new Date(task.dueDate);
        const reminderTime = new Date(task.reminderTime);
        // Keep the same time difference between due date and reminder
        const timeDifference = currentDueDate.getTime() - reminderTime.getTime();
        nextReminderTime = new Date(nextDueDate.getTime() - timeDifference);
      }
      
      // Create the new task instance
      const [newTask] = await db
        .insert(tasks)
        .values({
          title: task.title,
          description: task.description,
          dueDate: nextDueDate,
          reminderTime: nextReminderTime,
          frequency: task.frequency,
          priority: task.priority,
          status: "pending",
          isRecurring: true,
          userId: task.userId,
          vendorId: task.vendorId
        })
        .returning();
      
      if (newTask) {
        newTasksCreated++;
        
        // Mark the original task as non-recurring (to avoid duplicate future tasks)
        await db
          .update(tasks)
          .set({ isRecurring: false })
          .where(eq(tasks.id, task.id));
      }
    }
    
    return newTasksCreated;
  } catch (error) {
    console.error("Error processing recurring tasks:", error);
    return 0;
  }
}

/**
 * Check for tasks that are past due and not marked as completed or overdue
 */
export async function updateOverdueTasks(): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all pending tasks with due dates in the past
    const result = await db
      .update(tasks)
      .set({ status: "overdue" })
      .where(
        and(
          eq(tasks.status, "pending"),
          lt(tasks.dueDate, today)
        )
      );
    
    return result.rowCount || 0;
  } catch (error) {
    console.error("Error updating overdue tasks:", error);
    return 0;
  }
}