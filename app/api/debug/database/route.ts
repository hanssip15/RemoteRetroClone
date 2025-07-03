import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== DATABASE DEBUG STARTED ===")

    // Check retros table structure
    const retrosStructure = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'retros' 
      ORDER BY ordinal_position
    `

    // Check participants table structure
    const participantsStructure = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'participants' 
      ORDER BY ordinal_position
    `

    // Check foreign key constraints
    const foreignKeys = await sql`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (tc.table_name = 'participants' OR tc.table_name = 'retros')
    `

    // Check sample data
    const retrosCount = await sql`SELECT COUNT(*) as count FROM retros`
    const participantsCount = await sql`SELECT COUNT(*) as count FROM participants`

    // Check latest retro
    const latestRetros = await sql`
      SELECT id, title, status, created_at 
      FROM retros 
      ORDER BY created_at DESC 
      LIMIT 3
    `

    // Check participants for latest retro
    const latestParticipants = await sql`
      SELECT p.*, r.title as retro_title 
      FROM participants p 
      JOIN retros r ON p.retro_id = r.id 
      ORDER BY p.joined_at DESC 
      LIMIT 5
    `

    const debugInfo = {
      retrosStructure: retrosStructure,
      participantsStructure: participantsStructure,
      foreignKeys: foreignKeys,
      counts: {
        retros: retrosCount[0]?.count || 0,
        participants: participantsCount[0]?.count || 0
      },
      latestRetros: latestRetros,
      latestParticipants: latestParticipants
    }

    console.log("=== DATABASE DEBUG COMPLETED ===")
    console.log("Debug info:", JSON.stringify(debugInfo, null, 2))

    return NextResponse.json(debugInfo)
  } catch (error: any) {
    console.error("=== DATABASE DEBUG ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to debug database",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
} 