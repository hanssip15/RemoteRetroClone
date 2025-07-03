import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
export async function GET() {
  try {
    console.log("=== GET /api/retros ===")

    const retros = await sql`
      SELECT * FROM retros 
      ORDER BY created_at DESC
    `

    console.log("Retros fetched:", retros.length)
    return NextResponse.json(retros)
  } catch (error) {
    console.error("GET /api/retros error:", error)
    return NextResponse.json({ error: "Failed to fetch retros" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("=== POST /api/retros STARTED ===")

  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { title, description, teamSize, duration } = body

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      console.error("Invalid title:", title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const cleanData = {
      title: title.trim(),
      description: description || null,
      teamSize: teamSize || null,
      duration: duration || 60,
    }
    console.log("Clean data for insert:", cleanData)
    // Test database connection first
    console.log("Testing database connection...")
    const testQuery = await sql`SELECT 1 as test`
    console.log("Database connection test:", testQuery)
    console.log("Inserting retro into database...")
      let result: any
    
    // Generate a unique ID for the retro    
    const id = generateId(12) // Shorter, more manageable ID


      result = await sql`
        INSERT INTO retros (id, title, status, created_by, created_at, updated_at)
        VALUES (${id}, ${cleanData.title}, 'active', ${session.user.id}, NOW(), NOW())
        RETURNING *
      `
      console.log("Database insert result:", result)


    if (!result || result.length === 0) {
      throw new Error("No data returned from insert")
    }

    const retro = result[0]
    console.log("Created retro:", retro)

    if (!retro.id) {
      throw new Error("No ID in created retro")
    }

    console.log("=== POST /api/retros SUCCESS ===")
    console.log("Returning retro with ID:", retro.id)

    return NextResponse.json(retro, { status: 201 })
  } catch (error: any) {
    console.error("=== POST /api/retros ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to create retro",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
