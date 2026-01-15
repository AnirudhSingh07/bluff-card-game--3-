"use client"

import { useState } from "react"

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([""])

  const handleChange = (index: number, value: string) => {
    const names = [...playerNames]
    names[index] = value
    setPlayerNames(names)
  }

  const addPlayer = () => setPlayerNames([...playerNames, ""])

  const handleSubmit = () => {
    const names = playerNames.filter((n) => n.trim() !== "")
    if (names.length === 0) return alert("Enter at least 1 player")
    onStartGame(names)
  }

  return (
    <div className="flex flex-col gap-2">
      {playerNames.map((name, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Player ${index + 1}`}
          value={name}
          onChange={(e) => handleChange(index, e.target.value)}
          className="border px-2 py-1 rounded w-48"
        />
      ))}
      <div className="flex gap-2 mt-2">
        <button onClick={addPlayer} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Add Player
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Game
        </button>
      </div>
    </div>
  )
}
