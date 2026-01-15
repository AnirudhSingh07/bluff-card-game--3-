"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PlayDialog from "./play-dialog"

interface ActionPanelProps {
  onPass: () => void
  onPlayCards: (count: number, cardType: string, selectedCards: string[]) => void
  onCheck: () => void
  canCheck: boolean
  isCurrentPlayer: boolean
  playerHand: string[]
  gameLog: string[]   // 👈 ADD THIS
}

export default function ActionPanel({
  onPass,
  onPlayCards,
  onCheck,
  canCheck,
  isCurrentPlayer,
  playerHand,
  gameLog,          // 👈 ADD THIS
}: ActionPanelProps) {
  const [showPlayDialog, setShowPlayDialog] = useState(false)

  if (!isCurrentPlayer) return null

  return (
    <div className="mt-5 flex justify-center">
      <Card className="border border-black w-80 align-middle items-center bg-gray-800">
        <div className="flex gap-4 flex-wrap justify-center">
          {/* Pass Button */}
          <Button
            onClick={onPass}
            className="min-w-32 text-white hover:bg-green-700 bg-green-800"
          >
            Pass
          </Button>

          {/* Play Button */}
          <Button
            onClick={() => setShowPlayDialog(true)}
            className="min-w-32 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Play
          </Button>

          {/* Check Button */}
          <Button
            onClick={onCheck}
            disabled={!canCheck}
            className={`min-w-32 ${
              canCheck
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-300 text-red-50 cursor-not-allowed"
            }`}
          >
            Check
          </Button>
        </div>
      </Card>

      {/* Play Dialog */}
      {showPlayDialog && (
        <PlayDialog
          playerHand={playerHand}
          log={gameLog}   // 👈 PASS LOG HERE
          onSubmit={(count, type, selected) => {
            onPlayCards(count, type, selected)
            setShowPlayDialog(false)
          }}
          onClose={() => setShowPlayDialog(false)}
        />
      )}
    </div>
  )
}
