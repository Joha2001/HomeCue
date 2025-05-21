import { db } from "../server/db";
import { tasks, users, vendors } from "../shared/schema";
import bcrypt from "bcryptjs";

/**
 * Initialize the database with sample data
 */
async function main() {
  console.log("🗄️ Initializing database with sample data...");

  try {
    // Create a default user
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const [defaultUser] = await db.insert(users).values({
      username: "demo",
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    }).returning().onConflictDoNothing();

    if (defaultUser) {
      console.log(`✓ Created demo user: ${defaultUser.name}`);
    } else {
      console.log("→ Demo user already exists");
    }

    // Create sample vendors
    const sampleVendors = [
      {
        name: "ABC Plumbing",
        description: "Plumbing repairs, installations, and maintenance",
        category: "Plumbing",
        contactName: "John Doe",
        phone: "555-123-4567",
        email: "contact@abcplumbing.com",
        address: "123 Main St, Anytown, USA",
        rating: 4,
        reviewCount: 124,
        distance: "5 miles away"
      },
      {
        name: "Reliable Electric",
        description: "Electrical repairs, wiring, and installations",
        category: "Electrical",
        contactName: "Jane Smith",
        phone: "555-987-6543",
        email: "info@reliableelectric.com",
        address: "456 Oak Ave, Anytown, USA",
        rating: 4,
        reviewCount: 87,
        distance: "3 miles away"
      },
      {
        name: "Green Thumb Landscaping",
        description: "Lawn care, landscaping, and garden maintenance",
        category: "Landscaping",
        contactName: "Mike Johnson",
        phone: "555-456-7890",
        email: "hello@greenthumb.com",
        address: "789 Pine Rd, Anytown, USA",
        rating: 5,
        reviewCount: 156,
        distance: "2 miles away"
      }
    ];

    for (const vendor of sampleVendors) {
      const [createdVendor] = await db.insert(vendors).values(vendor).returning().onConflictDoNothing();
      if (createdVendor) {
        console.log(`✓ Created vendor: ${createdVendor.name}`);
      }
    }

    // Create sample tasks
    if (defaultUser) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const sampleTasks = [
        {
          title: "Pay Mortgage",
          description: "Monthly payment due to First National Bank",
          dueDate: today,
          frequency: "monthly" as const,
          priority: "high" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id
        },
        {
          title: "Replace Air Filter",
          description: "HVAC filter needs replacement - filter size 20x20x1",
          dueDate: today,
          frequency: "quarterly" as const,
          priority: "medium" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id
        },
        {
          title: "Adjust Sprinkler Timer",
          description: "Change to summer watering schedule - 6am and 8pm",
          dueDate: today,
          frequency: "seasonal" as const,
          priority: "low" as const,
          status: "pending" as const,
          isRecurring: false,
          userId: defaultUser.id
        },
        {
          title: "Gutter Cleaning",
          description: "Clear gutters of leaves and debris",
          dueDate: tomorrow,
          reminderTime: today,
          frequency: "quarterly" as const,
          priority: "medium" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id,
          vendorId: 1
        },
        {
          title: "Lawn Mowing",
          description: "Mow the lawn and trim edges",
          dueDate: nextWeek,
          frequency: "weekly" as const,
          priority: "low" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id,
          vendorId: 3
        },
        {
          title: "Water Heater Maintenance",
          description: "Annual water heater flush and inspection",
          dueDate: nextMonth,
          frequency: "annual" as const,
          priority: "medium" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id,
          vendorId: 1
        },
        {
          title: "Property Tax Payment",
          description: "Semi-annual property tax payment to county",
          dueDate: nextMonth,
          reminderTime: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
          frequency: "annual" as const,
          priority: "high" as const,
          status: "pending" as const,
          isRecurring: true,
          userId: defaultUser.id
        }
      ];

      for (const task of sampleTasks) {
        const [createdTask] = await db.insert(tasks).values(task).returning().onConflictDoNothing();
        if (createdTask) {
          console.log(`✓ Created task: ${createdTask.title}`);
        }
      }
    }

    console.log("✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();