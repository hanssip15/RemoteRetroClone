import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const items = await sql`
      SELECT * FROM retro_items 
      WHERE retro_id = ${retroId}
      ORDER BY created_at ASC
    `

    return NextResponse.json(items)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    const { type, content, author } = body

    const [item] = await sql`
      INSERT INTO retro_items (retro_id, type, content, author, user_id, votes, created_at)
      VALUES (${retroId}, ${type}, ${content}, ${author}, ${session.user.id}, 0, NOW())
      RETURNING *
    `

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
