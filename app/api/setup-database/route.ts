import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  return await POST({} as NextRequest)
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Setting up database tables...")

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Users table created/verified")

    // Add user_id column to participants table
    try {
      await sql`
        ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
      `
      console.log("✅ Added user_id to participants table")
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️ user_id column already exists in participants table")
      } else {
        throw error
      }
    }

    // Add user_id column to retro_items table
    try {
      await sql`
        ALTER TABLE retro_items ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
      `
      console.log("✅ Added user_id to retro_items table")
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️ user_id column already exists in retro_items table")
      } else {
        throw error
      }
    }

    // Add created_by column to retros table
    try {
      await sql`
        ALTER TABLE retros ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
      `
      console.log("✅ Added created_by to retros table")
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️ created_by column already exists in retros table")
      } else {
        throw error
      }
    }

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_retro_items_user_id ON retro_items(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_retros_created_by ON retros(created_by)`
    console.log("✅ Indexes created")

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      tables: ["users", "participants", "retro_items", "retros"],
      indexes: ["idx_participants_user_id", "idx_retro_items_user_id", "idx_retros_created_by"]
    })

  } catch (error: any) {
    console.error("❌ Database setup error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
} 