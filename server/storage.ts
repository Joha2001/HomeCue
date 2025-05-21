import { 
  tasks, 
  vendors, 
  users, 
  warranties, 
  houseHealthScores,
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask, 
  type Vendor, 
  type InsertVendor,
  type Warranty,
  type InsertWarranty,
  type HouseHealthScore,
  type InsertHouseHealthScore
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  getTasksByFrequency(userId: number, frequency: string): Promise<Task[]>;
  getUpcomingTasks(userId: number, days: number): Promise<Task[]>;
  getTasksDueToday(userId: number): Promise<Task[]>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendorById(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
  getVendorsByCategory(category: string): Promise<Vendor[]>;
  
  // Warranty methods
  getWarranties(userId: number): Promise<Warranty[]>;
  getWarrantyById(id: number): Promise<Warranty | undefined>;
  createWarranty(warranty: InsertWarranty): Promise<Warranty>;
  updateWarranty(id: number, warranty: Partial<Warranty>): Promise<Warranty | undefined>;
  deleteWarranty(id: number): Promise<boolean>;
  getWarrantiesByApplianceType(userId: number, applianceType: string): Promise<Warranty[]>;
  getExpiringSoonWarranties(userId: number, days: number): Promise<Warranty[]>;
  
  // House Health Score methods
  getHouseHealthScore(userId: number): Promise<HouseHealthScore | undefined>;
  createHouseHealthScore(score: InsertHouseHealthScore): Promise<HouseHealthScore>;
  updateHouseHealthScore(userId: number, score: Partial<HouseHealthScore>): Promise<HouseHealthScore | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import('./db');
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    const { db } = await import('./db');
    return db.select().from(tasks);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const { db } = await import('./db');
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return !!result;
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    const { db } = await import('./db');
    const { eq, and } = await import('drizzle-orm');
    return db.select().from(tasks).where(
      and(eq(tasks.userId, userId), eq(tasks.status, status as any))
    );
  }

  async getTasksByFrequency(userId: number, frequency: string): Promise<Task[]> {
    const { db } = await import('./db');
    const { eq, and } = await import('drizzle-orm');
    return db.select().from(tasks).where(
      and(eq(tasks.userId, userId), eq(tasks.frequency, frequency as any))
    );
  }

  async getUpcomingTasks(userId: number, days: number): Promise<Task[]> {
    const { db } = await import('./db');
    const { eq, and, gte, lte, ne } = await import('drizzle-orm');
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        ne(tasks.status, 'completed'),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, futureDate)
      )
    ).orderBy(tasks.dueDate);
  }

  async getTasksDueToday(userId: number): Promise<Task[]> {
    const { db } = await import('./db');
    const { eq, and, gte, lt, ne } = await import('drizzle-orm');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        ne(tasks.status, 'completed'),
        gte(tasks.dueDate, today),
        lt(tasks.dueDate, tomorrow)
      )
    );
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    const { db } = await import('./db');
    return db.select().from(vendors);
  }

  async getVendorById(id: number): Promise<Vendor | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const { db } = await import('./db');
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<Vendor>): Promise<Vendor | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendorUpdate)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return !!result;
  }

  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    return db.select().from(vendors).where(eq(vendors.category, category));
  }

  // Warranty methods
  async getWarranties(userId: number): Promise<Warranty[]> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    return db.select().from(warranties).where(eq(warranties.userId, userId));
  }

  async getWarrantyById(id: number): Promise<Warranty | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [warranty] = await db.select().from(warranties).where(eq(warranties.id, id));
    return warranty;
  }

  async createWarranty(insertWarranty: InsertWarranty): Promise<Warranty> {
    const { db } = await import('./db');
    const [warranty] = await db.insert(warranties).values(insertWarranty).returning();
    return warranty;
  }

  async updateWarranty(id: number, warrantyUpdate: Partial<Warranty>): Promise<Warranty | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const [updatedWarranty] = await db
      .update(warranties)
      .set(warrantyUpdate)
      .where(eq(warranties.id, id))
      .returning();
    return updatedWarranty;
  }

  async deleteWarranty(id: number): Promise<boolean> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const result = await db.delete(warranties).where(eq(warranties.id, id));
    return !!result;
  }

  async getWarrantiesByApplianceType(userId: number, applianceType: string): Promise<Warranty[]> {
    const { db } = await import('./db');
    const { eq, and } = await import('drizzle-orm');
    return db.select().from(warranties).where(
      and(
        eq(warranties.userId, userId),
        eq(warranties.applianceType, applianceType as any)
      )
    );
  }

  async getExpiringSoonWarranties(userId: number, days: number): Promise<Warranty[]> {
    const { db } = await import('./db');
    const { eq, and, lte, gte } = await import('drizzle-orm');
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return db.select().from(warranties).where(
      and(
        eq(warranties.userId, userId),
        gte(warranties.warrantyExpirationDate, now),
        lte(warranties.warrantyExpirationDate, futureDate)
      )
    ).orderBy(warranties.warrantyExpirationDate);
  }

  // House Health Score methods
  async getHouseHealthScore(userId: number): Promise<HouseHealthScore | undefined> {
    try {
      const [score] = await db
        .select()
        .from(houseHealthScores)
        .where(eq(houseHealthScores.userId, userId));
      
      return score;
    } catch (error) {
      console.error("Error fetching house health score:", error);
      return undefined;
    }
  }

  async createHouseHealthScore(scoreData: InsertHouseHealthScore): Promise<HouseHealthScore> {
    try {
      const [score] = await db
        .insert(houseHealthScores)
        .values(scoreData)
        .returning();
      
      return score;
    } catch (error) {
      console.error("Error creating house health score:", error);
      throw new Error("Failed to create house health score");
    }
  }

  async updateHouseHealthScore(userId: number, scoreUpdate: Partial<HouseHealthScore>): Promise<HouseHealthScore | undefined> {
    try {
      const [updatedScore] = await db
        .update(houseHealthScores)
        .set({
          ...scoreUpdate,
          lastCalculated: new Date(),
          updatedAt: new Date()
        })
        .where(eq(houseHealthScores.userId, userId))
        .returning();
      
      return updatedScore;
    } catch (error) {
      console.error("Error updating house health score:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
