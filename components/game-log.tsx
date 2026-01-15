"use client"

import { useEffect, useRef } from "react"

export default function GameLog({ log }: { log?: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when log updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [log])

  if (!log || log.length === 0)
    return (
      <div className="border rounded-lg p-3 bg-gray-100 text-center text-gray-500">
        No actions yet
      </div>
    )

  return (
    <div
      ref={scrollRef}
      className="border rounded-lg p-3 mt-3 bg-gray-50
                 h-12 sm:h-20 md:h-32 lg:h-40
                 overflow-y-auto text-sm sm:text-base
                 shadow-inner"
    >
      {log.map((entry, index) => (
        <p
          key={index}
          className="mb-1 last:mb-0 text-gray-800 break-words"
        >
          {entry}
        </p>
      ))}
    </div>
  )
}
