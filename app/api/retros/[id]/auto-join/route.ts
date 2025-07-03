import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("=== POST /api/retros/[id]/auto-join STARTED ===")
    const session = await getSession()
    console.log("Session data:", session)
    
    const { id: retroId } = await params
    const body = await request.json()
    const { name, autoJoin = false } = body

    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    // Check if retro exists
    const [retro] = await sql`
      SELECT * FROM retros WHERE id = ${retroId}
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    // Check if retro is still in lobby state
    if (retro.status !== "active" && retro.status !== "draft") {
      return NextResponse.json({ error: "Retro is not available for joining" }, { status: 400 })
    }

    const userId = session?.user?.id || null
    let participantName = name

    // Generate participant name
    if (!participantName) {
      if (session?.user?.name) {
        participantName = session.user.name
      } else {
        // Generate participant name
        const participantCount = await sql`
          SELECT COUNT(*) as count FROM participants 
          WHERE retro_id = ${retroId} AND name LIKE 'Participant%'
        `
        const count = participantCount[0]?.count || 0
        participantName = `Participant ${count + 1}`
      }
    }

    const cleanName = participantName.trim()

    // --- Idempotent join logic ---
    if (userId) {
      // Check if user_id already joined
      const [existing] = await sql`
        SELECT * FROM participants WHERE retro_id = ${retroId} AND user_id = ${userId}
      `
      if (existing) {
        return NextResponse.json(existing, { status: 200 })
      }
    } else {
      // Check if name already taken in this retro
      const [existingName] = await sql`
        SELECT * FROM participants WHERE retro_id = ${retroId} AND name = ${cleanName}
      `
      if (existingName) {
        // If auto-join and name taken, generate new name
        if (autoJoin) {
          const participantCount = await sql`
            SELECT COUNT(*) as count FROM participants 
            WHERE retro_id = ${retroId} AND name LIKE 'Participant%'
          `
          const count = participantCount[0]?.count || 0
          participantName = `Participant ${count + 1}`
        } else {
          return NextResponse.json({ error: "Name already taken in this retro" }, { status: 409 })
        }
      }
    }

    // Check if role column exists
    const roleColumnExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'role'
      ) as has_role_column
    `

    console.log("Role column exists check:", roleColumnExists[0]?.has_role_column)

    // Check if this is the first participant (should be facilitator)
    const participantCount = await sql`
      SELECT COUNT(*) as count FROM participants WHERE retro_id = ${retroId}
    `
    const isFirstParticipant = participantCount[0]?.count === 0

    let participant

    try {
        const [participantResult] = await sql`
          INSERT INTO participants (retro_id, user_id, role)
          VALUES (${retroId}, ${userId}, false)
          RETURNING *
        `
        participant = participantResult
        // Add role property manually for response
        participant.role = isFirstParticipant ? 'facilitator' : 'participant'
        console.log("Participant inserted without role:", participant)
    } catch (insertError: any) {
      console.error("=== INSERT ERROR ===")
      console.error("Insert error:", insertError)
      console.error("Insert error message:", insertError.message)
      throw insertError
    }

    console.log("Auto-join successful:", participant)
    return NextResponse.json(participant, { status: 201 })
  } catch (error: any) {
    console.error("=== AUTO-JOIN ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Full error object:", error)
    return NextResponse.json({ 
      error: "Failed to auto-join retro",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
} 