import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Photo } from '../data/photos'
import type { ImageRect } from '../utils/lightboxRect'
import { fibonacciSphere } from '../utils/fibonacciSphere'
import FacingCenter from './FacingCenter'
import PhotoNode from './PhotoNode'

const SPHERE_RADIUS = 12
const BATCH_SIZE = 30

interface PhotoSphereProps {
  photos: Photo[]
  onSelect: (photo: Photo, index: number, origin: ImageRect) => void
  onLoadProgress: (loaded: number, failed: number, total: number) => void
  preloadAll?: boolean
}

function depthToZIndex(dot: number) {
  const normalized = (dot + SPHERE_RADIUS) / (SPHERE_RADIUS * 2)
  return Math.round(Math.max(0, Math.min(1, normalized)) * 1000)
}

export default function PhotoSphere({
  photos,
  onSelect,
  onLoadProgress,
  preloadAll = false,
}: PhotoSphereProps) {
  const { camera } = useThree()
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [loadedCount, setLoadedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [depthZByIndex, setDepthZByIndex] = useState<number[]>([])
  const cameraDir = useMemo(() => new Vector3(), [])
  const depthBuffer = useRef<number[]>([])

  const positions = useMemo(
    () => fibonacciSphere(photos.length, SPHERE_RADIUS),
    [photos.length],
  )

  useEffect(() => {
    setLoadedCount(0)
    setFailedCount(0)
    depthBuffer.current = new Array(photos.length).fill(500)
    setDepthZByIndex(new Array(photos.length).fill(500))
    setVisibleCount(Math.min(BATCH_SIZE, photos.length))
  }, [photos])

  useEffect(() => {
    if (preloadAll) {
      setVisibleCount(photos.length)
    }
  }, [preloadAll, photos.length])

  useEffect(() => {
    if (preloadAll || visibleCount >= photos.length) return

    const scheduleNext = () => {
      setVisibleCount((c) => Math.min(c + BATCH_SIZE, photos.length))
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(scheduleNext, { timeout: 500 })
      return () => window.cancelIdleCallback(id)
    }

    const id = globalThis.setTimeout(scheduleNext, 100)
    return () => globalThis.clearTimeout(id)
  }, [visibleCount, photos.length, preloadAll])

  useEffect(() => {
    onLoadProgress(loadedCount, failedCount, photos.length)
  }, [loadedCount, failedCount, photos.length, onLoadProgress])

  useFrame(() => {
    cameraDir.copy(camera.position).normalize()

    let changed = false
    const next = depthBuffer.current

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      if (!pos) continue
      const z = depthToZIndex(pos.dot(cameraDir))
      if (next[i] !== z) {
        next[i] = z
        changed = true
      }
    }

    if (changed) {
      setDepthZByIndex([...next])
    }
  })

  const visibleIndices = useMemo(() => {
    const count = Math.min(visibleCount, photos.length)
    return Array.from({ length: photos.length }, (_, i) => i)
      .slice(0, count)
      .sort((a, b) => (depthZByIndex[a] ?? 0) - (depthZByIndex[b] ?? 0))
  }, [visibleCount, photos.length, depthZByIndex])

  return (
    <group>
      {visibleIndices.map((index) => {
        const pos = positions[index]
        if (!pos) return null
        const photo = photos[index]

        return (
          <FacingCenter key={`${photo.url}-${index}`} position={pos}>
            <PhotoNode
              photo={photo}
              photoIndex={index}
              position={[0, 0, 0]}
              depthZ={depthZByIndex[index] ?? 500}
              onSelect={onSelect}
              onLoad={() => setLoadedCount((c) => c + 1)}
              onError={() => setFailedCount((c) => c + 1)}
            />
          </FacingCenter>
        )
      })}
    </group>
  )
}
