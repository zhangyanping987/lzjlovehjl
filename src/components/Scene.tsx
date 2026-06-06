import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { IntroContext } from '../context/IntroContext'
import { PerformanceProvider, usePerformance } from '../context/PerformanceContext'
import { type ViewMode } from '../context/ViewModeContext'
import type { AlbumShape } from '../types/albumShape'
import type { Photo } from '../data/photos'
import type { ImageRect } from '../utils/lightboxRect'
import CameraViewTransition from './CameraViewTransition'
import CameraFaceFront from './CameraFaceFront'
import IntroAnimation from './IntroAnimation'
import SceneEffects from './SceneEffects'
import PhotoSphere from './PhotoSphere'
import SphereControls from './SphereControls'

interface SceneProps {
  photos: Photo[]
  onSelect: (photo: Photo, index: number, origin: ImageRect) => void
  onLoadProgress: (loaded: number, failed: number, total: number) => void
  onIntroProgress?: (progress: number) => void
  onIntroComplete?: () => void
  interactive?: boolean
  assetsReady: boolean
  introEnabled?: boolean
  albumShape: AlbumShape
  snapRequest: number
  snapTarget: ViewMode
  faceFrontRequest: number
  onViewModeChange?: (mode: ViewMode) => void
  onTransitionChange?: (active: boolean) => void
}

function SceneContent({
  photos,
  onSelect,
  onLoadProgress,
  onIntroProgress,
  onIntroComplete,
  interactive = true,
  assetsReady,
  introEnabled = true,
  albumShape,
  snapRequest,
  snapTarget,
  faceFrontRequest,
  onViewModeChange,
  onTransitionChange,
}: SceneProps) {
  const [introDone, setIntroDone] = useState(false)
  const [introProgress, setIntroProgress] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const transitionLocks = useRef(0)
  const lastProgressUpdate = useRef(0)
  const introActive = assetsReady && introEnabled && !introDone
  const controlsEnabled = interactive && introDone && !transitioning

  const handleTransitionChange = useCallback(
    (active: boolean) => {
      if (active) {
        transitionLocks.current += 1
        if (transitionLocks.current === 1) {
          setTransitioning(true)
          onTransitionChange?.(true)
        }
        return
      }

      transitionLocks.current = Math.max(0, transitionLocks.current - 1)
      if (transitionLocks.current === 0) {
        setTransitioning(false)
        onTransitionChange?.(false)
      }
    },
    [onTransitionChange],
  )

  const handleIntroProgress = useCallback(
    (progress: number) => {
      const now = performance.now()
      if (now - lastProgressUpdate.current > 32 || progress >= 1) {
        lastProgressUpdate.current = now
        setIntroProgress(progress)
        onIntroProgress?.(progress)
      }
    },
    [onIntroProgress],
  )

  return (
    <IntroContext.Provider
      value={{ progress: introProgress, active: introActive, done: introDone }}
    >
      <ambientLight intensity={0.45} />
      <SceneEffects />
      <IntroAnimation
        active={introActive}
        onProgress={handleIntroProgress}
        onComplete={() => {
          setIntroProgress(1)
          onIntroProgress?.(1)
          setIntroDone(true)
          onIntroComplete?.()
        }}
      >
        <PhotoSphere
          photos={photos}
          shape={albumShape}
          onSelect={onSelect}
          onLoadProgress={onLoadProgress}
          preloadAll={!assetsReady}
        />
      </IntroAnimation>
      <CameraViewTransition
        snapRequest={snapRequest}
        snapTarget={snapTarget}
        enabled={introDone}
        onTransitionChange={handleTransitionChange}
      />
      <CameraFaceFront
        request={faceFrontRequest}
        enabled={introDone}
        onTransitionChange={handleTransitionChange}
      />
      <SphereControls
        enabled={controlsEnabled}
        suspendViewSync={transitioning}
        onViewModeChange={onViewModeChange}
      />
    </IntroContext.Provider>
  )
}

function SceneCanvas({ interactive = true, ...props }: SceneProps) {
  const { isMobile } = usePerformance()

  return (
    <div
      className="absolute inset-0 z-[1] transition-opacity duration-200"
      style={{
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 42], fov: 60 }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            {...props}
            interactive={interactive}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default function Scene(props: SceneProps) {
  return (
    <PerformanceProvider>
      <SceneCanvas {...props} />
    </PerformanceProvider>
  )
}
