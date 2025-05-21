import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const priorityEnum = pgEnum('priority', ['high', 'medium', 'low']);
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'seasonal']);
export const statusEnum = pgEnum('status', ['pending', 'completed', 'overdue']);
export const authProviderEnum = pgEnum('auth_provider', ['local', 'google', 'apple']);
export const applianceTypeEnum = pgEnum('appliance_type', [
  'refrigerator', 'dishwasher', 'washer', 'dryer', 'water_heater', 
  'hvac', 'furnace', 'air_conditioner', 'microwave', 'oven', 
  'range', 'disposal', 'other'
]);

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  password: text("password"),
  name: text("name"),
  email: text("email").notNull().unique(),
  authProvider: authProviderEnum("auth_provider").default('local'),
  profileImageUrl: text("profile_image_url"),
  state: text("state"),
  zipCode: text("zip_code"),
  climateRegion: text("climate_region"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  reminderTime: timestamp("reminder_time"),
  frequency: frequencyEnum("frequency").notNull(),
  priority: priorityEnum("priority").notNull(),
  status: statusEnum("status").notNull().default('pending'),
  isRecurring: boolean("is_recurring").notNull().default(false),
  userId: integer("user_id").notNull(),
  vendorId: integer("vendor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  distance: text("distance"),
});

// Warranties table
export const warranties = pgTable("warranties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  applianceType: applianceTypeEnum("appliance_type").notNull(),
  brand: text("brand").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: date("purchase_date").notNull(),
  warrantyExpirationDate: date("warranty_expiration_date").notNull(),
  purchasePrice: text("purchase_price"),
  purchaseLocation: text("purchase_location"),
  documentUrl: text("document_url"),
  vendorId: integer("vendor_id").references(() => vendors.id),
  notes: text("notes"),
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderDays: integer("reminder_days").default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// House Health Score table
export const houseHealthScores = pgTable("house_health_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  overallScore: integer("overall_score").notNull(),
  dailyScore: integer("daily_score").notNull(),
  weeklyScore: integer("weekly_score").notNull(),
  monthlyScore: integer("monthly_score").notNull(),
  seasonalScore: integer("seasonal_score").notNull(),
  annualScore: integer("annual_score").notNull(),
  lastCalculated: timestamp("last_calculated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHouseHealthScoreSchema = createInsertSchema(houseHealthScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertWarranty = z.infer<typeof insertWarrantySchema>;
export type Warranty = typeof warranties.$inferSelect;

export type InsertHouseHealthScore = z.infer<typeof insertHouseHealthScoreSchema>;
export type HouseHealthScore = typeof houseHealthScores.$inferSelect;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Additional custom schemas for forms
export const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.string(),
  reminderTime: z.string().optional(),
});

export const vendorFormSchema = insertVendorSchema.extend({
  rating: z.coerce.number().min(1).max(5).optional(),
});

export const warrantyFormSchema = insertWarrantySchema.extend({
  purchaseDate: z.string(),
  warrantyExpirationDate: z.string(),
  purchasePrice: z.string().optional(),
  documentUrl: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
export type VendorFormData = z.infer<typeof vendorFormSchema>;
export type WarrantyFormData = z.infer<typeof warrantyFormSchema>;
