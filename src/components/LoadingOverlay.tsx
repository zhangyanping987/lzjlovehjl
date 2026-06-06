interface LoadingOverlayProps {
  loaded: number
  failed: number
  total: number
  isLoadingPhotos: boolean
  visible?: boolean
}

export default function LoadingOverlay({
  loaded,
  failed,
  total,
  isLoadingPhotos,
  visible = true,
}: LoadingOverlayProps) {
  const done = loaded + failed
  const allReady = !isLoadingPhotos && total > 0 && done >= total

  if (!visible || allReady) return null

  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  const waitingForIntro = !isLoadingPhotos && total > 0

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#020810]/90 backdrop-blur-sm">
      <div className="w-[min(90vw,320px)] text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-sm text-zinc-300">
          {isLoadingPhotos
            ? '加载相册数据...'
            : waitingForIntro
              ? '图片加载中，即将开始动画...'
              : '图片加载中...'}
        </p>
        {!isLoadingPhotos && total > 0 && (
          <>
            <p className="mt-2 text-xs text-zinc-500">
              {loaded}/{total}
              {failed > 0 && ` · ${failed} 张失败`}
            </p>
            <div className="mx-auto mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
