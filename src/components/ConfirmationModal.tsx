"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  fileName: string | undefined
  isLoading: boolean
  capIdData: { capId: string; allowlistObjectId: string } | null
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  fileName,
  isLoading,
  capIdData,
}) => {
  const [showPayload, setShowPayload] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [buttonEnabled, setButtonEnabled] = useState(false)

  useEffect(() => {
    // Reset countdown and show payload when modal opens
    if (isOpen) {
      setCountdown(50)
      setButtonEnabled(false)

      // Start countdown timer
      const intervalId = setInterval(() => {
        setCountdown((prevCount) => {
          
          if (prevCount <= 1) {
            clearInterval(intervalId)
            setButtonEnabled(true)
            return 0
          }
          return prevCount - 1
        })
        
      }, 1000)

      // Clean up interval on unmount or when modal closes
      return () => clearInterval(intervalId)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Document Upload
          </DialogTitle>
          <DialogDescription>
            Allowlist has been created. You are about to upload and register your document on the Sui blockchain. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium">Document Details:</p>
            <ul className="mt-2 text-sm">
              <li>
                <span className="font-medium">Title:</span> {title}
              </li>
              <li>
                <span className="font-medium">File:</span> {fileName || "No file selected"}
              </li>
            </ul>
          </div>

          {/* Transaction Payload Section */}
          <div className="rounded-md border border-muted p-3">
            <button
              type="button"
              onClick={() => setShowPayload(!showPayload)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              <span>Transaction Payload</span>
              {showPayload ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <div
              className={cn(
                "mt-2 overflow-hidden transition-all duration-300 ease-in-out",
                showPayload ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {capIdData ? (
                <div className="space-y-2 text-xs">
                  <div className="rounded bg-slate-100 p-2 font-mono">
                    <p className="mb-1 text-slate-500">Cap ID:</p>
                    <p className="break-all">{capIdData.capId}</p>
                  </div>
                  <div className="rounded bg-slate-100 p-2 font-mono">
                    <p className="mb-1 text-slate-500">Allowlist Object ID:</p>
                    <p className="break-all">{capIdData.allowlistObjectId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    These IDs will be used in the upcoming transaction to register your document on the blockchain.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transaction data available.</p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This will create a blockchain transaction that requires gas fees. Please make sure all details are correct
            before proceeding.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-sui-teal hover:bg-sui-teal/90"
            disabled={isLoading || !buttonEnabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !buttonEnabled ? (
              `Wait (${countdown}s)`
            ) : (
              "Confirm Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationModal
