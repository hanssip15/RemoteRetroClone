import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const retroId = params.id

    // Handle the case where id is "new" - this should not be processed here
    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is a number
    const numericRetroId = Number.parseInt(retroId, 10)
    if (isNaN(numericRetroId)) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    // Get retro details
    const [retro] = await sql`
      SELECT * FROM retros WHERE id = ${numericRetroId}
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    // Get retro items
    const items = await sql`
      SELECT * FROM retro_items 
      WHERE retro_id = ${numericRetroId}
      ORDER BY created_at ASC
    `

    // Get participants
    const participants = await sql`
      SELECT * FROM participants 
      WHERE retro_id = ${numericRetroId}
      ORDER BY joined_at ASC
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const retroId = params.id

    // Handle the case where id is "new"
    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is a number
    const numericRetroId = Number.parseInt(retroId, 10)
    if (isNaN(numericRetroId)) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, status } = body

    const [retro] = await sql`
      UPDATE retros 
      SET title = ${title}, description = ${description}, status = ${status}, updated_at = NOW()
      WHERE id = ${numericRetroId}
      RETURNING *
    `

    return NextResponse.json(retro)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update retro" }, { status: 500 })
  }
}
