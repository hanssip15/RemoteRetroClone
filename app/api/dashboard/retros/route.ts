import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "3")
    const offset = (page - 1) * limit

    // Get total count for pagination
    const [totalResult] = await sql`
      SELECT COUNT(*) as count FROM retros
    `
    const total = Number.parseInt(totalResult.count)
    const totalPages = Math.ceil(total / limit)

    // Get retros with participant count
    const retros = await sql`
      SELECT 
        r.*,
        COALESCE(p.participant_count, 0) as participants
      FROM retros r
      LEFT JOIN (
        SELECT retro_id, COUNT(*) as participant_count
        FROM participants
        GROUP BY retro_id
      ) p ON r.id = p.retro_id
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({
      retros,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Dashboard retros error:", error)
    return NextResponse.json({ error: "Failed to fetch retros" }, { status: 500 })
  }
}
