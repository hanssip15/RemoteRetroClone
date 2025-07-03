"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedbackCard } from "@/components/feedback-card"
import { AddFeedbackForm } from "@/components/add-feedback-form"
import { ArrowLeft, Users, Clock, Share2 } from "lucide-react"
import Link from "next/link"

interface RetroItem {
  id: number
  content: string
  author: string
  votes: number
  type: string
  created_at: string
}

interface Retro {
  id: string
  title: string
  description: string
  status: string
  team_size: number
  duration: number
  created_at: string
}

interface Participant {
  id: number
  name: string
  joined_at: string
}

export default function RetroPage() {
  const params = useParams()
  const router = useRouter()
  const retroId = params.id as string

  const [retro, setRetro] = useState<Retro | null>(null)
  const [items, setItems] = useState<RetroItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If the ID is "new", redirect to the new retro page
    if (retroId === "new") {
      router.push("/retro/new")
      return
    }

    // Validate that retroId is not empty
    if (!retroId || retroId.trim().length === 0) {
      setError("Invalid retro ID")
      setLoading(false)
      return
    }

    fetchRetroData()
  }, [retroId, router])

  const fetchRetroData = async () => {
    try {
      console.log("Fetching retro data for ID:", retroId)

      const response = await fetch(`/api/retros/${retroId}`)
      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Retro data received:", data)

        if (!data.retro) {
          throw new Error("No retro data in response")
        }

        setRetro(data.retro)
        setItems(data.items || [])
        setParticipants(data.participants || [])
      } else {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        setError(errorData.error || "Failed to fetch retro data")
      }
    } catch (error: any) {
      console.error("Error fetching retro data:", error)
      setError(`Failed to fetch retro data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (type: string, content: string, author: string) => {
    try {
      const response = await fetch(`/api/retros/${retroId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, content, author }),
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems((prev) => [...prev, newItem])
      }
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleUpdateItem = async (id: number, content: string) => {
    try {
      const response = await fetch(`/api/retros/${retroId}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/retros/${retroId}/items/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleVoteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/retros/${retroId}/items/${id}/vote`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      }
    } catch (error) {
      console.error("Error voting item:", error)
    }
  }

  const getItemsByType = (type: string) => {
    return items.filter((item) => item.type === type).sort((a, b) => b.votes - a.votes)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // You could add a toast notification here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retrospective...</p>
        </div>
      </div>
    )
  }

  if (error || !retro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Retrospective not found"}</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{retro.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{participants.length} participants</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{retro.duration} min</span>
                  </Badge>
                  <Badge variant={retro.status === "active" ? "default" : "secondary"}>{retro.status}</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={copyShareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Retro Board */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* What Went Well */}
          <Card className="h-fit">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center justify-between">
                What Went Well
                <Badge variant="secondary">{getItemsByType("went_well").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {getItemsByType("went_well").map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onVote={handleVoteItem}
                />
              ))}
              <AddFeedbackForm
                type="went_well"
                onAdd={(content, author) => handleAddItem("went_well", content, author)}
              />
            </CardContent>
          </Card>

          {/* What Could Improve */}
          <Card className="h-fit">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-800 flex items-center justify-between">
                What Could Improve
                <Badge variant="secondary">{getItemsByType("improve").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {getItemsByType("improve").map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onVote={handleVoteItem}
                />
              ))}
              <AddFeedbackForm type="improve" onAdd={(content, author) => handleAddItem("improve", content, author)} />
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="h-fit">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800 flex items-center justify-between">
                Action Items
                <Badge variant="secondary">{getItemsByType("action_item").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {getItemsByType("action_item").map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onVote={handleVoteItem}
                />
              ))}
              <AddFeedbackForm
                type="action_item"
                onAdd={(content, author) => handleAddItem("action_item", content, author)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
