import { useState, type MouseEvent } from 'react'
import { Html } from '@react-three/drei'
import { useIntro } from '../context/IntroContext'
import type { Photo } from '../data/photos'
import type { ImageRect } from '../utils/lightboxRect'
import { rectFromDOM } from '../utils/lightboxRect'

interface PhotoNodeProps {
  photo: Photo
  photoIndex: number
  position: [number, number, number]
  depthZ: number
  onSelect: (photo: Photo, index: number, origin: ImageRect) => void
  onLoad: () => void
  onError: () => void
}

export default function PhotoNode({
  photo,
  photoIndex,
  position,
  depthZ,
  onSelect,
  onLoad,
  onError,
}: PhotoNodeProps) {

  const { active: introActive, progress } = useIntro()
  const [hovered, setHovered] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const revealStart = 0.1 + (photoIndex % 9) * 0.012
  const reveal = introActive
    ? Math.max(0, Math.min(1, (progress - revealStart) / 0.38))
    : 1
  const displayOpacity = loaded ? reveal : 0

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!failed) {
      onSelect(photo, photoIndex, rectFromDOM(e.currentTarget.getBoundingClientRect()))
    }
  }

  const size = hovered ? 96 : 72

  return (
    <group position={position}>
      <Html
        center
        transform
        sprite
        occlude="blending"
        distanceFactor={10}
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[depthZ, depthZ]}
      >
        <div
          className="relative cursor-pointer select-none transition-transform duration-200"
          style={{
            width: size,
            height: size,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {!loaded && !failed && (
            <div
              className="absolute inset-0 rounded-lg bg-zinc-800 animate-pulse"
              style={{ width: size, height: size }}
            />
          )}
          {failed ? (
            <div
              className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-[10px] text-zinc-500"
              style={{ width: size, height: size }}
            >
              加载失败
            </div>
          ) : (
            <img
              src={photo.url}
              alt={photo.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              draggable={false}
              className="rounded-lg object-cover shadow-lg shadow-black/50 ring-1 ring-white/10"
              style={{
                width: size,
                height: size,
                opacity: displayOpacity,
                filter:
                  introActive && reveal < 1
                    ? `brightness(${1 + (1 - reveal) * 0.9}) saturate(${0.7 + reveal * 0.3})`
                    : undefined,
                boxShadow:
                  introActive && reveal > 0 && reveal < 1
                    ? `0 0 ${12 + reveal * 20}px rgba(192,132,252,${0.35 * reveal})`
                    : undefined,
                transition: introActive ? 'opacity 0.15s, filter 0.15s' : 'opacity 0.3s',
              }}
              onLoad={() => {
                setLoaded(true)
                onLoad()
              }}
              onError={() => {
                setFailed(true)
                onError()
              }}
            />
          )}
        </div>
      </Html>
    </group>
  )
}
