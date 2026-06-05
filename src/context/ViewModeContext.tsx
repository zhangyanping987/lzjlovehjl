import { createContext, useContext } from 'react'

export type ViewMode = 'outer' | 'inner'

export const VIEW_CONFIG = {
  /** 与 PhotoSphere 球半径一致，≤ 此距离视为球内 */
  sphereRadius: 12,
  /** 手动缩放：球心附近 → 球外最远 */
  zoomMin: 1,
  zoomMax: 30,
  /** 按钮切换视角过渡时长（秒） */
  transitionDuration: 0.85,
  /** 按钮快速跳转距离 */
  outer: { distance: 30 },
  inner: { distance: 1 },
} as const

export function viewModeFromDistance(distance: number): ViewMode {
  return distance <= VIEW_CONFIG.sphereRadius ? 'inner' : 'outer'
}

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
