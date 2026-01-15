"use client"

import { useEffect, useState } from "react"
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
      setPile(game.pile)
      setTurn(game.turn)
      setLog(game.log)
      setLastClaim(game.lastClaim ?? null)
      setIsReady(true)
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
    !!lastClaim && // a claim exists
    lastClaim.player !== playerIndex && // not your own claim
    isMyTurn // only active player can check

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
      <div className=" mt-6 mt-32">
        <h2 className="text-xl font-semibold mb-2">
          {isMyTurn ? "Your Hand" : `${currentPlayer.name}'s Hand`}
        </h2>

        {isMyTurn ? (
  <PlayerHand cards={getUniqueHand(me.hand)} />
) : (
          <div className="flex gap-2 mt-2">
            {Array.from({ length: currentPlayer.hand.length }).map((_, i) => (
              <div
                key={i}
                className="w-10 h-14 bg-gray-800 rounded text-white flex items-center justify-center"
              >
                🂠
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="relative flex">
      <ActionPanel
        onPass={pass}
        onPlayCards={playCards}
        onCheck={check}
        canCheck={canCheck}
        isCurrentPlayer={isMyTurn}
        playerHand={me.hand}
      />
      </div>
    </div>
  )
}
