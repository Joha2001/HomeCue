import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🗄️ Running database migrations...");

  try {
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "priority" AS ENUM ('high', 'medium', 'low');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "frequency" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'seasonal');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "status" AS ENUM ('pending', 'completed', 'overdue');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "auth_provider" AS ENUM ('local', 'google', 'apple');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" TEXT PRIMARY KEY,
        "sess" TEXT NOT NULL,
        "expire" TIMESTAMP NOT NULL
      );
    `);

    // Create index on sessions
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT UNIQUE,
        "password" TEXT,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "auth_provider" "auth_provider" DEFAULT 'local',
        "profile_image_url" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create tasks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "due_date" TIMESTAMP NOT NULL,
        "reminder_time" TIMESTAMP,
        "frequency" "frequency" NOT NULL,
        "priority" "priority" NOT NULL,
        "status" "status" NOT NULL DEFAULT 'pending',
        "is_recurring" BOOLEAN NOT NULL DEFAULT false,
        "user_id" INTEGER NOT NULL,
        "vendor_id" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create vendors table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "contact_name" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "address" TEXT,
        "rating" INTEGER,
        "review_count" INTEGER DEFAULT 0,
        "distance" TEXT
      );
    `);

    console.log("✅ Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Error during migrations:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });