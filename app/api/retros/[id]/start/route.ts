import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: retroId } = await params

    if (retroId === "new") {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 })
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid retro ID" }, { status: 400 })
    }

    // Update retro status to 'in_progress'
    const [retro] = await sql`
      UPDATE retros 
      SET status = 'in_progress', updated_at = NOW()
      WHERE id = ${retroId}
      RETURNING *
    `

    if (!retro) {
      return NextResponse.json({ error: "Retro not found" }, { status: 404 })
    }

    return NextResponse.json(retro)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to start retro" }, { status: 500 })
  }
}
