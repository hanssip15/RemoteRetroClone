"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShareLinkModal } from "@/components/share-link-modal"
import { TransferFacilitatorModal } from "@/components/transfer-facilitator-modal"
import { ArrowLeft, Users, Clock, Share2, Play, RefreshCw, Crown, UserCheck } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { UserProfile } from "@/components/user-profile"
import { useToast } from "@/hooks/use-toast"

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
  id: string
  name: string
  role: boolean
  joined_at: string
  user_id?: string
}

export default function RetroLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const retroId = params.id as string
  const { toast } = useToast()

  const [retro, setRetro] = useState<Retro | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string | undefined>(undefined)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedParticipantForTransfer, setSelectedParticipantForTransfer] = useState<Participant | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const { data: session, status } = useSession()

  useEffect(() => {
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

    // Check if user already joined
    const storedUserName = localStorage.getItem(`retro_${retroId}_user`)
    const storedUserRole = localStorage.getItem(`retro_${retroId}_role`)

    if (storedUserName && storedUserRole) {
      setUserName(storedUserName ?? undefined)
      setUserRole(storedUserRole === "true")
    } else {
      // Auto-join user immediately when they access the lobby
      handleAutoJoin()
    }

    fetchLobbyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retroId, router, session, status])

  const fetchLobbyData = async () => {
    try {
      const response = await fetch(`/api/retros/${retroId}/lobby`)
      if (response.ok) {
        const data = await response.json()
        setRetro(data.retro)
        setParticipants(data.participants)

        // Check if retro has started
        if (data.retro.status === "in_progress") {
          router.push(`/retro/${retroId}`)
          return
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch lobby data")
      }
    } catch (error) {
      console.error("Error fetching lobby data:", error)
      setError("Failed to fetch lobby data")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoJoin = async () => {
    setIsJoining(true)
    setJoinError(null)

    try {
      const response = await fetch(`/api/retros/${retroId}/auto-join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: session?.user?.name || null,
          autoJoin: true 
        }),
      })

      if (response.ok) {
        const participant = await response.json()

        // Store user info in localStorage
        localStorage.setItem(`retro_${retroId}_user`, participant.name)
        localStorage.setItem(`retro_${retroId}_role`, participant.role)

        setUserName(participant.name ?? undefined)
        setUserRole(participant.role)
        setShowJoinModal(false)

        toast({
          title: "Joined Successfully!",
          description: `You're now participating as ${participant.name}`,
          duration: 3000,
        })

        // Refresh lobby data
        fetchLobbyData()
      } else {
        const errorData = await response.json()
        console.error("Auto-join failed:", errorData.error)
        console.error("Error details:", errorData.details)
        
        // Show error toast but don't show manual join modal
        // since participant might have actually joined successfully
        toast({
          title: "Auto-join warning",
          description: `Auto-join returned error but participant may have joined. Error: ${errorData.error}`,
          variant: "destructive",
        })
        
        // Refresh participants list to check if join actually worked
        // The participants will be refreshed on the next useEffect cycle
      }
    } catch (error) {
      console.error("Error auto-joining retro:", error)
      // If auto-join fails, show manual join modal
      setShowJoinModal(true)
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoin = async (name: string) => {
    setIsJoining(true)
    setJoinError(null)

    try {
      const response = await fetch(`/api/retros/${retroId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const participant = await response.json()

        // Store user info in localStorage
        localStorage.setItem(`retro_${retroId}_user`, name)
        localStorage.setItem(`retro_${retroId}_role`, participant.role)

        setUserName(name ?? undefined)
        setUserRole(participant.role)
        setShowJoinModal(false)

        // Refresh lobby data
        fetchLobbyData()
      } else {
        const errorData = await response.json()
        setJoinError(errorData.error || "Failed to join retro")
      }
    } catch (error) {
      console.error("Error joining retro:", error)
      setJoinError("Failed to join retro")
    } finally {
      setIsJoining(false)
    }
  }

  const handleStartRetro = async () => {
    try {
      const response = await fetch(`/api/retros/${retroId}/start`, {
        method: "POST",
      })

      if (response.ok) {
        router.push(`/retro/${retroId}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to start retro: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error starting retro:", error)
      alert("Failed to start retro")
    }
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const facilitator = participants.find((p) => p.role === true)
  const isFacilitator = userRole === false

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lobby...</p>
        </div>
      </div>
    )
  }

  if (error || !retro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Retro not found"}</h1>
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
                    <span>{participants.length} joined</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{retro.duration} min</span>
                  </Badge>
                  <Badge variant="outline">Lobby</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => fetchLobbyData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {isFacilitator && (
                <Button variant="outline" onClick={() => setShowShareModal(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      {/* Lobby Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Retro Info */}
          <Card>
            <CardHeader>
              <CardTitle>Retro Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Title</h4>
                <p>{retro.title}</p>
              </div>
              {retro.description && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Description</h4>
                  <p className="text-sm text-gray-700">{retro.description}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Expected Team Size</h4>
                <p>{retro.team_size || "Not specified"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Duration</h4>
                <p>{retro.duration} minutes</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Facilitator</h4>
                <p className="flex items-center space-x-1">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span>{facilitator?.name || "Unknown"}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Participants ({participants.length})<Badge variant="secondary">{participants.length} joined</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isFacilitator && participant.role !== true 
                        ? "bg-gray-50 hover:bg-gray-100 cursor-pointer" 
                        : "bg-gray-50"
                    }`}
                    onClick={() => {
                      if (isFacilitator && participant.role !== true) {
                        setShowTransferModal(true)
                        // Set selected participant for transfer
                        setSelectedParticipantForTransfer(participant)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{participant.name}</span>
                      {participant.name.startsWith('Participant') && (
                        <Badge variant="outline" className="text-xs">Auto-joined</Badge>
                      )}
                      {isFacilitator && participant.role !== true && (
                        <Badge variant="secondary" className="text-xs">Click to transfer role</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {participant.role === true && <Crown className="h-4 w-4 text-yellow-500" />}
                      {isFacilitator && participant.role !== true && (
                        <UserCheck className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
                {participants.length === 0 && <p className="text-gray-500 text-center py-4">No participants yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>{isFacilitator ? "Facilitator Controls" : "Waiting for Facilitator"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFacilitator ? (
                <>
                  <p className="text-sm text-gray-600">
                    You are the facilitator of this retrospective. Share the link with your team and start when everyone
                    has joined.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => setShowShareModal(true)} variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Invite Link
                    </Button>
                    <Button
                      onClick={() => setShowStartConfirm(true)}
                      className="w-full"
                      disabled={participants.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Retrospective
                    </Button>
                  </div>
                  {participants.length === 0 && (
                    <p className="text-sm text-amber-600">Share the link to get participants to join first.</p>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Instant Join:</strong> When team members click the shared link, they'll automatically become participants.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Waiting for <strong>{facilitator?.name}</strong> to start the retrospective...
                  </p>
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                  </div>
                  {userName && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Participating as:</strong> {userName}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals - Only show if auto-join failed */}
     

      <ShareLinkModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} shareUrl={shareUrl} />
      
      <TransferFacilitatorModal
  isOpen={showTransferModal}
  onClose={() => {
    setShowTransferModal(false)
    setSelectedParticipantForTransfer(null)
  }}
  participants={participants}
  currentFacilitator={facilitator || null}
  selectedParticipant={selectedParticipantForTransfer}
  retroId={retroId}
  onTransferSuccess={() => {
    fetchLobbyData()
    setSelectedParticipantForTransfer(null)

    // Update localStorage if current user is the new facilitator
    const newFacilitator = participants.find(p => p.role === true)
    if (newFacilitator && newFacilitator.name === userName) {
      localStorage.setItem(`retro_${retroId}_role`, true)
      setUserRole(true)
    }
  }}
/>


      {/* Start Confirmation Modal */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Start Retrospective?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to start the retrospective? All participants will be moved to the retro board.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowStartConfirm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleStartRetro} className="flex-1">
                  Start Retro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
