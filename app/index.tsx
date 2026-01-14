import { useRouter } from "next/router"

export default function HomePage() {
  const router = useRouter()

  const createGame = () => {
    const gameId = Math.random().toString(36).substring(2, 10) // private room
    router.push(`/game/${gameId}`)
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="text-3xl font-bold">Multiplayer Card Game</h1>
      <button
        onClick={createGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        Create Private Game
      </button>
      <p className="text-sm text-gray-500">Share the link with friends to join</p>
    </div>
  )
}
