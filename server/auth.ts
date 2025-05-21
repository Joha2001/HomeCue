import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: string | number;
  }
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = loginSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Invalid input data", 
        errors: validatedData.error.errors 
      });
    }
    
    const { email, password, remember } = validatedData.data;
    
    // Special case for demo account
    if (email === 'demo@example.com' && password === 'password123') {
      // Create a demo user if needed
      let demoUser;
      
      // Check if demo user exists
      const [existingDemoUser] = await db.select().from(users).where(eq(users.email, 'demo@example.com'));
      
      if (existingDemoUser) {
        demoUser = existingDemoUser;
      } else {
        // Create a demo user since it doesn't exist
        console.log('Creating demo user account...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await db.insert(users).values({
          name: 'Demo User',
          email: 'demo@example.com',
          username: 'demo',
          password: hashedPassword,
          authProvider: 'local'
        }).returning();
        
        demoUser = newUser;
      }
      
      // Set session data for demo user
      req.session.userId = demoUser.id;
      
      // Save session before sending response to ensure it's stored
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        // Return demo user info after session is saved
        const { password: _, ...userWithoutPassword } = demoUser;
        return res.status(200).json(userWithoutPassword);
      });
    }
    
    // Regular user login flow
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Check password
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Set session data
    req.session.userId = user.id;
    
    // Set session cookie expiration
    if (remember) {
      // 30 days if remember me is checked
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      // 1 day if not checked
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
    }
    
    // Save session explicitly to ensure it's fully established
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to create session" });
      }
      
      // Return user info without password and with redirect info
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        ...userWithoutPassword,
        redirectUrl: '/dashboard'
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};

// Register handler
export const register = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = registerSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Invalid input data", 
        errors: validatedData.error.errors 
      });
    }
    
    const { name, email, password } = validatedData.data;
    
    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local'
    }).returning();
    
    // Set session data
    req.session.userId = newUser.id;
    
    // Return user info without password
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "An error occurred during registration" });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Find user by ID 
    const userId = req.session.userId;
    const query = db.select().from(users);
    
    // Handle both string and number IDs
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const [user] = await query.where(eq(users.id, userIdNum as number));
    
    if (!user) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "An error occurred while fetching user data" });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "An error occurred during logout" });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });
};