import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: retroId } = await params
    console.log("=== GET /api/retros/[id] STARTED ===", retroId)
    // Handle the case where id is "new" - this should not be processed here
    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    // Get retro details using string ID
    const [retro] = await sql`
      SELECT * FROM retros WHERE id = ${retroId}
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    // Get retro items
    const items = await sql`
      SELECT * FROM retro_items 
      WHERE retro_id = ${retroId}
      ORDER BY created_at ASC
    `

    // Get participants
    const participants = await sql`
      SELECT * FROM participants 
      WHERE retro_id = ${retroId}
    `

    return NextResponse.json({
      retro,
      items,
      participants,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch retro" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: retroId } = await params

    // Handle the case where id is "new"
    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, status } = body

    const [retro] = await sql`
      UPDATE retros 
      SET title = ${title}, description = ${description}, status = ${status}, updated_at = NOW()
      WHERE id = ${retroId}
      RETURNING *
    `

    return NextResponse.json(retro)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update retro" }, { status: 500 })
  }
}
