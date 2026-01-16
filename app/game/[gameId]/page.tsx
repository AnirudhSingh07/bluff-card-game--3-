"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/app/socket";
import GameBoard from "@/components/game-board";

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();

  // 🔐 Player identity comes from playerCode (not index)
  const playerCode = searchParams.get("playerCode");

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

  // 🔎 Derive playerIndex from playerCode (NO LOGIC CHANGE)
  const playerIndex = useMemo(() => {
    if (!game || !playerCode) return -1;

    return game.players.findIndex(
      (p: any) => p.playerCode === playerCode
    );
  }, [game, playerCode]);

  // 🚫 Invalid / tampered link
  if (playerIndex === -1) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-red-500">
        Invalid or unauthorized player link
      </div>
    );
  }

  if (!game) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading game…
      </div>
    );
  }

  return (
    <GameBoard
      gameId={gameId}
      players={game.players.map((p: any) => p.name)}
      playerIndex={playerIndex} // ✅ unchanged for GameBoard
      socket={socket}
    />
  );
}
