"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GameSetup from "@/components/game-setup"

export default function HomePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<{ playerNames: string[] }>({ playerNames: [] })

  const handleStartGame = (playerNames: string[]) => {
    setSettings({ playerNames })
    // Generate private game link
    const gameId = Math.random().toString(36).substring(2, 10)
    router.push(`/game/${gameId}?players=${playerNames.join(",")}`)
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-3xl font-bold">Multiplayer Card Game</h1>
      <GameSetup onStartGame={handleStartGame} />
      <p className="text-sm text-gray-500">Share the link with friends to join</p>
    </div>
  )
}
