// app/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("https://bluff-game-server-production.up.railway.app/", {
      autoConnect: false, // we control when to connect
    });
  }
  return socket;
};
