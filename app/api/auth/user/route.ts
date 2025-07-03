import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, name, image } = session.user

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Insert or update user
    const [user] = await sql`
      INSERT INTO users (id, email, name, image_url)
      VALUES (${session.user.id}, ${email}, ${name || null}, ${image || null})
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          name = EXCLUDED.name,
          image_url = EXCLUDED.image_url
      RETURNING *
    `

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error creating/updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [user] = await sql`
      SELECT * FROM users WHERE id = ${session.user.id}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 