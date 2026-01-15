import { Server } from "socket.io";

interface Player {
  name: string;
  socketId: string;
}

interface Game {
  id: string;
  players: Player[];
}

const games: Record<string, Game> = {};

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("create-game", ({ name }) => {
      const gameId = Math.random().toString(36).slice(2, 8);

      games[gameId] = {
        id: gameId,
        players: [{ name, socketId: socket.id }],
      };

      socket.join(gameId);
      socket.emit("game-created", { gameId });
      io.to(gameId).emit("players-update", games[gameId].players);
    });

    socket.on("join-game", ({ gameId, name }) => {
      const game = games[gameId];
      if (!game) return;

      game.players.push({ name, socketId: socket.id });
      socket.join(gameId);

      io.to(gameId).emit("players-update", game.players);
    });

    socket.on("disconnect", () => {
      for (const game of Object.values(games)) {
        game.players = game.players.filter(p => p.socketId !== socket.id);
      }
    });
  });
}
