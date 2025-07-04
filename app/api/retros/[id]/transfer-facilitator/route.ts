import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("=== POST /api/retros/[id]/transfer-facilitator STARTED ===")
    const session = await getSession()
    console.log("Session data:", session)
    
    const { id: retroId } = await params
    const body = await request.json()
    const { newFacilitatorId } = body

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

    // Check if current user is the facilitator
    let [currentFacilitator] = await sql`
      SELECT * FROM participants 
      WHERE retro_id = ${retroId} AND role = true
    `

    if (!currentFacilitator) {
      // Try to set the first participant as facilitator
      const [firstParticipant] = await sql`
        SELECT * FROM participants 
        WHERE retro_id = ${retroId} 
        ORDER BY joined_at ASC 
        LIMIT 1
      `
      
      if (!firstParticipant) {
        return NextResponse.json({ error: "No participants found for this retro" }, { status: 404 })
      }

      // Set first participant as facilitator
      await sql`
        UPDATE participants 
        SET role = 'facilitator' 
        WHERE id = ${firstParticipant.id}
      `
      
      // Update currentFacilitator reference
      const [updatedFacilitator] = await sql`
        SELECT * FROM participants 
        WHERE id = ${firstParticipant.id}
      `
      
      if (!updatedFacilitator) {
        return NextResponse.json({ error: "Failed to set facilitator" }, { status: 500 })
      }
      
      // If the current user is the new facilitator, allow the transfer
      const userId = session?.user?.id
      if (updatedFacilitator.user_id === userId) {
        // Continue with transfer logic
        currentFacilitator = updatedFacilitator
      } else {
        return NextResponse.json({ error: "No facilitator found for this retro. Please contact support." }, { status: 404 })
      }
    } else {
      // Check if current user is the facilitator
      const userId = session?.user?.id
      if (currentFacilitator.user_id !== userId) {
        return NextResponse.json({ error: "Only the current facilitator can transfer facilitator role" }, { status: 403 })
      }
    }

    // Check if new facilitator exists and is a participant
    const [newFacilitator] = await sql`
      SELECT * FROM participants 
      WHERE id = ${newFacilitatorId} AND retro_id = ${retroId}
    `

    if (!newFacilitator) {
      return NextResponse.json({ error: "New facilitator not found in this retro" }, { status: 404 })
    }

    if (newFacilitator.id === currentFacilitator.id) {
      return NextResponse.json({ error: "Cannot transfer facilitator role to yourself" }, { status: 400 })
    }

    // Start transaction to update both participants
    await sql`BEGIN`

    try {
      // Update current facilitator to participant
      await sql`
        UPDATE participants 
        SET role = false 
        WHERE id = ${currentFacilitator.id}
      `

      // Update new facilitator
      await sql`
        UPDATE participants 
        SET role = true 
        WHERE id = ${newFacilitator.id}
      `

      await sql`COMMIT`

      // Get updated participants
      const [updatedCurrentFacilitator] = await sql`
        SELECT * FROM participants WHERE id = ${currentFacilitator.id}
      `
      const [updatedNewFacilitator] = await sql`
        SELECT * FROM participants WHERE id = ${newFacilitator.id}
      `

      console.log("Facilitator transfer successful")
      console.log("Previous facilitator:", updatedCurrentFacilitator)
      console.log("New facilitator:", updatedNewFacilitator)

      return NextResponse.json({
        success: true,
        message: "Facilitator transferred successfully",
        previousFacilitator: updatedCurrentFacilitator,
        newFacilitator: updatedNewFacilitator
      })

    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }

  } catch (error: any) {
    console.error("=== TRANSFER FACILITATOR ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Full error object:", error)
    return NextResponse.json({ 
      error: "Failed to transfer facilitator",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
} 