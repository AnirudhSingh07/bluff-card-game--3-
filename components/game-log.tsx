"use client"

export default function GameLog({ log }: { log?: string[] }) {
  if (!log || log.length === 0) return <div>No actions yet</div>

  return (
    <div className="border p-2 mt-4 h-32 overflow-y-auto bg-gray-50">
      {log.map((entry, index) => (
        <p key={index}>{entry}</p>
      ))}
    </div>
  )
}
