import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const items = await sql`
      SELECT * FROM retro_items 
      WHERE retro_id = ${numericRetroId}
      ORDER BY created_at ASC
    `

    return NextResponse.json(items)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { type, content, author } = body

    const [item] = await sql`
      INSERT INTO retro_items (retro_id, type, content, author, votes, created_at)
      VALUES (${numericRetroId}, ${type}, ${content}, ${author}, 0, NOW())
      RETURNING *
    `

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
