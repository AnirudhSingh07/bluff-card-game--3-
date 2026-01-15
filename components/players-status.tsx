"use client";

interface Player {
  name: string;
  hand: string[];
}

interface PlayersStatusProps {
  players: Player[];
  currentIndex: number;
}

export default function PlayersStatus({ players, currentIndex }: PlayersStatusProps) {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {players.map((player, index) => (
        <div
          key={index}
          className={`px-4 py-2 rounded border text-center min-w-[120px]
            ${index === currentIndex
              ? "bg-blue-500 text-white border-blue-600"
              : "bg-white text-black border-gray-300"
            }`}
        >
          <div className="font-semibold">{player.name}</div>
          <div className="text-sm opacity-80">{player.hand.length} cards</div>
          {index === currentIndex && <div className="text-xs mt-1 font-medium">🎯 Current Turn</div>}
        </div>
      ))}
    </div>
  );
}
