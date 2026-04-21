'use client'

import { useState } from 'react'
import { MousePointer2, User, Settings, X } from 'lucide-react'
import { useCursor } from './cursor-provider'

const cursorOptions = [
  { value: 'gojo', label: 'Gojo', icon: MousePointer2 },
  { value: 'luffy', label: 'Luffy', icon: User },
  { value: 'system', label: 'System', icon: Settings },
] as const

export function CursorSettings() {
  const { cursorType, setCursorType } = useCursor()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full shadow-lg border-2 border-border bg-card hover:bg-accent transition-colors"
        aria-label="Cursor Settings"
      >
        <MousePointer2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-2xl bg-card border border-border shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MousePointer2 className="w-5 h-5" />
              Cursor Style
            </h2>

            <div className="space-y-2">
              {cursorOptions.map((option) => {
                const Icon = option.icon
                const isActive = cursorType === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setCursorType(option.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}