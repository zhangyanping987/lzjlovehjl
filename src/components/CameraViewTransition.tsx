import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { VIEW_CONFIG, type ViewMode } from '../context/ViewModeContext'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

interface CameraViewTransitionProps {
  viewMode: ViewMode
  enabled: boolean
  onTransitionChange: (active: boolean) => void
}

export default function CameraViewTransition({
  viewMode,
  enabled,
  onTransitionChange,
}: CameraViewTransitionProps) {
  const { camera } = useThree()
  const direction = useRef(new Vector3())
  const fromDistance = useRef(0)
  const toDistance = useRef<number>(VIEW_CONFIG.outer.distance)
  const progress = useRef(1)
  const prevMode = useRef<ViewMode>(viewMode)

  useEffect(() => {
    if (!enabled) return
    if (prevMode.current === viewMode && progress.current >= 1) return

    prevMode.current = viewMode
    const dist = camera.position.length()
    if (dist > 0.001) {
      direction.current.copy(camera.position).normalize()
    } else {
      direction.current.set(0, 0, 1)
    }
    fromDistance.current = dist
    toDistance.current = VIEW_CONFIG[viewMode].distance
    progress.current = 0
    onTransitionChange(true)
  }, [viewMode, enabled, camera, onTransitionChange])

  useFrame((_, delta) => {
    if (!enabled || progress.current >= 1) return

    progress.current = Math.min(
      1,
      progress.current + delta / VIEW_CONFIG.transitionDuration,
    )
    const t = easeInOutCubic(progress.current)
    const d =
      fromDistance.current +
      (toDistance.current - fromDistance.current) * t

    camera.position.copy(direction.current).multiplyScalar(d)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    if (progress.current >= 1) {
      onTransitionChange(false)
    }
  })

  return null
}
