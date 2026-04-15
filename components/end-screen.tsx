"use client";

import type { Socket } from "socket.io-client";
import type { Game } from "@/types/game";

interface EndScreenProps {
  game: Game;
  playerIndex: number;
  isHost: boolean;
  socket: Socket;
  gameId: string;
}

export default function EndScreen({
  game,
  playerIndex,
  isHost,
  socket,
  gameId,
}: EndScreenProps) {
  const winner = game.winner !== undefined ? game.players[game.winner] : null;
  const iWon = game.winner === playerIndex;

  const handleRematch = () => {
    socket.emit("rematch", { gameId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a1418] via-[#121d2a] to-[#18243f]">
      {/* Ambient glows */}
      <div className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 w-full max-w-sm mx-4 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 space-y-6 text-center">
        {/* Trophy / result */}
        <div className="space-y-2">
          <div className="text-7xl">{iWon ? "🏆" : "🎴"}</div>
          <h2 className="text-3xl font-extrabold text-white">
            {iWon ? "You Won!" : `${winner?.name ?? "?"} Won!`}
          </h2>
          <p className="text-gray-400 text-sm">
            {iWon
              ? "Congratulations — you ran out of cards first!"
              : "Better luck next round!"}
          </p>
        </div>

        {/* Final card counts */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2 text-left">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Final standings
          </p>
          {[...game.players]
            .sort((a, b) => a.hand.length - b.hand.length)
            .map((player, rank) => (
              <div
                key={player.playerCode}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-4">{rank + 1}.</span>
                  <span
                    className={`text-sm font-medium ${
                      player.hand.length === 0
                        ? "text-yellow-400"
                        : "text-white"
                    }`}
                  >
                    {player.name}
                    {player.hand.length === 0 && " 🏆"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {player.hand.length} cards left
                </span>
              </div>
            ))}
        </div>

        {/* Actions */}
        {isHost ? (
          <div className="space-y-2">
            <button
              onClick={handleRematch}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:opacity-90 active:scale-95 transition shadow-lg"
            >
              🔄 Play Again
            </button>
            <p className="text-xs text-gray-500">
              Same players, new game
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
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
              Waiting for host to restart…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
