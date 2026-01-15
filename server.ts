import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

interface Player {
  id: string;
  name: string;
  hand: string[];
  isActive: boolean;
}

interface Game {
  id: string;
  players: Player[];
  pile: string[];
  turn: number;
  log: string[];
  lastClaim: any;
  winner?: number;              // final winner
  potentialWinner?: number;     // waiting for full turn cycle
}

const games = new Map<string, Game>();

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A","K","Q","J","10","9","8","7","6","5","4","3","2"];

/* =======================
   HELPERS
   ======================= */

const createDeck = (): string[] => {
  const deck: string[] = [];
  for (const s of SUITS) for (const v of VALUES) deck.push(`${v}${s}`);
  return deck.sort(() => Math.random() - 0.5);
};

const dealCards = (playersCount: number) => {
  const deck = createDeck();
  const hands: string[][] = Array(playersCount).fill(0).map(() => []);
  deck.forEach((c: string, i: number) => {
    hands[i % playersCount].push(c);
  });
  return hands;
};

// Confirm winner only after full turn cycle
const checkWinnerOnTurn = (game: Game) => {
  if (game.winner !== undefined) return;

  if (
    game.potentialWinner !== undefined &&
    game.turn === game.potentialWinner
  ) {
    const player = game.players[game.turn];

    if (player.hand.length === 0) {
      game.winner = game.turn;
      game.log.push(`🏆 ${player.name} has won the game!`);
    } else {
      game.potentialWinner = undefined;
    }
  }
};

/* =======================
   SOCKET LOGIC
   ======================= */

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // CREATE GAME
  socket.on("create-game", ({ name }) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    const player: Player = { id: socket.id, name, hand: [], isActive: true };

    const game: Game = {
      id: gameId,
      players: [player],
      pile: [],
      turn: 0,
      log: [],
      lastClaim: null,
    };

    const hands = dealCards(1);
    player.hand = hands[0];

    games.set(gameId, game);
    socket.join(gameId);
    socket.emit("game-created", { gameId, playerIndex: 0 });
  });

  // JOIN GAME
  socket.on("join-game", ({ gameId, name }) => {
    const game = games.get(gameId);
    if (!game) return socket.emit("error", "Game not found");

    const player: Player = { id: socket.id, name, hand: [], isActive: true };
    game.players.push(player);

    const hands = dealCards(game.players.length);
    game.players.forEach((p, i) => (p.hand = hands[i]));

    socket.join(gameId);
    io.to(gameId).emit("game-updated", game);
    socket.emit("joined-game", { gameId, playerIndex: game.players.length - 1 });
  });

  socket.on("get-game-state", ({ gameId }) => {
    const game = games.get(gameId);
    if (game) socket.emit("game-updated", game);
  });

  // PLAY CARDS
  socket.on("play-cards", ({ gameId, playerIndex, selected, count, type }) => {
    const game = games.get(gameId);
    if (!game || game.winner !== undefined) return;

    const player = game.players[playerIndex];

    player.hand = player.hand.filter(c => !selected.includes(c));
    game.pile.push(...selected);

    game.lastClaim = { player: playerIndex, count, type, cards: selected };
    game.log.push(`${player.name} claims ${count}x ${type}`);

    if (player.hand.length === 0) {
      game.potentialWinner = playerIndex;
    }

    game.turn = (game.turn + 1) % game.players.length;
    checkWinnerOnTurn(game);

    io.to(gameId).emit("game-updated", game);
  });

  // CHECK (UPDATED TURN LOGIC)
  socket.on("check", ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || !game.lastClaim || game.winner !== undefined) return;

    const claimerIndex = game.lastClaim.player;
    const checkerIndex = game.turn;

    const claimer = game.players[claimerIndex];
    const checker = game.players[checkerIndex];

    const lied = game.lastClaim.cards.some(
      (c: string) => c.slice(0, -1) !== game.lastClaim.type
    );

    if (lied) {
      claimer.hand.push(...game.pile);
      game.log.push(
        `${checker.name} checked ${claimer.name}. ❌ ${claimer.name} LIED and takes the pile (${game.pile.length} cards).`
      );
    } else {
      checker.hand.push(...game.pile);
      game.log.push(
        `${checker.name} checked ${claimer.name}. ✅ ${claimer.name} was HONEST. ${checker.name} takes the pile (${game.pile.length} cards).`
      );
    }

    game.pile = [];
    game.lastClaim = null;

    // ✅ ONLY CHANGE IS HERE
    game.turn = lied ? checkerIndex : claimerIndex;

    checkWinnerOnTurn(game);
    io.to(gameId).emit("game-updated", game);
  });

  // PASS
  socket.on("pass", ({ gameId, playerIndex }) => {
    const game = games.get(gameId);
    if (!game || game.winner !== undefined) return;

    game.turn = (game.turn + 1) % game.players.length;
    checkWinnerOnTurn(game);

    game.log.push(`${game.players[playerIndex].name} passed`);
    io.to(gameId).emit("game-updated", game);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () =>
  console.log(`Socket.IO server running on http://localhost:${PORT}`)
);
