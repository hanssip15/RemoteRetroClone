"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { AuthGuard } from "@/components/auth-guard"

export default function NewRetroPage() {
  const { session } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamSize: "",
    duration: "60",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== FORM SUBMIT TRIGGERED ===")

    if (!formData.title.trim()) {
      alert("Please enter a title")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("=== CREATING RETRO ===")

      const response = await fetch("/api/retros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          teamSize: formData.teamSize ? Number.parseInt(formData.teamSize) : null,
          duration: Number.parseInt(formData.duration) || 60,
        }),
      })

      if (response.ok) {
        const retro = await response.json()
        console.log("=== RETRO CREATED ===", retro)

        if (!retro || !retro.id) {
          throw new Error("No retro ID returned from API")
        }

        // Use authenticated user's name as facilitator
        const facilitatorName = session?.user?.name || "Facilitator"

        // Set creator as facilitator in localStorage
        localStorage.setItem(`retro_${retro.id}_user`, facilitatorName)
        localStorage.setItem(`retro_${retro.id}_role`, "facilitator")

        console.log("=== ADDING FACILITATOR ===")
        console.log("Facilitator name:", facilitatorName)
        // Add facilitator to participants table
        try {
          const joinResponse = await fetch(`/api/retros/${retro.id}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: facilitatorName }),
          })

          if (!joinResponse.ok) {
            console.warn("Failed to add facilitator to participants, but continuing...")
          }
        } catch (joinError) {
          console.warn("Error adding facilitator:", joinError)
          // Continue anyway
        }

        console.log("=== REDIRECTING TO LOBBY ===")
        router.push(`/retro/${retro.id}/lobby`)
      } else {
        const errorData = await response.json()
        console.error("=== API ERROR ===", errorData)
        alert(`Failed to create retro: ${errorData.error || "Unknown error"}`)
      }
    } catch (error: any) {
      console.error("=== CATCH ERROR ===", error)
      alert(`Error creating retro: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

    return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create New Retrospective</CardTitle>
                <CardDescription>Set up a new retrospective session for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Retrospective Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Sprint 24 Retrospective"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Link href="/dashboard">
                      <Button variant="outline" disabled={isSubmitting}>
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Retrospective"}
                    </Button>
                  </div>
                </form>

                {/* {process.env.NODE_ENV === "development" && (
                  <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
                    <h4 className="font-bold mb-2">Debug Info:</h4>
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                    <p>Submitting: {isSubmitting ? "Yes" : "No"}</p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
