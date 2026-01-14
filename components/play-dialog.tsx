"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PlayerHand from "./player-hand"

interface PlayDialogProps {
  playerHand: string[]
  onSubmit: (count: number, cardType: string, selectedCards: string[]) => void
  onClose: () => void
}

const CARD_TYPES = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]

export default function PlayDialog({ playerHand, onSubmit, onClose }: PlayDialogProps) {
  const [count, setCount] = useState(1)
  const [cardType, setCardType] = useState("A")
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const toggleSelectCard = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId) ? prev.filter(c => c !== cardId) : prev.length < count ? [...prev, cardId] : prev,
    )
  }

  const handleSubmit = () => {
    if (selectedCards.length !== count) return
    const cardsToPlay = selectedCards.map(id => id.split("-")[0])
    onSubmit(count, cardType, cardsToPlay)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-xl max-h-screen overflow-y-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-800">Make Your Claim</h2>

        {/* Count selection */}
        <div className="flex gap-2 justify-center flex-wrap">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <Button
              key={n}
              variant={count === n ? "default" : "outline"}
              onClick={() => {
                setCount(n)
                setSelectedCards([])
              }}
            >
              {n}
            </Button>
          ))}
        </div>

        {/* Card type selection */}
        <div className="grid grid-cols-7 gap-2">
          {CARD_TYPES.map(type => (
            <Button
              key={type}
              variant={cardType === type ? "default" : "outline"}
              onClick={() => setCardType(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Player hand */}
        <PlayerHand
          cards={playerHand}
          selectedCards={selectedCards}
          onSelectCard={toggleSelectCard}
          selectable={true}
        />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedCards.length !== count}>
            Submit Claim
          </Button>
        </div>
      </Card>
    </div>
  )
}
