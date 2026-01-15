"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function CreateGamePage() {
  const router = useRouter();
  const socket = getSocket();

  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);

  const createGame = () => {
    if (!name) return alert("Enter your name");
    socket.connect();
    socket.emit("create-game", { playerName: name, maxPlayers });
    socket.on("game-created", ({ gameId }) => {
      router.push(`/game/${gameId}?name=${name}`);
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Create Game</h1>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />
      <input
        type="number"
        value={maxPlayers}
        min={2}
        max={6}
        onChange={(e) => setMaxPlayers(Number(e.target.value))}
        className="border p-2"
      />
      <button
        onClick={createGame}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Game
      </button>
    </div>
  );
}
