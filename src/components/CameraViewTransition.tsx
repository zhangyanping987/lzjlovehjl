import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { VIEW_CONFIG, type ViewMode } from '../context/ViewModeContext'

interface CameraViewTransitionProps {
  viewMode: ViewMode
  enabled: boolean
}

/** 仅按钮切换视角时瞬间定位，缩放不做过渡 */
export default function CameraViewTransition({
  viewMode,
  enabled,
}: CameraViewTransitionProps) {
  const { camera } = useThree()
  const direction = useRef(new Vector3())
  const prevMode = useRef<ViewMode | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (prevMode.current === null) {
      prevMode.current = viewMode
      return
    }
    if (prevMode.current === viewMode) return
    prevMode.current = viewMode

    const targetDist = VIEW_CONFIG[viewMode].distance
    const dist = camera.position.length()
    if (dist > 0.001) {
      direction.current.copy(camera.position).normalize()
    } else {
      direction.current.set(0, 0, 1)
    }
    camera.position.copy(direction.current).multiplyScalar(targetDist)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [viewMode, enabled, camera])

  return null
}
