"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import PlayerHand from "./player-hand"
import PlayersStatus from "./players-status"
import GameLog from "./game-log"
import ActionPanel from "./action-panel"

/* ========== CARD ENGINE ========== */
const SUITS = ["♠", "♥", "♦", "♣"]
const VALUES = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]

const createDeck = () => {
  const deck: string[] = []
  for (const s of SUITS) {
    for (const v of VALUES) {
      deck.push(`${v}${s}`)
    }
  }
  return deck
}

const shuffle = (deck: string[]) => [...deck].sort(() => Math.random() - 0.5)

/* Deal all cards equally */
const deal = (players: string[]) => {
  const deck = shuffle(createDeck())
  const hands: string[][] = players.map(() => [])
  deck.forEach((card, i) => {
    hands[i % players.length].push(card)
  })
  return players.map((name, i) => ({
    id: "p" + i,
    name,
    hand: hands[i],
    isActive: true,
  }))
}

/* ========== GAMEBOARD COMPONENT ========== */
export default function GameBoard({ players }: { players: string[] }) {
  const [playersState, setPlayers] = useState(() => deal(players))
  const [pile, setPile] = useState<string[]>([])
  const [turn, setTurn] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [lastClaim, setLastClaim] = useState<{
    player: number
    count: number
    type: string
    cards: string[]
  } | null>(null)

  /* ========== TURN ROTATION ========== */
  const nextTurn = () => {
    let i = turn
    do {
      i = (i + 1) % playersState.length
    } while (!playersState[i].isActive)
    setTurn(i)
  }

  /* ========== PLAY CARDS ========== */
  const playCards = (count: number, type: string, selected: string[]) => {
    if (selected.length !== count) return

    const p = playersState.map(pl => ({ ...pl, hand: [...pl.hand] }))
    const player = p[turn]

    // remove cards from player's hand
    player.hand = player.hand.filter(c => !selected.includes(c))

    // move cards to pile
    setPile(prev => [...prev, ...selected])

    setLastClaim({ player: turn, count, type, cards: selected })
    setPlayers(p)
    setLog(l => [...l, `${player.name} claims ${count}x ${type}`])
    nextTurn()
  }

  /* ========== CHECK (CALL BLUFF) ========== */
  const check = () => {
    if (!lastClaim) return

    const { player: lastPlayerIndex, type, cards } = lastClaim
    const p = playersState.map(pl => ({ ...pl, hand: [...pl.hand] }))
    const liar = p[lastPlayerIndex]
    const checker = p[turn]

    const pileCopy = [...pile]

    const lied = cards.some(c => {
      const value = c.slice(0, -1)
      return value !== type
    })

    if (lied) {
      liar.hand.push(...pileCopy)
      setLog(l => [...l, `${checker.name} caught ${liar.name} lying! ${liar.name} takes all pile cards.`])
    } else {
      checker.hand.push(...pileCopy)
      setLog(l => [...l, `${checker.name} was wrong. ${liar.name} was honest. ${checker.name} takes all pile cards.`])
    }

    setPile([])
    setLastClaim(null)
    setPlayers(p)
    nextTurn()
  }

  const pass = () => nextTurn()

  const current = playersState[turn]

  return (
    <div className="min-h-screen ">
      <h1 className="text-5xl font-extralight text-center text-blue-500 mb-6"> Web3 Bluff</h1>

      <PlayersStatus players={playersState} currentIndex={turn} />

      <Card className="  text-center p-4 mt-4">
        <p>Pile: {pile.length} cards</p>
        {lastClaim && (
          <p>
            {playersState[lastClaim.player].name} claims {lastClaim.count}x {lastClaim.type}
          </p>
        )}
      </Card>

      <GameLog log={log} />

      <div className="mt-6">
        <h2 className="text-xl">{current.name}'s Hand</h2>
        <PlayerHand cards={current.hand} />
      </div>

      <ActionPanel
        onPass={pass}
        onPlayCards={playCards}
        onCheck={check}
        canCheck={!!lastClaim}
        isCurrentPlayer={true}
        playerHand={current.hand}
      />
    </div>
  )
}
