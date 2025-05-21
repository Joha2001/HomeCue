import { tasks, users, type Task } from "@shared/schema";
import { db } from "./db";
import { eq, and, between } from "drizzle-orm";
import { format, addDays } from "date-fns";
import sgMail from "@sendgrid/mail";

// Check if SendGrid API key is configured
const isSendGridConfigured = !!process.env.SENDGRID_API_KEY;

// Configure SendGrid if API key is available
if (isSendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  console.log("📧 SendGrid configured successfully");
} else {
  console.log("⚠️ SendGrid API key not configured. Email reminders will not be sent.");
}

// How often to send email reminders (in milliseconds)
const REMINDER_CHECK_INTERVAL = 1 * 60 * 60 * 1000; // Once per hour

let reminderTimer: NodeJS.Timeout | null = null;

/**
 * Start the task reminder scheduler
 */
export function startReminderScheduler() {
  if (!isSendGridConfigured) {
    console.log("⚠️ SendGrid API key not configured. Email reminders disabled.");
    return;
  }

  // Run once at startup
  processTaskRemindersJob();
  
  // Schedule recurring runs
  reminderTimer = setInterval(processTaskRemindersJob, REMINDER_CHECK_INTERVAL);
  console.log("📧 Task reminder scheduler started");
}

/**
 * Stop the reminder scheduler
 */
export function stopReminderScheduler() {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
    console.log("📧 Task reminder scheduler stopped");
  }
}

/**
 * Process task reminders job
 */
async function processTaskRemindersJob() {
  if (!isSendGridConfigured) return;

  try {
    const now = new Date();
    const oneHourLater = addDays(now, 1/24); // 1 hour from now
    
    // Find all tasks with reminder times in the next hour
    const tasksToRemind = await findTasksDueForReminder(now, oneHourLater);
    
    if (tasksToRemind.length > 0) {
      console.log(`Found ${tasksToRemind.length} tasks due for reminders`);
      
      for (const task of tasksToRemind) {
        await sendTaskReminder(task);
      }
    }
  } catch (error) {
    console.error("❌ Error in task reminder job:", error);
  }
}

/**
 * Find tasks that are due for reminders
 */
async function findTasksDueForReminder(startTime: Date, endTime: Date) {
  try {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "pending"),
          between(tasks.reminderTime, startTime, endTime)
        )
      );
  } catch (error) {
    console.error("Error finding tasks due for reminder:", error);
    return [];
  }
}

/**
 * Send an email reminder for a task
 */
async function sendTaskReminder(task: Task): Promise<boolean> {
  if (!isSendGridConfigured) return false;

  try {
    // Get the user info to send the email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, task.userId))
      .limit(1);
    
    if (!user || !user[0] || !user[0].email) {
      console.error(`User not found or no email for task: ${task.id}`);
      return false;
    }

    const formattedDueDate = format(new Date(task.dueDate), "PPP");
    
    // Prepare email
    const msg = {
      to: user[0].email,
      from: "notifications@homecue.app", // Replace with your verified sender
      subject: `Reminder: Task "${task.title}" is due soon`,
      text: `Don't forget about your task "${task.title}" that is due on ${formattedDueDate}. 
      
Description: ${task.description || "No description provided"}

Priority: ${task.priority.toUpperCase()}

Log in to homecue to mark it as complete or reschedule.`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #16a1bd; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Task Reminder</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Don't forget about your task:</p>
          <h2 style="color: #16a1bd;">${task.title}</h2>
          <p><strong>Due date:</strong> ${formattedDueDate}</p>
          <p><strong>Priority:</strong> <span style="text-transform: uppercase;">${task.priority}</span></p>
          ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://homecue.app" style="background-color: #16a1bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Task</a>
          </div>
        </div>
        <div style="text-align: center; padding: 10px; color: #666; font-size: 12px;">
          <p>You received this email because you have an upcoming task in homecue.</p>
        </div>
      </div>
      `
    };
    
    // Send email
    await sgMail.send(msg);
    console.log(`✓ Sent reminder email for task: ${task.title}`);
    
    return true;
  } catch (error) {
    console.error(`Error sending reminder for task ${task.id}:`, error);
    return false;
  }
}