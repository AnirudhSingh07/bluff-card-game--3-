"use client";

import { useState } from "react";
import PlayDialog from "./play-dialog";

interface LastClaim {
  player: number;
  count: number;
  type: string;
}

interface ActionPanelProps {
  onPass: () => void;
  onPlayCards: (count: number, cardType: string, selectedCards: string[]) => void;
  onCheck: () => void;
  canCheck: boolean;
  isCurrentPlayer: boolean;
  playerHand: string[];
  gameLog: string[];
  lastClaim: LastClaim | null;
}

export default function ActionPanel({
  onPass,
  onPlayCards,
  onCheck,
  canCheck,
  isCurrentPlayer,
  playerHand,
  lastClaim,
}: ActionPanelProps) {
  const [showDialog, setShowDialog] = useState(false);

  if (!isCurrentPlayer) {
    return (
      <div className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-gray-500 text-sm backdrop-blur-md">
        Waiting for your turn…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl px-3 py-2 rounded-2xl">

        {/* PASS */}
        <button
          onClick={onPass}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 transition text-white border border-white/10"
        >
          <span className="text-lg">✋</span>
          <span className="text-[11px] font-semibold">Pass</span>
        </button>

        {/* PLAY CARDS */}
        <button
          onClick={() => setShowDialog(true)}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-white shadow-lg shadow-blue-600/30"
        >
          <span className="text-lg">🃏</span>
          <span className="text-[11px] font-semibold">Play Cards</span>
        </button>

        {/* CALL BLUFF */}
        <button
          onClick={onCheck}
          disabled={!canCheck}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl active:scale-95 transition border ${
            canCheck
              ? "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-600/30"
              : "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
          }`}
        >
          <span className="text-lg">🔍</span>
          <span className="text-[11px] font-semibold">Call Bluff</span>
        </button>
      </div>

      {showDialog && (
        <PlayDialog
          playerHand={playerHand}
          lastClaim={lastClaim}
          onSubmit={(count, type, selected) => {
            onPlayCards(count, type, selected);
            setShowDialog(false);
          }}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
