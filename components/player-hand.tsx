"use client"

import { Card } from "@/components/ui/card"

interface PlayerHandProps {
  cards: string[]
  selectable?: boolean
  selectedCards?: string[]
  onSelectCard?: (cardId: string) => void
}

export default function PlayerHand({
  cards,
  selectable = false,
  selectedCards = [],
  onSelectCard,
}: PlayerHandProps) {
  //new
  const getCardColor = (card: string) => {
    if (card.includes("♥") || card.includes("♦")) return "text-red-600"
    if (card.includes("♠") || card.includes("♣")) return "text-black"
    return "text-yellow-800"
  }
  const totalCards = cards.length
  const radius = 180 // radius of circular arc
  const maxFanAngle = 90 // degrees covered by the entire hand
  return (
    <div className="flex gap-2 h-20 flex-wrap mt-2">
      {cards.map((card, index) => {
        const cardId = `${card}-${index}` // unique ID
        const isSelected = selectedCards.includes(cardId)

        //new
          const suit = card.slice(-1)
          const rank = card.slice(0, -1)
          const colorClass = getCardColor(card)
          // Calculate angle for circular fan
          const middleIndex = (totalCards - 1) / 2
          const angle = ((index - middleIndex) * maxFanAngle) / (middleIndex || 1) // degrees

          const rad = (angle * Math.PI) / 270
          const x = radius * Math.sin(rad)
          const y = radius * (1 - Math.cos(rad)) // upward curve

//new
        return (
          
          

          
          <div
  key={cardId}
  onClick={() => selectable && onSelectCard && onSelectCard(cardId)}
  className={`absolute transition-all h-48 justify-center transform ${
    isSelected ? "hover:scale-105" : ""
  }`}
  style={{
    left: "50%",
    bottom: "5vh", // responsive vertical positioning
    transform: `
      translateX(-50%)
      translate(${x}px, ${y}px)
      rotate(${angle}deg)
      ${isSelected ? "translateY(-20px) scale(1.1)" : ""}
    `,
  }}
>


            <Card className={`relative w-28 h-40 mb-32 bg-white rounded-xl shadow-md border border-gray-400 flex items-center justify-center`}
              >{/* Top-left */}
                <div className={`absolute top-1 left-1 flex flex-col items-start ${colorClass}`}>
                  <span className="text-sm font-bold">{rank}</span>
                  <span className="text-sm">{suit}</span>
                </div>

                {/* Bottom-right */}
                <div className={`absolute bottom-1 right-1 flex flex-col items-end rotate-180 ${colorClass}`}>
                  <span className="text-sm font-bold">{rank}</span>
                  <span className="text-sm">{suit}</span>
                </div>

                {/* Center */}
                <div className={`text-4xl ${colorClass}`}>{suit}</div></Card>
            {/* {card} */}
          </div>
          
        )
      })}
    </div>
    
  )
}
