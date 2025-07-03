import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("=== FIX DATABASE STARTED ===")

    // 1. Check if retros table has string ID
    await sql`ALTER TABLE retros ALTER COLUMN id TYPE VARCHAR(255)`
    console.log("✓ Fixed retros.id to VARCHAR(255)")

    // 2. Check if participants table has string retro_id
    await sql`ALTER TABLE participants ALTER COLUMN retro_id TYPE VARCHAR(255)`
    console.log("✓ Fixed participants.retro_id to VARCHAR(255)")

    // 3. Add role column if it doesn't exist
    await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'participant'`
    console.log("✓ Added role column to participants")

    // 4. Add user_id column if it doesn't exist
    await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)`
    console.log("✓ Added user_id column to participants")

    // 5. Update existing participants to have role
    await sql`UPDATE participants SET role = 'participant' WHERE role IS NULL OR role = ''`
    console.log("✓ Updated existing participants with role")

    // 6. Drop and recreate foreign key constraint if needed
    try {
      await sql`ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_retro_id_fkey`
      await sql`ALTER TABLE participants ADD CONSTRAINT participants_retro_id_fkey FOREIGN KEY (retro_id) REFERENCES retros(id) ON DELETE CASCADE`
      console.log("✓ Recreated foreign key constraint")
    } catch (error) {
      console.log("⚠ Foreign key constraint already exists or failed to recreate")
    }

    // 7. Add unique constraint for name per retro
    try {
      await sql`ALTER TABLE participants DROP CONSTRAINT IF EXISTS unique_name_per_retro`
      await sql`ALTER TABLE participants ADD CONSTRAINT unique_name_per_retro UNIQUE (retro_id, name)`
      console.log("✓ Added unique constraint for name per retro")
    } catch (error) {
      console.log("⚠ Unique constraint already exists or failed to add")
    }

    // 8. Verify the structure
    const structure = await sql`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name IN ('retros', 'participants')
      ORDER BY table_name, ordinal_position
    `

    console.log("=== FIX DATABASE COMPLETED ===")
    console.log("Final structure:", JSON.stringify(structure, null, 2))

    return NextResponse.json({
      success: true,
      message: "Database structure fixed successfully",
      structure: structure
    })
  } catch (error: any) {
    console.error("=== FIX DATABASE ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to fix database structure",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
} 