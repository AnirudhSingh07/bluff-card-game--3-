"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

interface ReconnectingOverlayProps {
  socket: Socket;
  gameId: string;
  playerCode: string | null;
}

export default function ReconnectingOverlay({
  socket,
  gameId,
  playerCode,
}: ReconnectingOverlayProps) {
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    const onDisconnect = () => setDisconnected(true);

    const onConnect = () => {
      setDisconnected(false);
      if (playerCode) {
        // Re-identify ourselves to the server
        socket.emit("reconnect-player", { gameId, playerCode });
      }
    };

    socket.on("disconnect", onDisconnect);
    socket.on("connect", onConnect);

    return () => {
      socket.off("disconnect", onDisconnect);
      socket.off("connect", onConnect);
    };
  }, [socket, gameId, playerCode]);

  if (!disconnected) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div className="w-14 h-14 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin" />

      <div className="text-center space-y-1">
        <p className="text-white text-xl font-semibold">Connection lost</p>
        <p className="text-gray-400 text-sm">Reconnecting…</p>
      </div>

      <button
        onClick={() => socket.connect()}
        className="mt-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
      >
        Retry Now
      </button>
    </div>
  );
}
