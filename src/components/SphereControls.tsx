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
}

export default function SphereControls({
  enabled,
  viewMode,
  transitioning,
}: SphereControlsProps) {
  const { camera } = useThree()
  const controlsRef = useRef<TrackballControlsImpl>(null)
  const origin = useRef(new Vector3())
  const viewModeRef = useRef(viewMode)

  const { minDistance, maxDistance } = VIEW_CONFIG[viewMode]
  const controlsEnabled = enabled && !transitioning

  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.zoomSpeed = CONTROL_CONFIG.zoomSpeed
    controls.dynamicDampingFactor = CONTROL_CONFIG.dynamicDampingFactor
    controls.minDistance = minDistance
    controls.maxDistance = maxDistance
  }, [minDistance, maxDistance])

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
    controls.minDistance = minDistance
    controls.maxDistance = maxDistance

    // 防止滚轮越界到另一视角
    const distance = camera.position.distanceTo(origin.current)
    if (distance > 0.001 && (distance < minDistance || distance > maxDistance)) {
      const dir = camera.position.clone().normalize()
      const clamped = Math.max(minDistance, Math.min(maxDistance, distance))
      camera.position.copy(dir).multiplyScalar(clamped)
      camera.lookAt(0, 0, 0)
    }
  })

  return (
    <TrackballControls
      ref={controlsRef}
      enabled={controlsEnabled}
      zoomSpeed={CONTROL_CONFIG.zoomSpeed}
      staticMoving={false}
      dynamicDampingFactor={CONTROL_CONFIG.dynamicDampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      noPan
    />
  )
}
