"use client";

interface PlayerHandProps {
  cards: string[];
  selectable?: boolean;
  selectedCards?: string[];
  onSelectCard?: (cardId: string) => void;
}

const getCardColor = (card: string) => {
  if (card.includes("♥") || card.includes("♦")) return "text-red-600";
  return "text-black";
};

export default function PlayerHand({
  cards,
  selectable = false,
  selectedCards = [],
  onSelectCard,
}: PlayerHandProps) {
  const totalCards = cards.length;
  if (totalCards === 0) return <div style={{ height: 200 }} />;

  const radius = 180;
  const maxFanAngle = 45;

  return (
    <div
      className="relative w-full overflow-visible"
      style={{ height: 260 }}
    >
      {cards.map((card, index) => {
        const cardId = `${card}-${index}`;
        const isSelected = selectedCards.includes(cardId);
        const suit = card.slice(-1);
        const rank = card.slice(0, -1);
        const colorClass = getCardColor(card);

        const middleIndex = (totalCards - 1) / 2;
        const angle =
          ((index - middleIndex) * maxFanAngle) / (middleIndex || 1);

        const rad = (angle * Math.PI) / 270;
        const x = radius * Math.sin(rad);
        const y = radius * (1 - Math.cos(rad));

        return (
          <div
            key={cardId}
            onClick={() => selectable && onSelectCard?.(cardId)}
            className={`absolute transition-all duration-150 ${
              selectable ? "cursor-pointer" : ""
            }`}
            style={{
              left: "50%",
              bottom: 110,
              zIndex: isSelected ? 100 : index + 1,
              transform: `
                translateX(-50%)
                translate(${x}px, ${y}px)
                rotate(${angle}deg)
                ${isSelected ? "translateY(-22px) scale(1.1)" : ""}
              `.trim(),
            }}
          >
            <div
              className={`relative w-28 h-40 bg-white rounded-xl shadow-md border border-gray-300 flex items-center justify-center select-none
                ${isSelected ? "ring-2 ring-blue-400 border-blue-400 shadow-blue-200" : ""}
              `}
            >
              {/* Top-left */}
              <div
                className={`absolute top-1 left-1 flex flex-col items-start ${colorClass}`}
              >
                <span className="text-sm font-bold">{rank}</span>
                <span className="text-sm">{suit}</span>
              </div>

              {/* Center suit */}
              <div className={`text-4xl ${colorClass}`}>{suit}</div>

              {/* Bottom-right (rotated) */}
              <div
                className={`absolute bottom-1 right-1 flex flex-col items-end rotate-180 ${colorClass}`}
              >
                <span className="text-sm font-bold">{rank}</span>
                <span className="text-sm">{suit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
