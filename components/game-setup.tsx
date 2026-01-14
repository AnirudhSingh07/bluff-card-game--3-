"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>(Array(2).fill(""))

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count)
    setPlayerNames(Array(count).fill(""))
  }

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  const handleStart = () => {
    const names = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`)
    onStartGame(names)
  }

  const isReady = playerNames.every((name) => name.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-emerald-700">Card Bluff</CardTitle>
          <CardDescription className="text-base mt-2">Bluff your way to victory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Count Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Number of Players: {playerCount}</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? "default" : "outline"}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`flex-1 ${
                    playerCount === count ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-slate-700"
                  }`}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Player Names Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Player Names</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playerNames.map((name, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="border-slate-300 text-slate-700 placeholder:text-slate-400"
                />
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!isReady}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
