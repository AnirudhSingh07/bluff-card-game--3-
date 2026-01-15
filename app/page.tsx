"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "./socket";

export default function Home() {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const router = useRouter();
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, [socket]);

  const createGame = () => {
    if (!name) return alert("Enter your name");
    socket.emit("create-game", { name });

    socket.once("game-created", ({ gameId, playerIndex }) => {
      router.push(`/game/${gameId}?playerIndex=${playerIndex}`);
    });
  };

  const joinGame = () => {
    if (!name || !gameId) return alert("Enter name & game ID");
    socket.emit("join-game", { gameId, name });

    socket.once("joined-game", ({ gameId, playerIndex }) => {
      router.push(`/game/${gameId}?playerIndex=${playerIndex}`);
    });
  };

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center">Bluff Multiplayer</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <button
        onClick={createGame}
        className="w-full bg-green-500 text-white p-2 mt-2"
      >
        Create Game
      </button>

      <input
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        className="border p-2 w-full mt-4"
      />

      <button
        onClick={joinGame}
        className="w-full bg-blue-500 text-white p-2 mt-2"
      >
        Join Game
      </button>
    </div>
  );
}
