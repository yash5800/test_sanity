'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useCursor } from './cursor-provider'

const cursorOptions = [
  { value: 'gojo', label: 'Gojo', preview: '/cursors/gojo/cursor_32.png' },
  { value: 'luffy', label: 'Luffy', preview: '/cursors/luffy/cursor_32.png' },
  { value: 'system', label: 'System', preview: null },
] as const

export function CursorSelector() {
  const { cursorType, setCursorType } = useCursor()
  const [isOpen, setIsOpen] = useState(false)
  const [isPc, setIsPc] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkIsPc = () => {
      setIsPc(window.matchMedia('(pointer: fine)').matches)
    }
    checkIsPc()
    window.matchMedia('(pointer: fine)').addEventListener('change', checkIsPc)
    return () => window.matchMedia('(pointer: fine)').removeEventListener('change', checkIsPc)
  }, [])

  if (!mounted || !isPc) return null

  const currentOption = cursorOptions.find(o => o.value === cursorType)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur hover:bg-background/90 transition-all p-2"
        aria-label="Cursor selector"
      >
        {currentOption?.preview ? (
          <img 
            src={currentOption.preview} 
            alt={currentOption.label}
            className="h-4 w-4"
          />
        ) : (
          <Settings className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-border bg-background shadow-lg">
            <div className="p-2">
              <div className="px-3 py-2 text-center font-semibold text-sm">
                Cursor
              </div>
              <div className="h-px bg-border my-1" />

              <div className="space-y-1 p-1">
                {cursorOptions.map((option) => {
                  const isSelected = cursorType === option.value

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setCursorType(option.value)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-left ${
                        isSelected
                          ? "bg-blue-600/20 border border-blue-500/30 text-foreground font-medium"
                          : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.preview ? (
                        <img 
                          src={option.preview} 
                          alt={option.label}
                          className="h-5 w-5 flex-shrink-0"
                        />
                      ) : (
                        <Settings className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="font-medium">{option.label}</span>
                      {isSelected && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}