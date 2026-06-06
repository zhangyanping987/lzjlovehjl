import { useEffect } from 'react'
import type { Photo } from '../data/photos'

const LOAD_TIMEOUT_MS = 15000

interface UsePhotoPreloadOptions {
  photos: Photo[]
  enabled: boolean
  onProgress: (loaded: number, failed: number, total: number) => void
}

export function usePhotoPreload({
  photos,
  enabled,
  onProgress,
}: UsePhotoPreloadOptions) {
  useEffect(() => {
    if (!enabled || photos.length === 0) return

    let loaded = 0
    let failed = 0
    const total = photos.length
    let cancelled = false
    const timers: number[] = []

    onProgress(0, 0, total)

    const report = () => {
      if (!cancelled) onProgress(loaded, failed, total)
    }

    for (const photo of photos) {
      const img = new Image()

      const timer = window.setTimeout(() => {
        if (cancelled || img.complete) return
        failed++
        report()
      }, LOAD_TIMEOUT_MS)
      timers.push(timer)

      img.onload = () => {
        window.clearTimeout(timer)
        if (cancelled) return
        loaded++
        report()
      }

      img.onerror = () => {
        window.clearTimeout(timer)
        if (cancelled) return
        failed++
        report()
      }

      img.src = photo.url
    }

    return () => {
      cancelled = true
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [photos, enabled, onProgress])
}
