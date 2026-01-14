"use client"

import { Card } from "@/components/ui/card"

interface GameLogProps {
  log: string[]
}

export default function GameLog({ log }: GameLogProps) {
  return (
    <Card className=" text-black p-4 mt-4 max-h-48 overflow-y-auto border-slate-700">
      <h3 className="font-bold mb-2 text-blue-900">Game Log</h3>
      {log.length === 0 ? (
        <p className="text-slate-400 italic">No actions yet</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {log.map((entry, i) => (
            <li key={i} className="border-b border-slate-700 pb-1">
              {entry}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
