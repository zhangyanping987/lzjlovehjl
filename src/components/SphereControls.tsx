import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import type { TrackballControls as TrackballControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import {
  VIEW_CONFIG,
  viewModeFromDistance,
  type ViewMode,
} from '../context/ViewModeContext'

/** 改这里即可生效 — 不要给 TrackballControls 传 rotateSpeed prop（会被 React 覆盖） */
export const CONTROL_CONFIG = {
  outerRotateSpeed: 1.2,
  innerRotateSpeed: 0.4,
  zoomSpeed: 1.2,
  dynamicDampingFactor: 0.08,
} as const

interface SphereControlsProps {
  enabled: boolean
  onViewModeChange?: (mode: ViewMode) => void
}

export default function SphereControls({
  enabled,
  onViewModeChange,
}: SphereControlsProps) {
  const { camera } = useThree()
  const controlsRef = useRef<TrackballControlsImpl>(null)
  const origin = useRef(new Vector3())
  const zoneRef = useRef<ViewMode>('outer')

  const { zoomMin, zoomMax } = VIEW_CONFIG

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.zoomSpeed = CONTROL_CONFIG.zoomSpeed
    controls.dynamicDampingFactor = CONTROL_CONFIG.dynamicDampingFactor
    controls.minDistance = zoomMin
    controls.maxDistance = zoomMax
  }, [zoomMin, zoomMax])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls || !enabled) return

    const distance = camera.position.distanceTo(origin.current)

    const zone = viewModeFromDistance(distance)
    if (zone !== zoneRef.current) {
      zoneRef.current = zone
      onViewModeChange?.(zone)
    }

    const isInner = zone === 'inner'
    let speed = isInner
      ? CONTROL_CONFIG.innerRotateSpeed
      : CONTROL_CONFIG.outerRotateSpeed
    if (isInner) {
      speed *= -1
    }

    controls.rotateSpeed = speed
    controls.minDistance = zoomMin
    controls.maxDistance = zoomMax

    if (distance > 0.001 && (distance < zoomMin || distance > zoomMax)) {
      const dir = camera.position.clone().normalize()
      const clamped = Math.max(zoomMin, Math.min(zoomMax, distance))
      camera.position.copy(dir).multiplyScalar(clamped)
      camera.lookAt(0, 0, 0)
    }
  })

  return (
    <TrackballControls
      ref={controlsRef}
      enabled={enabled}
      zoomSpeed={CONTROL_CONFIG.zoomSpeed}
      staticMoving={false}
      dynamicDampingFactor={CONTROL_CONFIG.dynamicDampingFactor}
      minDistance={zoomMin}
      maxDistance={zoomMax}
      noPan
    />
  )
}
