import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: retroId } = await params

    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    // Get retro details
    const [retro] = await sql`
      SELECT * FROM retros WHERE id = ${retroId}
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    // Check if role column exists
   
      // Role column exists, select it
      let participants = await sql`
        SELECT
        participants.id AS id,
        participants.role as role,
        users.name AS name
      FROM participants
      JOIN users
        ON participants.user_id = users.id
      WHERE participants.retro_id = ${retroId}
      `

    return NextResponse.json({
      retro,
      participants,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch lobby data" }, { status: 500 })
  }
}
