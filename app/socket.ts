// app/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      autoConnect: false, // we control when to connect
    });
  }
  return socket;
};
