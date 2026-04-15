"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PlayerHand from "./player-hand";

interface LastClaim {
  player: number;
  count: number;
  type: string;
}

interface PlayDialogProps {
  playerHand: string[];
  lastClaim: LastClaim | null;
  onSubmit: (count: number, cardType: string, selectedCards: string[]) => void;
  onClose: () => void;
  log?: string[];
}

const CARD_TYPES = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

export default function PlayDialog({
  playerHand,
  lastClaim,
  onSubmit,
  onClose,
}: PlayDialogProps) {
  const allowedTypes = lastClaim ? [lastClaim.type] : CARD_TYPES;

  const [count, setCount] = useState(1);
  const [cardType, setCardType] = useState(allowedTypes[0]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    if (!allowedTypes.includes(cardType)) {
      setCardType(allowedTypes[0]);
    }
    setSelectedCards([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastClaim?.type]);

  const toggleCard = (cardId: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) return prev.filter((c) => c !== cardId);
      if (prev.length >= count) return prev;
      return [...prev, cardId];
    });
  };

  const handleCountChange = (n: number) => {
    setCount(n);
    setSelectedCards([]);
  };

  const handleSubmit = () => {
    if (selectedCards.length !== count) return;
    const cards = selectedCards.map((id) => {
      const parts = id.split("-");
      parts.pop();
      return parts.join("-");
    });
    onSubmit(count, cardType, cards);
    onClose();
  };

  const maxCount = Math.min(4, playerHand.length);
  const ready = selectedCards.length === count;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-xl bg-[#111827] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Play Cards</h2>
            {lastClaim && (
              <p className="text-xs text-amber-400 mt-0.5">
                Continuing — must claim:{" "}
                <span className="font-bold">{lastClaim.type}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 text-lg transition flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* ── Count selector ── */}
        <div className="px-5 pb-3 flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            How many?
          </p>
          <div className="flex gap-2">
            {Array.from({ length: maxCount }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={count === n ? "default" : "outline"}
                className={`flex-1 font-bold ${
                  count === n
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => handleCountChange(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Card type selector ── */}
        <div className="px-5 pb-3 flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Card type
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allowedTypes.map((type) => (
              <Button
                key={type}
                variant={cardType === type ? "default" : "outline"}
                className={`px-3 py-1 h-auto text-sm font-bold ${
                  cardType === type
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setCardType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Selection status ── */}
        <div className="px-5 pb-1 flex-shrink-0">
          <p className="text-xs text-gray-500">
            Select{" "}
            <span className="text-white font-semibold">{count}</span> card
            {count > 1 ? "s" : ""} from your hand{" "}
            <span
              className={`font-semibold ml-1 ${
                ready ? "text-green-400" : "text-gray-500"
              }`}
            >
              ({selectedCards.length}/{count} selected)
            </span>
          </p>
        </div>

        {/* ── Card fan ── */}
        <div
          className="flex-shrink-0 relative w-full overflow-visible"
          style={{ height: 260 }}
        >
          <PlayerHand
            cards={playerHand}
            selectable
            selectedCards={selectedCards}
            onSelectCard={toggleCard}
          />
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 flex-shrink-0 bg-[#111827]">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!ready}
            className={`flex-[2] font-semibold transition ${
              ready
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                : "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
            }`}
          >
            {ready
              ? `▶ Play ${count} × ${cardType}`
              : `Select ${count - selectedCards.length} more`}
          </Button>
        </div>
      </div>
    </div>
  );
}
