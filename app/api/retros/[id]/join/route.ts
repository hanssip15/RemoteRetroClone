import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const retroId = params.id
    const body = await request.json()
    const { name } = body

    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    const numericRetroId = Number.parseInt(retroId, 10)
    if (isNaN(numericRetroId)) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const cleanName = name.trim()

    // Check if retro exists
    const [retro] = await sql`
      SELECT * FROM retros WHERE id = ${numericRetroId}
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    // Check if retro is still in lobby state
    if (retro.status !== "active" && retro.status !== "draft") {
      return NextResponse.json({ error: "Retro is not available for joining" }, { status: 400 })
    }

    try {
      // Check if role column exists
      const roleColumnExists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'participants' AND column_name = 'role'
        ) as has_role_column
      `

      let participant

      if (roleColumnExists[0]?.has_role_column) {
        // Role column exists, use it
        console.log("Role column exists, inserting with role")
        const [participantResult] = await sql`
          INSERT INTO participants (retro_id, name, role, joined_at)
          VALUES (${numericRetroId}, ${cleanName}, 'participant', NOW())
          RETURNING *
        `
        participant = participantResult
      } else {
        // Role column doesn't exist, insert without it
        console.log("Role column doesn't exist, inserting without role")
        const [participantResult] = await sql`
          INSERT INTO participants (retro_id, name, joined_at)
          VALUES (${numericRetroId}, ${cleanName}, NOW())
          RETURNING *
        `
        participant = participantResult
        // Add role property manually for response
        participant.role = "participant"
      }

      return NextResponse.json(participant, { status: 201 })
    } catch (error) {
      // Handle duplicate name error
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        return NextResponse.json({ error: "Name already taken in this retro" }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to join retro" }, { status: 500 })
  }
}
