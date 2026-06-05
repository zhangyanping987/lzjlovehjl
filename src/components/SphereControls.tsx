import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import type { TrackballControls as TrackballControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import { VIEW_CONFIG, type ViewMode } from '../context/ViewModeContext'

/** 改这里即可生效 — 不要给 TrackballControls 传 rotateSpeed prop（会被 React 覆盖） */
export const CONTROL_CONFIG = {
  outerRotateSpeed: 1.2,
  innerRotateSpeed: 0.4,
  zoomSpeed: 1.2,
  dynamicDampingFactor: 0.08,
} as const

interface SphereControlsProps {
  enabled: boolean
  viewMode: ViewMode
  transitioning: boolean
  onViewModeChange?: (mode: ViewMode) => void
}

const SWITCH_COOLDOWN_MS = 900

export default function SphereControls({
  enabled,
  viewMode,
  transitioning,
  onViewModeChange,
}: SphereControlsProps) {
  const { camera } = useThree()
  const controlsRef = useRef<TrackballControlsImpl>(null)
  const origin = useRef(new Vector3())
  const viewModeRef = useRef(viewMode)
  const lastSwitchAt = useRef(0)

  const { minDistance, maxDistance } = VIEW_CONFIG[viewMode]
  const controlsEnabled = enabled && !transitioning

  // 允许缩放「越过」当前视角边界，再由 useFrame 触发视角切换
  const controlMin =
    viewMode === 'outer' ? VIEW_CONFIG.inner.minDistance : minDistance
  const controlMax =
    viewMode === 'inner' ? VIEW_CONFIG.outer.maxDistance : maxDistance
  const switchInBelow = VIEW_CONFIG.outer.minDistance
  const switchOutAbove = VIEW_CONFIG.inner.maxDistance

  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.zoomSpeed = CONTROL_CONFIG.zoomSpeed
    controls.dynamicDampingFactor = CONTROL_CONFIG.dynamicDampingFactor
    controls.minDistance = controlMin
    controls.maxDistance = controlMax
  }, [controlMin, controlMax])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls || !controlsEnabled) return

    const isInner = viewModeRef.current === 'inner'
    let speed = isInner
      ? CONTROL_CONFIG.innerRotateSpeed
      : CONTROL_CONFIG.outerRotateSpeed

    if (isInner) {
      speed *= -1
    }

    controls.rotateSpeed = speed
    controls.minDistance = controlMin
    controls.maxDistance = controlMax

    const distance = camera.position.distanceTo(origin.current)
    if (distance > 0.001) {
      const mode = viewModeRef.current
      const now = performance.now()
      const canSwitch = now - lastSwitchAt.current > SWITCH_COOLDOWN_MS

      if (canSwitch && onViewModeChange) {
        if (mode === 'outer' && distance < switchInBelow) {
          lastSwitchAt.current = now
          onViewModeChange('inner')
          return
        }
        if (mode === 'inner' && distance > switchOutAbove) {
          lastSwitchAt.current = now
          onViewModeChange('outer')
          return
        }
      }

      const clampMin = mode === 'outer' ? switchInBelow : minDistance
      const clampMax = mode === 'outer' ? maxDistance : switchOutAbove
      if (distance < clampMin || distance > clampMax) {
        const dir = camera.position.clone().normalize()
        const clamped = Math.max(clampMin, Math.min(clampMax, distance))
        camera.position.copy(dir).multiplyScalar(clamped)
        camera.lookAt(0, 0, 0)
      }
    }
  })

  return (
    <TrackballControls
      ref={controlsRef}
      enabled={controlsEnabled}
      zoomSpeed={CONTROL_CONFIG.zoomSpeed}
      staticMoving={false}
      dynamicDampingFactor={CONTROL_CONFIG.dynamicDampingFactor}
      minDistance={controlMin}
      maxDistance={controlMax}
      noPan
    />
  )
}
