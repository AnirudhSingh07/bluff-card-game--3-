"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/app/socket";
import GameBoard from "@/components/game-board";

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const playerIndex = Number(searchParams.get("playerIndex") || 0);

  const [game, setGame] = useState<any>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Request current game state when joining
    socket.emit("get-game-state", { gameId });

    socket.on("game-updated", (data: any) => setGame(data));
    socket.on("game-state", (data: any) => setGame(data));

    return () => {
      socket.off("game-updated");
      socket.off("game-state");
    };
  }, [socket, gameId]);

  if (!game) {
    return <div className="h-screen flex items-center justify-center text-xl">Loading game…</div>;
  }

  return (
    <GameBoard
      gameId={gameId}
      players={game.players.map((p: any) => p.name)}
      playerIndex={playerIndex}
      socket={socket}
    />
  );
}
