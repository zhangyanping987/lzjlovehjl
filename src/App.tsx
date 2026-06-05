import { useCallback, useEffect, useState } from 'react'
import { loadPhotos, type Photo } from './data/photos'
import Scene from './components/Scene'
import IntroOverlay from './components/IntroOverlay'
import Lightbox from './components/Lightbox'
import LoadingOverlay from './components/LoadingOverlay'
import HeartTrail from './components/HeartTrail'
import StarfieldBackground from './components/StarfieldBackground'
import ViewModeToggle from './components/ViewModeToggle'
import type { ViewMode } from './context/ViewModeContext'
import type { ImageRect } from './utils/lightboxRect'

export default function App() {
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
  const [viewTransitioning, setViewTransitioning] = useState(false)

  const toggleViewMode = useCallback(() => {
    setViewMode((m) => (m === 'outer' ? 'inner' : 'outer'))
  }, [])

  useEffect(() => {
    loadPhotos()
      .then(setPhotos)
      .catch((err) => setLoadError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setIsLoadingPhotos(false))
  }, [])

  const handleLoadProgress = useCallback(
    (l: number, f: number, _total: number) => {
      setLoaded(l)
      setFailed(f)
    },
    [],
  )

  const assetsReady =
    !isLoadingPhotos && photos.length > 0 && loaded + failed >= photos.length

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
      <HeartTrail enabled={introDone} />
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-[#020810] to-transparent px-4 py-5 text-center">
        <h1 className="text-lg font-medium tracking-wide text-white sm:text-xl">
          贺峻霖 · 3D 相册
        </h1>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          {photos.length > 0 ? `${photos.length} 张照片` : '立体球体相册'}
        </p>
      </header>

      {loadError ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div>
            <p className="text-red-400">{loadError}</p>
            <p className="mt-2 text-sm text-zinc-500">
              请先运行 npm run fetch-photos 生成 photos.json
            </p>
          </div>
        </div>
      ) : photos.length > 0 ? (
        <Scene
          photos={photos}
          onSelect={handleSelect}
          onLoadProgress={handleLoadProgress}
          assetsReady={assetsReady}
          viewMode={viewMode}
          onTransitionChange={setViewTransitioning}
          onIntroComplete={() => setIntroDone(true)}
          onIntroProgress={(p) => {
            setIntroVisible(true)
            setIntroProgress(p)
            if (p >= 1) {
              window.setTimeout(() => setIntroVisible(false), 400)
            }
          }}
          interactive={lightboxIndex === null}
        />
      ) : !isLoadingPhotos ? (
        <div className="flex h-full items-center justify-center text-zinc-500">
          暂无图片，请运行 npm run fetch-photos
        </div>
      ) : null}

      <LoadingOverlay
        loaded={loaded}
        failed={failed}
        total={photos.length}
        isLoadingPhotos={isLoadingPhotos}
      />

      <IntroOverlay visible={introVisible} progress={introProgress} />

      {introDone && lightboxIndex === null && (
        <div className="pointer-events-none absolute bottom-16 left-0 right-0 z-20 flex justify-center sm:bottom-20">
          <ViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            disabled={viewTransitioning}
          />
        </div>
      )}

      <footer className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#020810] to-transparent px-4 py-4 text-center">
        <p className="text-xs text-zinc-500 sm:text-sm">
          拖拽旋转 · 滚轮缩放 · 点击图片查看 · 切换球内/球外视角
        </p>
      </footer>

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
