"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "./socket";

export default function Home() {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState<null | "create" | "join">(null);

  const router = useRouter();
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, [socket]);

  const createGame = () => {
    if (!name) return alert("Enter your name");

    setLoading("create");
    socket.emit("create-game", { name });

    socket.once("game-created", ({ gameId, playerCode }) => {
      setLoading(null);
      router.push(`/game/${gameId}?playerCode=${playerCode}`);
    });
  };

  const joinGame = () => {
    if (!name || !gameId) return alert("Enter name & game ID");

    setLoading("join");
    socket.emit("join-game", { gameId, name });

    socket.once("joined-game", ({ gameId, playerCode }) => {
      setLoading(null);
      router.push(`/game/${gameId}?playerCode=${playerCode}`);
    });
  };

  const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1418] via-[#121d2a] to-[#18243f] relative overflow-hidden">
      
      <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-wide">
            🃏 Bluff Arena
          </h1>
          <p className="text-gray-300 text-sm">
            Outsmart. Bluff. Win.
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-300">Your Name</label>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <button
          onClick={createGame}
          disabled={loading !== null}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition transform shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === "create" ? <Spinner /> : "🎯 Create New Game"}
        </button>

        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-white/10" />
          OR
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div>
          <label className="text-sm text-gray-300">Game ID</label>
          <input
            placeholder="Enter game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="mt-1 w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <button
          onClick={joinGame}
          disabled={loading !== null}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition transform shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === "join" ? <Spinner /> : "🚀 Join Game"}
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">
          Play with friends in real-time multiplayer
        </p>
      </div>
    </div>
  );
}
