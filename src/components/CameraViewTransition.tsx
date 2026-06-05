import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { VIEW_CONFIG, type ViewMode } from '../context/ViewModeContext'

interface CameraViewTransitionProps {
  snapRequest: number
  snapTarget: ViewMode
  enabled: boolean
}

/** 仅底部按钮触发瞬间跳转，手动缩放不经过此组件 */
export default function CameraViewTransition({
  snapRequest,
  snapTarget,
  enabled,
}: CameraViewTransitionProps) {
  const { camera } = useThree()
  const direction = useRef(new Vector3())

  useEffect(() => {
    if (!enabled || snapRequest === 0) return

    const targetDist =
      snapTarget === 'inner'
        ? VIEW_CONFIG.inner.distance
        : VIEW_CONFIG.outer.distance

    const dist = camera.position.length()
    if (dist > 0.001) {
      direction.current.copy(camera.position).normalize()
    } else {
      direction.current.set(0, 0, 1)
    }
    camera.position.copy(direction.current).multiplyScalar(targetDist)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [snapRequest, snapTarget, enabled, camera])

  return null
}
