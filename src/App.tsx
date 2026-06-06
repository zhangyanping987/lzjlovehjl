import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { loadPhotos, type Photo } from './data/photos'
import { getIntroMinReady } from './constants/loading'
import { useFullPhotoPreload } from './hooks/useFullPhotoPreload'
import { usePerformance } from './context/PerformanceContext'
import IntroOverlay from './components/IntroOverlay'
import Lightbox from './components/Lightbox'
import LoadingOverlay from './components/LoadingOverlay'
import HeartTrail from './components/HeartTrail'
import StarfieldBackground from './components/StarfieldBackground'
import ViewModeToggle from './components/ViewModeToggle'
import ShapeToggle from './components/ShapeToggle'
import AboutPanel from './components/AboutPanel'
import AboutButton from './components/AboutButton'
import type { ViewMode } from './context/ViewModeContext'
import type { AlbumShape } from './types/albumShape'
import type { ImageRect } from './utils/lightboxRect'

const Scene = lazy(() => import('./components/Scene'))

const LETTER_SEEN_KEY = 'lzjlovehjl-letter-seen'

function readLetterSeen() {
  try {
    return sessionStorage.getItem(LETTER_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markLetterSeen() {
  try {
    sessionStorage.setItem(LETTER_SEEN_KEY, '1')
  } catch {
    /* ignore */
  }
}

export default function App() {
  const { isMobile } = usePerformance()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(0)
  const [failed, setFailed] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxOrigin, setLightboxOrigin] = useState<ImageRect | null>(null)
  const [introProgress, setIntroProgress] = useState(0)
  const [introVisible, setIntroVisible] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('outer')
  const [snapRequest, setSnapRequest] = useState(0)
  const [snapTarget, setSnapTarget] = useState<ViewMode>('inner')
  const [viewTransitioning, setViewTransitioning] = useState(false)
  const [albumShape, setAlbumShape] = useState<AlbumShape>('sphere')
  const [faceFrontRequest, setFaceFrontRequest] = useState(0)
  const [aboutOpen, setAboutOpen] = useState(() => !readLetterSeen())
  const [letterDismissed, setLetterDismissed] = useState(() => readLetterSeen())

  const toggleAlbumShape = useCallback(() => {
    setAlbumShape((s) => {
      if (s === 'sphere') {
        setFaceFrontRequest((n) => n + 1)
      }
      return s === 'sphere' ? 'heart' : 'sphere'
    })
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  const toggleViewMode = useCallback(() => {
    if (viewTransitioning) return
    const next = viewMode === 'outer' ? 'inner' : 'outer'
    setViewMode(next)
    setSnapTarget(next)
    setSnapRequest((n) => n + 1)
  }, [viewMode, viewTransitioning])

  useEffect(() => {
    loadPhotos()
      .then((data) => {
        setPhotos(data)
        setLoaded(0)
        setFailed(0)
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setIsLoadingPhotos(false))
  }, [])

  const handleSceneLoadProgress = useCallback(
    (l: number, f: number, _total: number) => {
      setLoaded(l)
      setFailed(f)
    },
    [],
  )

  const handleAboutClose = useCallback(() => {
    setAboutOpen(false)
    if (!letterDismissed) {
      markLetterSeen()
      setLetterDismissed(true)
    }
  }, [letterDismissed])

  const introMinReady = getIntroMinReady(photos.length, isMobile)
  const readyCount = loaded + failed

  const assetsReady =
    !isLoadingPhotos && photos.length > 0 && readyCount >= introMinReady

  /** 读信期间后台挂载 3D（手机/桌面），分批加载缩略图 */
  const warmupScene = photos.length > 0 && !letterDismissed
  const mountScene = photos.length > 0
  const sceneVisible = letterDismissed

  useFullPhotoPreload({
    photos,
    enabled: letterDismissed && assetsReady && !introDone,
  })

  const handleSelect = useCallback(
    (_photo: Photo, index: number, origin: ImageRect) => {
      setLightboxOrigin(origin)
      setLightboxIndex(index)
    },
    [],
  )

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020810]">
      <StarfieldBackground />
      <HeartTrail enabled={introDone && lightboxIndex === null && !aboutOpen} />

      <AboutPanel open={aboutOpen} onClose={handleAboutClose} />

      {loadError ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div>
            <p className="text-red-400">{loadError}</p>
            <p className="mt-2 text-sm text-zinc-500">
              请先运行 npm run fetch-photos 生成 photos.json
            </p>
          </div>
        </div>
      ) : mountScene ? (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            visibility: sceneVisible ? 'visible' : 'hidden',
            pointerEvents: sceneVisible ? 'auto' : 'none',
          }}
        >
          <Suspense fallback={null}>
            <Scene
              photos={photos}
              onSelect={handleSelect}
              onLoadProgress={handleSceneLoadProgress}
              assetsReady={assetsReady}
              introEnabled={letterDismissed}
              warmup={warmupScene}
              albumShape={albumShape}
              faceFrontRequest={faceFrontRequest}
              snapRequest={snapRequest}
              snapTarget={snapTarget}
              onViewModeChange={handleViewModeChange}
              onTransitionChange={setViewTransitioning}
              onIntroComplete={() => setIntroDone(true)}
              onIntroProgress={(p) => {
                setIntroVisible(true)
                setIntroProgress(p)
                if (p >= 1) {
                  window.setTimeout(() => setIntroVisible(false), 400)
                }
              }}
              interactive={lightboxIndex === null && sceneVisible}
            />
          </Suspense>
        </div>
      ) : !isLoadingPhotos && photos.length === 0 ? (
        <div className="flex h-full items-center justify-center text-zinc-500">
          暂无图片，请运行 npm run fetch-photos
        </div>
      ) : null}

      <LoadingOverlay
        loaded={readyCount}
        failed={failed}
        total={photos.length}
        isLoadingPhotos={isLoadingPhotos}
        visible={letterDismissed && !assetsReady}
        hint={`${Math.min(readyCount, introMinReady)}/${introMinReady} 张缩略图就绪即可进入`}
      />

      <IntroOverlay visible={introVisible} progress={introProgress} />

      {introDone && lightboxIndex === null && (
        <>
          <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
            <AboutButton onClick={() => setAboutOpen(true)} />
          </div>
          <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
            <ShapeToggle
              shape={albumShape}
              onToggle={toggleAlbumShape}
              disabled={viewTransitioning}
            />
            <ViewModeToggle
              viewMode={viewMode}
              onToggle={toggleViewMode}
              disabled={viewTransitioning}
            />
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          originRect={lightboxOrigin}
          onClose={() => {
            setLightboxIndex(null)
            setLightboxOrigin(null)
          }}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </div>
  )
}
