'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type CursorType = 'gojo' | 'luffy' | 'system'

interface CursorContextType {
  cursorType: CursorType
  setCursorType: (type: CursorType) => void
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorType, setCursorType] = useState<CursorType>('gojo')
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cursor-type') as CursorType
    if (saved) {
      setCursorType(saved)
    }

    const media = window.matchMedia('(pointer: coarse)')
    const syncPointerType = () => setIsCoarsePointer(media.matches)
    syncPointerType()
    media.addEventListener('change', syncPointerType)

    setMounted(true)

    return () => {
      media.removeEventListener('change', syncPointerType)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cursor-type', cursorType)
      document.documentElement.setAttribute('data-cursor-type', isCoarsePointer ? 'system' : cursorType)
    }
  }, [cursorType, isCoarsePointer, mounted])

  return (
    <CursorContext.Provider value={{ cursorType, setCursorType }}>
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (!context) {
    throw new Error('useCursor must be used within CursorProvider')
  }
  return context
}