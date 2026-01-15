import { Server } from "socket.io";

interface Player {
  name: string;
  id: string;
  socketId: string;
}

interface Game {
  id: string;
  players: Player[];
  maxPlayers: number;
  started: boolean;
}

const games: Record<string, Game> = {};

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* ---------- CREATE GAME ---------- */
    socket.on("create-game", ({ playerName, maxPlayers }) => {
      const gameId = Math.random().toString(36).substring(2, 8);

      const player: Player = {
        name: playerName,
        id: "p0",
        socketId: socket.id,
      };

      games[gameId] = {
        id: gameId,
        players: [player],
        maxPlayers,
        started: true, // ✅ creator starts immediately
      };

      socket.join(gameId);

      socket.emit("game-created", { gameId });

      emitLobbyState(gameId);
    });

    /* ---------- JOIN GAME ---------- */
    socket.on("join-game", ({ gameId, playerName }) => {
      const game = games[gameId];
      if (!game) return;

      let index = game.players.findIndex(
        (p) => p.socketId === socket.id
      );

      if (index === -1) {
        game.players.push({
          name: playerName,
          id: "p" + game.players.length,
          socketId: socket.id,
        });
        socket.join(gameId);
      }

      emitLobbyState(gameId);
    });

    /* ---------- GET LOBBY STATE ---------- */
    socket.on("get-lobby-state", ({ gameId }) => {
      emitLobbyState(gameId, socket);
    });

    /* ---------- DISCONNECT ---------- */
    socket.on("disconnect", () => {
      for (const gameId in games) {
        const game = games[gameId];
        const index = game.players.findIndex(
          (p) => p.socketId === socket.id
        );

        if (index !== -1) {
          game.players.splice(index, 1);
          emitLobbyState(gameId);
        }

        if (game.players.length === 0) {
          delete games[gameId];
        }
      }
    });

    /* ---------- HELPER ---------- */
    const emitLobbyState = (gameId: string, target?: any) => {
      const game = games[gameId];
      if (!game) return;

      const payload = {
        players: game.players,
        maxPlayers: game.maxPlayers,
        started: game.started,
      };

      if (target) {
        target.emit("lobby-state", {
          ...payload,
          playerIndex: game.players.findIndex(
            (p) => p.socketId === target.id
          ),
        });
      } else {
        io.to(gameId).emit("lobby-state", payload);
      }
    };
  });

  return io;
};
