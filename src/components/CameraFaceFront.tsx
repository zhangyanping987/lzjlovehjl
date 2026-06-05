import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { VIEW_CONFIG } from '../context/ViewModeContext'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

const FRONT = new Vector3(0, 0, 1)

interface CameraFaceFrontProps {
  request: number
  enabled: boolean
  onTransitionChange: (active: boolean) => void
}

/** 切换到爱心时，镜头平滑转到正面（+Z 方向） */
export default function CameraFaceFront({
  request,
  enabled,
  onTransitionChange,
}: CameraFaceFrontProps) {
  const { camera } = useThree()
  const from = useRef(new Vector3())
  const to = useRef(new Vector3())
  const progress = useRef(1)
  const animating = useRef(false)

  useEffect(() => {
    if (!enabled || request === 0) return

    const distance = Math.max(
      VIEW_CONFIG.zoomMin,
      Math.min(VIEW_CONFIG.zoomMax, camera.position.length()),
    )

    from.current.copy(camera.position)
    to.current.copy(FRONT).multiplyScalar(distance)
    progress.current = 0
    animating.current = true
    onTransitionChange(true)
  }, [request, enabled, camera, onTransitionChange])

  useFrame((_, delta) => {
    if (!enabled || !animating.current) return

    progress.current = Math.min(
      1,
      progress.current + delta / VIEW_CONFIG.transitionDuration,
    )
    const t = easeInOutCubic(progress.current)

    camera.position.lerpVectors(from.current, to.current, t)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    if (progress.current >= 1) {
      animating.current = false
      onTransitionChange(false)
    }
  })

  return null
}
