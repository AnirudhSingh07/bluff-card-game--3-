"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSocket } from "@/lib/socket"

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [players, setPlayers] = useState(2)

  const createGame = () => {
    if (!name) return alert("Enter your name")

    const socket = getSocket()
    if (!socket.connected) socket.connect()

    socket.emit("create-game", { playerName: name, maxPlayers: players })

    socket.once("game-created", ({ gameId }) => {
      router.push(`/game/${gameId}?name=${encodeURIComponent(name)}&creator=true`)
    })
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">Create Game</h1>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <select
        value={players}
        onChange={(e) => setPlayers(Number(e.target.value))}
        className="border p-2"
      >
        {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} Players</option>)}
      </select>

      <button
        onClick={createGame}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Create Game
      </button>
    </div>
  )
}
