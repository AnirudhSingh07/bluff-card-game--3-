"use client"

import { Card } from "@/components/ui/card"

interface PlayersStatusProps {
  players: {
    id: string
    name: string
    hand: string[]
    isActive: boolean
  }[]
  currentIndex: number
}

export default function PlayersStatus({ players, currentIndex }: PlayersStatusProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap mb-4">
      {players.map((player, i) => (
        <Card
          key={player.id}
          className={`px-4 py-2 border-2 ${
            i === currentIndex ? "border-blue-500" : "border-slate-400"
          } bg-black text-white text-center min-w-[120px]`}
        >
          <p className="font-semibold">{player.name}</p>
          <p className="text-sm text-slate-300">{player.hand.length} cards</p>
          {!player.isActive && <p className="text-xs text-red-500">Out</p>}
        </Card>
      ))}
    </div>
  )
}
