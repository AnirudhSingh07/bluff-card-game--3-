export interface Player {
  id: string;           // socket.id — updated on reconnect
  name: string;
  hand: string[];
  isActive: boolean;
  playerCode: string;
  isConnected: boolean;
  lastSeen: number;
}

export interface LastClaim {
  player: number;
  count: number;
  type: string;
  cards: string[];
}

export type GameStatus = "lobby" | "playing" | "ended";

export interface Game {
  id: string;
  status: GameStatus;
  hostSocketId: string;
  hostPlayerCode: string;
  maxPlayers: number;
  players: Player[];
  pile: string[];
  turn: number;
  log: string[];
  lastClaim: LastClaim | null;
  winner?: number;
  potentialWinner?: number;
  passCount: number;
  turnDeadline: number;   // ms timestamp — 0 in lobby/ended
  createdAt: number;
}
