"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSocket } from "@/app/socket";
import type { Game } from "@/types/game";
import GameBoard from "@/components/game-board";
import Lobby from "@/components/lobby";
import EndScreen from "@/components/end-screen";
import ReconnectingOverlay from "@/components/reconnecting-overlay";

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerCode = searchParams.get("playerCode");

  const [game, setGame] = useState<Game | null>(null);
  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (playerCode) {
      // Returning player — re-identify (handles refresh / cold load)
      socket.emit("reconnect-player", { gameId, playerCode });
    } else {
      // Guest opening an invite link — just fetch lobby state to show the game name/info
      socket.emit("get-game-state", { gameId });
    }

    const onGameUpdated = (data: Game) => setGame(data);
    socket.on("game-updated", onGameUpdated);

    return () => {
      socket.off("game-updated", onGameUpdated);
    };
  }, [socket, gameId, playerCode]);

  const playerIndex = useMemo(() => {
    if (!game || !playerCode) return -1;
    return game.players.findIndex((p) => p.playerCode === playerCode);
  }, [game, playerCode]);

  const isHost = useMemo(
    () => !!game && game.hostPlayerCode === playerCode,
    [game, playerCode]
  );

  // ── Guest join handler ──
  const handleJoin = () => {
    if (!joinName.trim()) return setJoinError("Enter your name");
    setJoinError(null);
    setJoining(true);

    socket.emit("join-game", { gameId, name: joinName.trim() });

    socket.once("joined-game", ({ gameId: gid, playerCode: code }: { gameId: string; playerCode: string }) => {
      setJoining(false);
      // Update URL with the new playerCode without triggering a full navigation
      router.replace(`/game/${gid}?playerCode=${code}`);
    });

    socket.once("error", (msg: string) => {
      setJoining(false);
      setJoinError(msg);
    });
  };

  // ── Loading ──
  if (!game) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a1418] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-gray-400">Loading game…</span>
        </div>
      </div>
    );
  }

  // ── Guest — show join form ──
  if (!playerCode || playerIndex === -1) {
    // Don't show join form if game is already in progress / ended
    const canJoin = game.status === "lobby" && game.players.length < game.maxPlayers;

    if (!canJoin) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#0a1418]">
          <div className="text-center space-y-2">
            <p className="text-4xl">🚫</p>
            <p className="text-white text-xl font-semibold">
              {game.status !== "lobby" ? "Game already started" : "Game is full"}
            </p>
            <p className="text-gray-500 text-sm">You can't join this game right now.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1418] via-[#121d2a] to-[#18243f]">
        <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

        <div className="relative z-10 w-full max-w-sm mx-4 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-white">🃏 Join Game</h1>
            <p className="text-gray-400 text-sm">
              Game <span className="font-mono text-yellow-400">{gameId}</span> ·{" "}
              {game.players.length}/{game.maxPlayers} players
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-300">Your Name</label>
            <input
              placeholder="Enter your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={20}
              autoFocus
              className="mt-1 w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {joinError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
              {joinError}
            </p>
          )}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {joining ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "🚀 Join Game"
            )}
          </button>

          {/* Current players preview */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Already in lobby</p>
            {game.players.map((p) => (
              <div key={p.playerCode} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {p.name}
                {p.playerCode === game.hostPlayerCode && (
                  <span className="text-xs text-yellow-400">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReconnectingOverlay socket={socket} gameId={gameId} playerCode={playerCode} />

      {game.status === "lobby" && (
        <Lobby game={game} isHost={isHost} socket={socket} gameId={gameId} />
      )}

      {game.status === "playing" && (
        <GameBoard game={game} playerIndex={playerIndex} socket={socket} gameId={gameId} />
      )}

      {game.status === "ended" && (
        <EndScreen game={game} playerIndex={playerIndex} isHost={isHost} socket={socket} gameId={gameId} />
      )}
    </>
  );
}
