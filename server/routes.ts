import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertVendorSchema, 
  TaskFormData, 
  taskFormSchema, 
  vendorFormSchema, 
  warrantyFormSchema,
  users 
} from "@shared/schema";
import { login, register, logout, getCurrentUser, isAuthenticated } from "./auth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  predictTasks, 
  optimizeSchedule, 
  generateTaskRecommendations,
  TaskPrediction, 
  ScheduleOptimization 
} from "./ai-service";
import {
  calculateHouseHealthScore,
  getHealthScoreStatus,
  getHealthScoreRecommendations
} from "./house-health-service";


export async function registerRoutes(app: Express): Promise<Server> {
  // House health score API routes - direct implementation
  app.get("/api/house-health", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number || 1;
      
      // For demo purposes, return a sample health score
      const demoScore = {
        id: 0,
        userId,
        overallScore: 65,
        dailyScore: 75,
        weeklyScore: 60,
        monthlyScore: 50,
        seasonalScore: 70,
        annualScore: 80,
        lastCalculated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
      
      // Generate status and recommendations
      const status = getHealthScoreStatus(demoScore.overallScore);
      const recommendations = [
        "Complete your first maintenance task to start building your health score",
        "Add seasonal tasks based on your climate region",
        "Set up recurring tasks for regular maintenance items"
      ];
      
      return res.json({
        score: demoScore,
        status,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching house health score:", error);
      res.status(500).json({ message: "Failed to fetch house health score" });
    }
  });
  
  // Special routes for handling mobile redirects
  app.get("/dashboard-redirect", (req, res) => {
    res.redirect("/dashboard");
  });
  
  // Direct dashboard route that doesn't use the ProtectedRoute component
  app.get("/mobile-dashboard", (req, res) => {
    res.sendFile("index.html", { root: "./client/dist" });
  });

  // Auth Routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.get("/api/auth/logout", logout);
  app.get("/api/auth/user", getCurrentUser);
  
  // AI-powered task predictions and scheduling routes
  app.get("/api/predictions/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.session.userId as string) || 1; // Use authenticated user or fall back to 1 for demo
      const predictions = await predictTasks(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Error getting task predictions:", error);
      res.status(500).json({ message: "Failed to get task predictions" });
    }
  });
  
  app.get("/api/predictions/optimize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.session.userId as string) || 1; // Use authenticated user or fall back to 1 for demo
      const optimizations = await optimizeSchedule(userId);
      res.json(optimizations);
    } catch (error) {
      console.error("Error optimizing schedule:", error);
      res.status(500).json({ message: "Failed to optimize schedule" });
    }
  });
  
  app.get("/api/predictions/recommendations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.session.userId as string) || 1; // Use authenticated user or fall back to 1 for demo
      const count = req.query.count ? Number(req.query.count) : 5;
      const recommendations = await generateTaskRecommendations(userId, count);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting task recommendations:", error);
      res.status(500).json({ message: "Failed to get task recommendations" });
    }
  });
  
  // User location update endpoint
  app.patch("/api/user/location", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { state, climateRegion } = req.body;
      
      if (!state || !climateRegion) {
        return res.status(400).json({ message: "State and climate region are required" });
      }
      
      // Update user's location information
      await db.update(users)
        .set({ 
          state, 
          climateRegion,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      res.json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Update location error:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });
  
  // Get seasonal maintenance recommendations
  app.get("/api/seasonal-tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get user information including location
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || !user.climateRegion) {
        return res.status(400).json({ 
          message: "User location not set", 
          needsLocation: true 
        });
      }
      
      // Import necessary functions for recommendations
      const { getCurrentSeasonalTasks } = await import("@shared/seasonal-tasks");
      const { ClimateRegion } = await import("@shared/climate-regions");
      
      // Get seasonal tasks for user's climate region
      const tasks = getCurrentSeasonalTasks(user.climateRegion as unknown as typeof ClimateRegion[keyof typeof ClimateRegion]);
      
      res.json(tasks);
    } catch (error) {
      console.error("Get seasonal tasks error:", error);
      res.status(500).json({ message: "Failed to fetch seasonal tasks" });
    }
  });
  
  // Task Routes
  app.get("/api/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const tasks = await storage.getTasksByUserId(userId as number);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/today", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const tasks = await storage.getTasksDueToday(userId as number);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's tasks" });
    }
  });

  app.get("/api/tasks/upcoming", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const tasks = await storage.getUpcomingTasks(userId as number, days);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming tasks" });
    }
  });

  app.get("/api/tasks/frequency/:frequency", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const frequency = req.params.frequency;
      const tasks = await storage.getTasksByFrequency(userId as number, frequency);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by frequency" });
    }
  });

  app.get("/api/tasks/status/:status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const status = req.params.status;
      const tasks = await storage.getTasksByStatus(userId as number, status);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by status" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verify the task belongs to the requesting user
      const userId = req.session.userId || 1;
      if (task.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to view this task" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = taskFormSchema.parse(req.body);
      
      // Process the date/time from form data
      const dueDate = new Date(validatedData.dueDate);
      let reminderTime: Date | undefined = undefined;
      
      if (validatedData.reminderTime) {
        // If there's both date and time in reminderTime
        if (validatedData.reminderTime.includes('T')) {
          reminderTime = new Date(validatedData.reminderTime);
        } 
        // If it's just a time (HH:MM) format
        else if (validatedData.reminderTime.includes(':')) {
          reminderTime = new Date(dueDate);
          const [hours, minutes] = validatedData.reminderTime.split(':').map(Number);
          reminderTime.setHours(hours, minutes, 0, 0);
        }
      }
      
      // Get the authenticated user's ID
      const userId = req.session.userId || 1;
      
      // Convert to insert schema and use the authenticated user's ID
      const taskToInsert = {
        ...validatedData,
        dueDate,
        reminderTime,
        userId: userId as number
      };
      
      const createdTask = await storage.createTask(taskToInsert);
      res.status(201).json(createdTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // Validate the request body
      const validatedData = taskFormSchema.parse(req.body);
      
      // Process the date/time from form data
      const dueDate = new Date(validatedData.dueDate);
      let reminderTime: Date | undefined = undefined;
      
      if (validatedData.reminderTime) {
        // If there's both date and time in reminderTime
        if (validatedData.reminderTime.includes('T')) {
          reminderTime = new Date(validatedData.reminderTime);
        } 
        // If it's just a time (HH:MM) format
        else if (validatedData.reminderTime.includes(':')) {
          reminderTime = new Date(dueDate);
          const [hours, minutes] = validatedData.reminderTime.split(':').map(Number);
          reminderTime.setHours(hours, minutes, 0, 0);
        }
      }
      
      const taskUpdate = {
        ...validatedData,
        dueDate,
        reminderTime
      };
      
      // First get the existing task to verify ownership
      const existingTask = await storage.getTaskById(id);
      
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verify the task belongs to the authenticated user
      const userId = req.session.userId || 1;
      if (existingTask.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      const updatedTask = await storage.updateTask(id, taskUpdate);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task could not be updated" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.patch("/api/tasks/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Simple validation
      if (!status || !['pending', 'completed', 'overdue'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // First get the existing task to verify ownership
      const existingTask = await storage.getTaskById(id);
      
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verify the task belongs to the authenticated user
      const userId = req.session.userId || 1;
      if (existingTask.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      const updatedTask = await storage.updateTask(id, { status });
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task could not be updated" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // First get the existing task to verify ownership
      const existingTask = await storage.getTaskById(id);
      
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verify the task belongs to the authenticated user
      const userId = req.session.userId || 1;
      if (existingTask.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
      
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task could not be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Vendor Routes
  app.get("/api/vendors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/category/:category", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const vendors = await storage.getVendorsByCategory(category);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors by category" });
    }
  });

  app.get("/api/vendors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendorById(id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = vendorFormSchema.parse(req.body);
      
      const createdVendor = await storage.createVendor(validatedData);
      res.status(201).json(createdVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the request body
      const validatedData = vendorFormSchema.parse(req.body);
      
      const updatedVendor = await storage.updateVendor(id, validatedData);
      
      if (!updatedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(updatedVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVendor(id);
      
      if (!success) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // User info route
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      // For now we'll use user ID 1 since we don't have auth
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Exclude password from returned data
      const { password, ...userData } = user;
      
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });
  
  // Warranty Management Routes
  app.get("/api/warranties", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const warranties = await storage.getWarranties(userId as number);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.get("/api/warranties/expiring", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const days = req.query.days ? parseInt(req.query.days as string) : 90;
      const warranties = await storage.getExpiringSoonWarranties(userId as number, days);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring warranties" });
    }
  });

  app.get("/api/warranties/type/:applianceType", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 1; // Use authenticated user or fall back to 1 for demo
      const applianceType = req.params.applianceType;
      const warranties = await storage.getWarrantiesByApplianceType(userId as number, applianceType);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranties by appliance type" });
    }
  });

  app.get("/api/warranties/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const warranty = await storage.getWarrantyById(id);
      
      if (!warranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      
      // Verify the warranty belongs to the requesting user
      const userId = req.session.userId || 1;
      if (warranty.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to view this warranty" });
      }
      
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranty" });
    }
  });

  app.post("/api/warranties", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = warrantyFormSchema.parse(req.body);
      
      // Process the dates from form data
      const purchaseDate = new Date(validatedData.purchaseDate);
      const warrantyExpirationDate = new Date(validatedData.warrantyExpirationDate);
      
      // Get the authenticated user's ID
      const userId = req.session.userId || 1;
      
      // Convert to insert schema and use the authenticated user's ID
      const warrantyToInsert = {
        ...validatedData,
        purchaseDate,
        warrantyExpirationDate,
        userId: userId as number
      };
      
      const createdWarranty = await storage.createWarranty(warrantyToInsert);
      res.status(201).json(createdWarranty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid warranty data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create warranty" });
    }
  });

  app.put("/api/warranties/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the request body
      const validatedData = warrantyFormSchema.parse(req.body);
      
      // Process the dates from form data
      const purchaseDate = new Date(validatedData.purchaseDate);
      const warrantyExpirationDate = new Date(validatedData.warrantyExpirationDate);
      
      const warrantyUpdate = {
        ...validatedData,
        purchaseDate,
        warrantyExpirationDate
      };
      
      // First get the existing warranty to verify ownership
      const existingWarranty = await storage.getWarrantyById(id);
      
      if (!existingWarranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      
      // Verify the warranty belongs to the authenticated user
      const userId = req.session.userId || 1;
      if (existingWarranty.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to update this warranty" });
      }
      
      const updatedWarranty = await storage.updateWarranty(id, warrantyUpdate);
      
      if (!updatedWarranty) {
        return res.status(404).json({ message: "Warranty could not be updated" });
      }
      
      res.json(updatedWarranty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid warranty data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update warranty" });
    }
  });

  app.delete("/api/warranties/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // First get the existing warranty to verify ownership
      const existingWarranty = await storage.getWarrantyById(id);
      
      if (!existingWarranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      
      // Verify the warranty belongs to the authenticated user
      const userId = req.session.userId || 1;
      if (existingWarranty.userId !== userId && userId !== 1) {
        return res.status(403).json({ message: "Not authorized to delete this warranty" });
      }
      
      const success = await storage.deleteWarranty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Warranty could not be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete warranty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
