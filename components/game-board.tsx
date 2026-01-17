"use client"

import { useEffect, useState, useRef } from "react"
import PlayerHand from "./player-hand"
import PlayersStatus from "./players-status"
import GameLog from "./game-log"
import ActionPanel from "./action-panel"

interface Player {
  id: string
  name: string
  hand: string[]
  isActive?: boolean
}

interface LastClaim {
  player: number
  count: number
  type: string
}

interface GameBoardProps {
  players: string[]
  playerIndex: number
  socket: any
  gameId: string
}

export default function GameBoard({
  players,
  playerIndex,
  socket,
  gameId,
}: GameBoardProps) {
  const [playersState, setPlayersState] = useState<Player[]>([])
  const [pile, setPile] = useState<string[]>([])
  const [turn, setTurn] = useState<number>(0)
  const [log, setLog] = useState<string[]>([])
  const [lastClaim, setLastClaim] = useState<LastClaim | null>(null)
  const [isReady, setIsReady] = useState(false)

  // 🔥 Track previous pile size to detect round reset
  const prevPileSize = useRef(0)

  //UniqueHand
  const getUniqueHand = (hand: string[]) => {
    const seen = new Set<string>()
    return hand.filter(card => {
      if (seen.has(card)) return false
      seen.add(card)
      return true
    })
  }

  /* =======================
     SERVER → CLIENT SYNC
     ======================= */
  useEffect(() => {
    socket.emit("get-game-state", { gameId })

    const onGameUpdated = (game: any) => {
      setPlayersState(game.players)
      setTurn(game.turn)
      setLog(game.log)
      setLastClaim(game.lastClaim ?? null)
      setIsReady(true)

      /* =========================================
         🧠 ROUND RESET DETECTION
         If everyone passed:
         - server clears lastClaim
         - server clears pile
      ========================================== */
      if (prevPileSize.current > 0 && game.lastClaim === null && game.pile.length === 0) {
        setPile([]) // clear pile locally
      } else {
        setPile(game.pile)
      }

      prevPileSize.current = game.pile.length
    }

    socket.on("game-updated", onGameUpdated)

    return () => {
      socket.off("game-updated", onGameUpdated)
    }
  }, [socket, gameId])

  if (!isReady || playersState.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading game…
      </div>
    )
  }

  const me = playersState[playerIndex]
  const currentPlayer = playersState[turn]

  /* =======================
     VALIDATION HELPERS
     ======================= */

  const isMyTurn = turn === playerIndex

  const canCheck =
    !!lastClaim &&
    lastClaim.player !== playerIndex &&
    isMyTurn

  /* =======================
     ACTIONS (SOCKET SAFE)
     ======================= */

  const playCards = (
    count: number,
    type: string,
    selected: string[]
  ) => {
    if (!isMyTurn) return
    if (!selected || selected.length !== count) return

    socket.emit("play-cards", {
      gameId,
      playerIndex,
      selected,
      count,
      type,
    })
  }

  const pass = () => {
    if (!isMyTurn) return

    socket.emit("pass", {
      gameId,
      playerIndex,
    })
  }

  const check = () => {
    if (!canCheck) return

    socket.emit("check", {
      gameId,
    })
  }

  /* =======================
     UI
     ======================= */

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-5xl text-center text-blue-500 mb-6">Bluff</h1>

      <PlayersStatus players={playersState} currentIndex={turn} />

      {/* PILE INFO */}
      <div className="border p-4 mt-4 rounded bg-slate-100">
        <p className="font-semibold">Pile: {pile.length} cards</p>

        {lastClaim ? (
          <p className="mt-1">
            <span className="font-semibold">
              {playersState[lastClaim.player].name}
            </span>{" "}
            claims{" "}
            <span className="font-semibold">
              {lastClaim.count} × {lastClaim.type}
            </span>
          </p>
        ) : (
          <p className="italic text-slate-500">No active claim</p>
        )}
      </div>

      <GameLog log={log} />

      {/* HAND VIEW */}
      <div className="mt-6 mt-32">
        <h2 className="text-xl font-semibold mb-2">
          Your Hand
        </h2>
        <PlayerHand cards={getUniqueHand(me.hand)} />
      </div>

      {/* ACTIONS */}
      <div className="relative flex">
        <ActionPanel
          onPass={pass}
          gameLog={log}
          onPlayCards={playCards}
          onCheck={check}
          canCheck={canCheck}
          isCurrentPlayer={isMyTurn}
          playerHand={me.hand}
          lastClaim={lastClaim}
        />
      </div>
    </div>
  )
}
