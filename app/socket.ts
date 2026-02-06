// app/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("https://bluff-game-server-final.onrender.com/", {
      autoConnect: false, // we control when to connect
    });
  }
  return socket;
};
