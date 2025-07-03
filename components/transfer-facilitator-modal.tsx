"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users } from "lucide-react"

interface Participant {
  id: string
  name: string
  role: string
  user_id?: string
  joined_at: string
}

interface TransferFacilitatorModalProps {
  isOpen: boolean
  onClose: () => void
  participants: Participant[]
  currentFacilitator: Participant | null
  selectedParticipant?: Participant | null
  retroId: string
  onTransferSuccess: () => void
}

export function TransferFacilitatorModal({
  isOpen,
  onClose,
  participants,
  currentFacilitator,
  selectedParticipant,
  retroId,
  onTransferSuccess
}: TransferFacilitatorModalProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("")
  const [isTransferring, setIsTransferring] = useState(false)
  const { toast } = useToast()

  // Set selected participant when modal opens
  useEffect(() => {
    if (isOpen && selectedParticipant) {
      setSelectedParticipantId(selectedParticipant.id)
    } else if (!isOpen) {
      setSelectedParticipantId("")
    }
  }, [isOpen, selectedParticipant])

  // Filter out current facilitator from the list
  const availableParticipants = participants.filter(
    participant => participant.id !== currentFacilitator?.id
  )

  const handleTransfer = async () => {
    if (!selectedParticipantId) {
      toast({
        title: "Error",
        description: "Please select a participant to transfer facilitator role to",
        variant: "destructive",
      })
      return
    }

    setIsTransferring(true)

    try {
      const response = await fetch(`/api/retros/${retroId}/transfer-facilitator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newFacilitatorId: selectedParticipantId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Success",
          description: `Facilitator role transferred to ${result.newFacilitator.name}`,
        })

        onTransferSuccess()
        onClose()
        setSelectedParticipantId("")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to transfer facilitator role",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Transfer facilitator error:", error)
      toast({
        title: "Error",
        description: "Failed to transfer facilitator role",
        variant: "destructive",
      })
    } finally {
      setIsTransferring(false)
    }
  }

  const handleClose = () => {
    if (!isTransferring) {
      setSelectedParticipantId("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Transfer Facilitator Role
          </DialogTitle>
          <DialogDescription>
            {selectedParticipant 
              ? `Transfer the facilitator role to ${selectedParticipant.name}?`
              : "Select a participant to transfer the facilitator role to. Only the current facilitator can perform this action."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Facilitator</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{currentFacilitator?.name}</p>
              <p className="text-sm text-gray-600">Role: Facilitator</p>
            </div>
          </div>

          {!selectedParticipant && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Facilitator</label>
              <Select
                value={selectedParticipantId}
                onValueChange={setSelectedParticipantId}
                disabled={isTransferring}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant..." />
                </SelectTrigger>
                <SelectContent>
                  {availableParticipants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      <div className="flex items-center gap-2">
                        <span>{participant.name}</span>
                        <span className="text-xs text-gray-500">
                          ({participant.role})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedParticipant && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Facilitator</label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-medium">{selectedParticipant.name}</p>
                <p className="text-sm text-blue-600">Will become facilitator</p>
              </div>
            </div>
          )}

          {selectedParticipantId && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Confirmation:</strong> You are about to transfer the facilitator role to{" "}
                <strong>
                  {selectedParticipant?.name || availableParticipants.find(p => p.id === selectedParticipantId)?.name}
                </strong>
                . This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedParticipantId || isTransferring}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 