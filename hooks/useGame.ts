import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket

export const useGame = (gameId: string, playerName: string) => {
  const [game, setGame] = useState<any>(null)

  useEffect(() => {
    socket = io("http://localhost:3001") // Change to prod URL later
    socket.emit("join_game", { gameId, playerName })

    socket.on("game_update", (data) => setGame(data))

    return () => {
      socket.disconnect()
    }
  }, [gameId, playerName])

  const playCards = (cards: string[]) => {
    socket.emit("play_cards", { gameId, cards })
  }

  const passTurn = () => {
    socket.emit("pass_turn", { gameId })
  }

  return { game, playCards, passTurn }
}
