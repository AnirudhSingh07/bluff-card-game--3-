"use client";

import { useEffect, useState, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { Game } from "@/types/game";
import PlayerHand from "./player-hand";
import ActionPanel from "./action-panel";
import TurnTimer from "./turn-timer";
import EmoteBar from "./emote-bar";

interface GameBoardProps {
  game: Game;
  playerIndex: number;
  socket: Socket;
  gameId: string;
}

interface EmoteState {
  emoji: string;
  key: number;
}

export default function GameBoard({
  game,
  playerIndex,
  socket,
  gameId,
}: GameBoardProps) {
  const [emotes, setEmotes] = useState<Record<number, EmoteState>>({});
  const [copied, setCopied] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const emoteTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const emoteCounter = useRef(0);

  // Subscribe to emote events only (game state lives in parent)
  useEffect(() => {
    const onEmote = ({ playerIndex: pi, emoji }: { playerIndex: number; emoji: string }) => {
      emoteCounter.current += 1;
      setEmotes((prev) => ({ ...prev, [pi]: { emoji, key: emoteCounter.current } }));

      if (emoteTimers.current[pi]) clearTimeout(emoteTimers.current[pi]);
      emoteTimers.current[pi] = setTimeout(() => {
        setEmotes((prev) => {
          const next = { ...prev };
          delete next[pi];
          return next;
        });
      }, 2500);
    };

    socket.on("emote-received", onEmote);
    return () => { socket.off("emote-received", onEmote); };
  }, [socket]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.log]);

  const copyGameId = async () => {
    await navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const me = game.players[playerIndex];
  const isMyTurn = game.turn === playerIndex;

  const canCheck =
    !!game.lastClaim &&
    game.lastClaim.player !== playerIndex &&
    isMyTurn;

  const playCards = (count: number, type: string, selected: string[]) => {
    if (!isMyTurn) return;
    socket.emit("play-cards", { gameId, selected, count, type });
  };

  const pass = () => {
    if (!isMyTurn) return;
    socket.emit("pass", { gameId });
  };

  const check = () => {
    if (!canCheck) return;
    socket.emit("check", { gameId });
  };

  const getSeatStyle = (seatOrder: number, totalOpponents: number) => {
    const radiusX = game.players.length <= 3 ? 35 : game.players.length <= 6 ? 40 : 45;
    const radiusY = 32;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const angleStep = (endAngle - startAngle) / (totalOpponents - 1 || 1);
    const angle = startAngle + seatOrder * angleStep;
    return {
      left: `calc(50% + ${Math.cos(angle) * radiusX}%)`,
      top: `calc(50% + ${Math.sin(angle) * radiusY}%)`,
      transform: "translate(-50%, -50%)",
    };
  };

  const tableShape =
    game.players.length <= 3
      ? "rounded-[40%]"
      : game.players.length <= 6
      ? "rounded-[48%]"
      : "rounded-[55%]";

  const opponents = game.players.filter((_, i) => i !== playerIndex);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-900 to-green-950 text-white px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col relative overflow-x-hidden">

      {/* ── GAME CODE ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
          <span className="text-xs sm:text-sm text-gray-300">Code:</span>
          <span className="font-mono text-yellow-400 text-sm sm:text-base tracking-wider">
            {gameId}
          </span>
          <button
            onClick={copyGameId}
            className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-semibold transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* ── GAME LOG ── */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-44 sm:w-64 md:w-80 z-40">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-xl p-2 sm:p-3">
          <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-white/90">
            Game Log
          </h3>
          <div
            ref={logRef}
            className="max-h-[90px] sm:max-h-[120px] overflow-y-auto space-y-1 pr-1"
          >
            {game.log.map((entry, i) => (
              <div
                key={i}
                className="text-[10px] sm:text-[11px] leading-tight bg-black/30 px-2 py-1 rounded"
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className={`
            relative w-full max-w-[1000px] aspect-[9/5] sm:aspect-[16/9]
            ${tableShape}
            shadow-[0_40px_80px_rgba(0,0,0,0.85)]
            border-[10px] border-[#4b2e12]
            bg-[radial-gradient(circle_at_center,#0f6b34_0%,#0c542a_45%,#083d1d_80%)]
            overflow-hidden
          `}
        >
          {/* Felt texture & lighting */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_25px_60px_rgba(0,0,0,0.85)] pointer-events-none" />
          <div className="absolute inset-0 rounded-[inherit] border-[6px] border-[#6b4420] shadow-[inset_0_0_25px_rgba(0,0,0,0.7)] pointer-events-none" />

          {/* Center: pile + timer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center gap-2">
            <TurnTimer
              turnDeadline={game.turnDeadline}
              isMyTurn={isMyTurn}
              currentPlayerName={game.players[game.turn]?.name ?? ""}
            />

            <p className="text-[10px] sm:text-xs md:text-sm text-gray-200">
              Pile: {game.pile.length} cards
            </p>

            {/* Card stack visual */}
            <div className="relative w-10 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28">
              {game.pile.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full bg-white rounded-lg border shadow-md"
                  style={{
                    top: i * 2,
                    left: i * 2,
                    transform: `rotate(${i * 2}deg)`,
                  }}
                />
              ))}
            </div>

            {game.lastClaim && (
              <p className="text-[10px] sm:text-xs md:text-sm">
                {game.players[game.lastClaim.player]?.name} played{" "}
                {game.lastClaim.count} × {game.lastClaim.type}
              </p>
            )}
          </div>

          {/* Opponent seats */}
          {opponents.map((player, i) => {
            const globalIndex = game.players.indexOf(player);
            const isTurn = game.turn === globalIndex;
            const emote = emotes[globalIndex];

            return (
              <div
                key={player.playerCode}
                className="absolute flex flex-col items-center gap-1"
                style={getSeatStyle(i, opponents.length)}
              >
                {/* Floating emote */}
                {emote && (
                  <div
                    key={emote.key}
                    className="text-2xl animate-bounce absolute -top-8"
                  >
                    {emote.emoji}
                  </div>
                )}

                <div
                  className={`px-2 py-1 rounded-lg text-[9px] sm:text-xs flex items-center gap-1 ${
                    isTurn
                      ? "bg-yellow-500 text-black font-bold"
                      : "bg-black/60"
                  } ${!player.isConnected ? "opacity-50" : ""}`}
                >
                  {!player.isConnected && (
                    <span className="text-[8px] text-red-400">●</span>
                  )}
                  {player.name}
                  {!player.isConnected && (
                    <span className="text-[8px] text-red-300 ml-1">DC</span>
                  )}
                </div>

                <div className="relative w-8 h-12 sm:w-12 sm:h-16 md:w-14 md:h-20">
                  {Array.from({
                    length: Math.min(player.hand.length, 20),
                  }).map((_, c) => (
                    <div
                      key={c}
                      className="absolute w-full h-full rounded-lg border border-black shadow-md"
                      style={{
                        left: c * 5,
                        background:
                          "linear-gradient(135deg,#111 25%,#222 25%,#222 50%,#111 50%,#111 75%,#222 75%,#222 100%)",
                        backgroundSize: "12px 12px",
                      }}
                    />
                  ))}
                </div>

                <span className="text-[9px] opacity-70">
                  {player.hand.length} cards
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM ZONE: hand + action bar ── */}
      <div className="w-full bg-black/30 border-t border-white/5 pt-2 pb-20 overflow-visible">
        <p className="text-center text-[11px] text-gray-500 mb-1">
          Your hand · {me.hand.length} cards
        </p>
        <PlayerHand cards={me.hand} />
      </div>

      {/* ── FIXED ACTION BAR ── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <ActionPanel
          onPass={pass}
          gameLog={game.log}
          onPlayCards={playCards}
          onCheck={check}
          canCheck={canCheck}
          isCurrentPlayer={isMyTurn}
          playerHand={me.hand}
          lastClaim={game.lastClaim}
        />
        <EmoteBar socket={socket} gameId={gameId} />
      </div>

      {/* My emote bubble */}
      {emotes[playerIndex] && (
        <div
          key={emotes[playerIndex].key}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 text-4xl animate-bounce pointer-events-none"
        >
          {emotes[playerIndex].emoji}
        </div>
      )}
    </div>
  );
}
