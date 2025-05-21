import { processRecurringTasks, updateOverdueTasks } from "./task-recurrence";
import { startReminderScheduler, stopReminderScheduler } from "./notification-service";

// How often to run the task schedulers (in milliseconds)
const RECURRENCE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Once per day
const OVERDUE_CHECK_INTERVAL = 1 * 60 * 60 * 1000;     // Once per hour

let recurringTasksTimer: NodeJS.Timeout | null = null;
let overdueTasksTimer: NodeJS.Timeout | null = null;

/**
 * Start the recurring tasks scheduler
 */
export function startRecurringTasksScheduler() {
  // Run once at startup
  processRecurringTasksJob();
  
  // Schedule recurring runs
  recurringTasksTimer = setInterval(processRecurringTasksJob, RECURRENCE_CHECK_INTERVAL);
  console.log("📅 Recurring tasks scheduler started");
}

/**
 * Start the overdue tasks scheduler
 */
export function startOverdueTasksScheduler() {
  // Run once at startup
  updateOverdueTasksJob();
  
  // Schedule recurring runs
  overdueTasksTimer = setInterval(updateOverdueTasksJob, OVERDUE_CHECK_INTERVAL);
  console.log("⏰ Overdue tasks scheduler started");
}

/**
 * Stop all schedulers
 */
export function stopSchedulers() {
  if (recurringTasksTimer) {
    clearInterval(recurringTasksTimer);
    recurringTasksTimer = null;
  }
  
  if (overdueTasksTimer) {
    clearInterval(overdueTasksTimer);
    overdueTasksTimer = null;
  }
  
  // Stop email reminder scheduler
  stopReminderScheduler();
  
  console.log("🛑 Task schedulers stopped");
}

/**
 * Process recurring tasks job
 */
async function processRecurringTasksJob() {
  try {
    const newTasksCreated = await processRecurringTasks();
    if (newTasksCreated > 0) {
      console.log(`✓ Created ${newTasksCreated} new recurring tasks`);
    }
  } catch (error) {
    console.error("❌ Error in recurring tasks job:", error);
  }
}

/**
 * Update overdue tasks job
 */
async function updateOverdueTasksJob() {
  try {
    const tasksUpdated = await updateOverdueTasks();
    if (tasksUpdated > 0) {
      console.log(`✓ Marked ${tasksUpdated} tasks as overdue`);
    }
  } catch (error) {
    console.error("❌ Error in overdue tasks job:", error);
  }
}

// Start all schedulers
export function startAllSchedulers() {
  startRecurringTasksScheduler();
  startOverdueTasksScheduler();
  startReminderScheduler();
  console.log("✅ All task schedulers started");
  
  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    stopSchedulers();
    process.exit(0);
  });
  
  process.on("SIGINT", () => {
    stopSchedulers();
    process.exit(0);
  });
}