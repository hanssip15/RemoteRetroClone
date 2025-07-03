import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("=== POST /api/retros/[id]/join STARTED ===")
    const session = await getSession()
    // console.log("Session data:", session)
    
    const userId = session?.user?.id || null

    const { id: retroId } = await params
    const body = await request.json()
    const { name } = body

    console.log("Retro :", retroId)
    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const cleanName = name.trim()

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

    // --- Idempotent join logic ---
    if (userId) {
      // Cek apakah user_id sudah join
      const [existing] = await sql`
        SELECT * FROM participants WHERE retro_id = ${retroId} AND user_id = ${userId}
      `
      if (existing) {
        return NextResponse.json(existing, { status: 200 })
      }
    } else {
      const [existingName] = await sql`
        SELECT * FROM participants WHERE retro_id = ${retroId} AND name = ${cleanName}
      `
      if (existingName) {
        return NextResponse.json({ error: "Name already taken in this retro" }, { status: 409 })
      }
    }

  

    let participant
    

      console.log("User ID:", userId)
      console.log("Retro ID:", retroId)
      const [participantResult] = await sql`
        INSERT INTO participants (retro_id, user_id, role)
        VALUES (${retroId}, ${userId}, true)
        RETURNING *
      `
      participant = participantResult
      // Add role property manually for response
      participant.role = "participant"

    return NextResponse.json(participant, { status: 201 })
  } catch (error: any) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to join retro" }, { status: 500 })
  }
}
