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

  const prevPileSize = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)

  const getUniqueHand = (hand: string[]) => {
    const seen = new Set<string>()
    return hand.filter(card => {
      if (seen.has(card)) return false
      seen.add(card)
      return true
    })
  }

  useEffect(() => {
    socket.emit("get-game-state", { gameId })

    const onGameUpdated = (game: any) => {
      setPlayersState(game.players)
      setTurn(game.turn)
      setLog(game.log)
      setLastClaim(game.lastClaim ?? null)
      setIsReady(true)

      if (prevPileSize.current > 0 && game.lastClaim === null && game.pile.length === 0) {
        setPile([])
      } else {
        setPile(game.pile)
      }

      prevPileSize.current = game.pile.length
    }

    socket.on("game-updated", onGameUpdated)
    return () => socket.off("game-updated", onGameUpdated)
  }, [socket, gameId])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  if (!isReady || playersState.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-lg sm:text-xl">
        Loading game…
      </div>
    )
  }

  const me = playersState[playerIndex]
  const isMyTurn = turn === playerIndex

  const canCheck =
    !!lastClaim &&
    lastClaim.player !== playerIndex &&
    isMyTurn

  const playCards = (count: number, type: string, selected: string[]) => {
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
    socket.emit("pass", { gameId, playerIndex })
  }

  const check = () => {
    if (!canCheck) return
    socket.emit("check", { gameId })
  }

  const getSeatStyle = (seatOrder: number, totalOpponents: number) => {
    const radiusX = playersState.length <= 3 ? 35 : playersState.length <= 6 ? 40 : 45
    const radiusY = 32

    const startAngle = Math.PI
    const endAngle = 2 * Math.PI
    const angleStep = (endAngle - startAngle) / (totalOpponents - 1 || 1)
    const angle = startAngle + seatOrder * angleStep

    const x = Math.cos(angle) * radiusX
    const y = Math.sin(angle) * radiusY

    return {
      left: `calc(50% + ${x}%)`,
      top: `calc(50% + ${y}%)`,
      transform: "translate(-50%, -50%)",
    }
  }

  const tableShape =
    playersState.length <= 3
      ? "rounded-[40%]"
      : playersState.length <= 6
      ? "rounded-[48%]"
      : "rounded-[55%]"

  const opponents = playersState.filter((_, i) => i !== playerIndex)

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-900 to-green-950 text-white px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col relative overflow-x-hidden">

      {/* FLOATING GAME LOG */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-44 sm:w-64 md:w-80 z-50">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-xl p-2 sm:p-3">
          <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-white/90">Game Log</h3>
          <div ref={logRef} className="max-h-[90px] sm:max-h-[120px] overflow-y-auto space-y-1 pr-1">
            {log.map((entry, i) => (
              <div key={i} className="text-[10px] sm:text-[11px] leading-tight bg-black/30 px-2 py-1 rounded">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h1 className="text-xl sm:text-3xl md:text-5xl text-center font-bold mb-2 sm:mb-3 tracking-wider">
        Bluff Table
      </h1>

      <div className="flex-1 flex items-center justify-center relative">

        <div
          className={`relative w-full max-w-[1000px] aspect-[9/5] sm:aspect-[16/9] bg-green-800 ${tableShape} border-[5px] sm:border-[8px] border-yellow-900 shadow-2xl`}
        >
          <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]" />

          {/* CENTER PILE */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-200 mb-1">
              Pile: {pile.length} cards
            </p>

            <div className="relative w-10 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28">
              {pile.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full bg-white rounded-lg border shadow-md"
                  style={{ top: i * 2, left: i * 2, transform: `rotate(${i * 2}deg)` }}
                />
              ))}
            </div>

            {lastClaim && (
              <p className="mt-2 text-[10px] sm:text-xs md:text-sm">
                {playersState[lastClaim.player].name} played {lastClaim.count} × {lastClaim.type}
              </p>
            )}
          </div>

          {/* OPPONENTS */}
          {opponents.map((player, i) => (
            <div key={player.id} className="absolute flex flex-col items-center gap-1" style={getSeatStyle(i, opponents.length)}>
              <div className={`px-2 py-1 rounded-lg text-[9px] sm:text-xs ${turn === playersState.indexOf(player) ? "bg-yellow-500 text-black font-bold" : "bg-black/60"}`}>
                {player.name}
              </div>

              <div className="relative w-8 h-12 sm:w-12 sm:h-16 md:w-14 md:h-20">
                {Array.from({ length: Math.min(player.hand.length, 20) }).map((_, c) => (
                  <div
                    key={c}
                    className="absolute w-full h-full rounded-lg border border-black shadow-md"
                    style={{
                      left: c * 5,
                      background: "linear-gradient(135deg,#111 25%,#222 25%,#222 50%,#111 50%,#111 75%,#222 75%,#222 100%)",
                      backgroundSize: "12px 12px"
                    }}
                  />
                ))}
              </div>
              
        

              <span className="text-[9px] opacity-70">{player.hand.length} cards</span>

            </div>

            
          ))}
             

        </div>
      </div>

      {/* YOUR HAND */}
      {/* <div className="mt-2 sm:mt-4">
        
        <div className="overflow-x-auto  pb-1">
          <PlayerHand cards={getUniqueHand(me.hand)} />
        </div>
      </div> */}
      <div className="  scale-75 ">
  <PlayerHand cards={getUniqueHand(me.hand)} />
</div>

      {/* ACTIONS */}
      <div className="mt-2 sm:mt-4 flex justify-center">
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
