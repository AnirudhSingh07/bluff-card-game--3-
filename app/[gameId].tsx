import { useRouter } from "next/router"
import PlayerHand from "@/components/player-hand"
import ActionPanel from "@/components/action-panel"
import { useGame } from "@/hooks/useGame"

export default function GamePage() {
  const router = useRouter()
  const { gameId } = router.query as { gameId: string }

  const playerName = prompt("Enter your name") || `Player${Math.floor(Math.random() * 100)}`
  const { game, playCards, passTurn } = useGame(gameId, playerName)

  const currentPlayer = game?.players[game?.currentTurn]
  const isCurrentPlayer = currentPlayer?.id === game?.players.find((p:any)=>p.id===currentPlayer?.id)?.id

  const playerHand = game?.players.find((p:any) => p.id === currentPlayer?.id)?.hand || []

  return (
    <div className="w-full h-screen flex flex-col justify-end items-center">
      {game?.players.map((p:any) => (
        <p key={p.id}>{p.name}: {p.hand.length} cards</p>
      ))}

      <PlayerHand cards={playerHand} selectable={isCurrentPlayer} />

      <ActionPanel
        onPass={passTurn}
        onPlayCards={(count, cardType, selectedCards) => playCards(selectedCards)}
        onCheck={() => {}}
        canCheck={true}
        isCurrentPlayer={isCurrentPlayer}
        playerHand={playerHand}
      />

      <div className="mt-4 text-gray-700">
        Share this link with friends:{" "}
        <span className="text-blue-600 underline">{typeof window !== "undefined" && window.location.href}</span>
      </div>
    </div>
  )
}
