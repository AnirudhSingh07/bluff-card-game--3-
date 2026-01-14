import { createServer } from "http"
import { Server } from "socket.io"

interface Player {
  id: string
  name: string
  hand: string[]
}

interface Game {
  players: Player[]
  deck: string[]
  currentTurn: number
}

const games: Record<string, Game> = {}

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: "*" }, // Dev only, restrict in production
})

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id)

  socket.on("join_game", ({ gameId, playerName }: { gameId: string; playerName: string }) => {
    socket.join(gameId)
    if (!games[gameId]) {
      games[gameId] = { players: [], deck: [], currentTurn: 0 }
    }
    games[gameId].players.push({ id: socket.id, name: playerName, hand: [] })
    io.to(gameId).emit("game_update", games[gameId])
  })

  socket.on("play_cards", ({ gameId, cards }: { gameId: string; cards: string[] }) => {
    const game = games[gameId]
    const player = game.players.find((p) => p.id === socket.id)
    if (!player) return

    player.hand = player.hand.filter((c) => !cards.includes(c))
    game.currentTurn = (game.currentTurn + 1) % game.players.length

    io.to(gameId).emit("game_update", game)
  })

  socket.on("pass_turn", ({ gameId }: { gameId: string }) => {
    const game = games[gameId]
    game.currentTurn = (game.currentTurn + 1) % game.players.length
    io.to(gameId).emit("game_update", game)
  })

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id)
    for (const gameId in games) {
      games[gameId].players = games[gameId].players.filter((p) => p.id !== socket.id)
      io.to(gameId).emit("game_update", games[gameId])
    }
  })
})

httpServer.listen(3001, () => console.log("Socket.IO server running on port 3001"))
