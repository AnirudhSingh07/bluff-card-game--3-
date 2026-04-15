"use client";

import { useState } from "react";
import type { Socket } from "socket.io-client";
import type { Game } from "@/types/game";

interface LobbyProps {
  game: Game;
  isHost: boolean;
  socket: Socket;
  gameId: string;
}

export default function Lobby({ game, isHost, socket, gameId }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  // Strip the host's playerCode so the link is a clean join URL
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/game/${gameId}`
      : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startGame = () => {
    socket.emit("start-game", { gameId });
  };

  const canStart = isHost && game.players.length >= 2;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1418] via-[#121d2a] to-[#18243f] relative overflow-hidden px-4">
      {/* Ambient glows */}
      <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 w-full max-w-md space-y-6 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            🃏 Bluff Arena
          </h1>
          <p className="text-gray-400 text-sm">Waiting for players…</p>
        </div>

        {/* Game code */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Game Code
            </span>
            <span className="font-mono text-yellow-400 text-lg tracking-widest font-bold">
              {gameId}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition border border-white/10"
          >
            {copied ? "✅ Link Copied!" : "📋 Copy Invite Link"}
          </button>
        </div>

        {/* Players list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-300 font-medium">Players</span>
            <span className="text-xs text-gray-500">
              {game.players.length} / {game.maxPlayers}
            </span>
          </div>

          {game.players.map((player, i) => (
            <div
              key={player.playerCode}
              className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>

              <span className="text-white font-medium flex-1 truncate">
                {player.name}
              </span>

              {/* Host badge */}
              {player.playerCode === game.hostPlayerCode && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}

              {/* Connected indicator */}
              <div
                className={`w-2 h-2 rounded-full ${
                  player.isConnected ? "bg-green-400" : "bg-gray-500"
                }`}
              />

              {/* Slot number */}
              <span className="text-gray-600 text-xs w-4 text-right">
                {i + 1}
              </span>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: game.maxPlayers - game.players.length }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 bg-black/10 border border-white/5 rounded-xl px-4 py-3 opacity-40"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 border border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">?</span>
                </div>
                <span className="text-gray-600 text-sm italic">
                  Waiting for player…
                </span>
              </div>
            )
          )}
        </div>

        {/* Action area */}
        {isHost ? (
          <div className="space-y-2">
            <button
              onClick={startGame}
              disabled={!canStart}
              className={`w-full py-3 rounded-xl font-semibold text-base transition shadow-lg ${
                canStart
                  ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:opacity-90 active:scale-95"
                  : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
              }`}
            >
              {canStart ? "🚀 Start Game" : `Need ${2 - game.players.length} more player(s)`}
            </button>
            <p className="text-center text-xs text-gray-500">
              Share the invite link so friends can join
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              Waiting for host to start…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
