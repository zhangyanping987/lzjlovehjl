import { createContext, useContext } from 'react'

export type ViewMode = 'outer' | 'inner'

export const VIEW_CONFIG = {
  outer: { distance: 30, minDistance: 18, maxDistance: 30 },
  inner: { distance: 9, minDistance: 8, maxDistance: 11.5 },
  transitionDuration: 0.85,
} as const

interface ViewModeContextValue {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  introDone: boolean
  transitioning: boolean
}

export const ViewModeContext = createContext<ViewModeContextValue | null>(null)

export function useViewMode() {
  const ctx = useContext(ViewModeContext)
  if (!ctx) throw new Error('useViewMode must be used within ViewModeContext')
  return ctx
}

export function useViewModeOptional() {
  return useContext(ViewModeContext)
}
