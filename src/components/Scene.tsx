import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { IntroContext } from '../context/IntroContext'
import { PerformanceProvider, usePerformance } from '../context/PerformanceContext'
import { type ViewMode } from '../context/ViewModeContext'
import type { Photo } from '../data/photos'
import type { ImageRect } from '../utils/lightboxRect'
import CameraViewTransition from './CameraViewTransition'
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
  viewMode: ViewMode
  onTransitionChange: (active: boolean) => void
  onViewModeChange?: (mode: ViewMode) => void
}

function SceneContent({
  photos,
  onSelect,
  onLoadProgress,
  onIntroProgress,
  onIntroComplete,
  interactive = true,
  assetsReady,
  viewMode,
  onTransitionChange,
  onViewModeChange,
}: SceneProps) {
  const [introDone, setIntroDone] = useState(false)
  const [introProgress, setIntroProgress] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const lastProgressUpdate = useRef(0)
  const introActive = assetsReady && !introDone
  const controlsEnabled = interactive && introDone

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

  const handleTransitionChange = useCallback(
    (active: boolean) => {
      setTransitioning(active)
      onTransitionChange(active)
    },
    [onTransitionChange],
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
          onSelect={onSelect}
          onLoadProgress={onLoadProgress}
          preloadAll={!assetsReady}
        />
      </IntroAnimation>
      <CameraViewTransition
        viewMode={viewMode}
        enabled={introDone}
        onTransitionChange={handleTransitionChange}
      />
      <SphereControls
        enabled={controlsEnabled}
        viewMode={viewMode}
        transitioning={transitioning}
        onViewModeChange={onViewModeChange}
      />
    </IntroContext.Provider>
  )
}

function SceneCanvas({
  interactive = true,
  viewMode,
  onTransitionChange,
  ...props
}: SceneProps) {
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
            viewMode={viewMode}
            onTransitionChange={onTransitionChange}
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
