"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PlayDialog from "./play-dialog"

interface LastClaim {
  player: number
  count: number
  type: string
}

interface ActionPanelProps {
  onPass: () => void
  onPlayCards: (count: number, cardType: string, selectedCards: string[]) => void
  onCheck: () => void
  canCheck: boolean
  isCurrentPlayer: boolean
  playerHand: string[]
  gameLog: string[]
  lastClaim: LastClaim | null
}

export default function ActionPanel({
  onPass,
  onPlayCards,
  onCheck,
  canCheck,
  isCurrentPlayer,
  playerHand,
  gameLog,
  lastClaim,
}: ActionPanelProps) {
  const [showPlayDialog, setShowPlayDialog] = useState(false)

  if (!isCurrentPlayer) return null

  return (
    <div className="flex justify-center">
      <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl px-2 py-2 rounded-4xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3">

          {/* PASS */}
          <Button
            onClick={onPass}
            className="h-10 w-10 rounded-full bg-black hover:bg-green-800 text-white text-xs font-semibold shadow-lg active:scale-95 transition"
          >
            Pass
          </Button>

          {/* PLAY */}
          <Button
            onClick={() => setShowPlayDialog(true)}
            className="h-10 w-10 rounded-full bg-black hover:bg-yellow-500 text-white text-xs font-semibold shadow-lg active:scale-95 transition"
          >
            Play
          </Button>

          {/* CHECK */}
          <Button
            onClick={onCheck}
            disabled={!canCheck}
            className={`h-10 w-10 rounded-full text-xs font-semibold shadow-lg transition active:scale-95
              ${
                canCheck
                  ? "bg-black hover:bg-red-500 text-white"
                  : "bg-black text-red-50 cursor-not-allowed"
              }`}
          >
            Check
          </Button>

        </div>
      </Card>

      {showPlayDialog && (
        <PlayDialog
          playerHand={playerHand}
          log={gameLog}
          lastClaim={lastClaim}
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
