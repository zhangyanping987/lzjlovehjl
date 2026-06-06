export interface Photo {
  url: string
  title: string
  /** 可选：搜图脚本写入的更小预览图 */
  thumbUrl?: string
}

export async function loadPhotos(): Promise<Photo[]> {
  const base = import.meta.env.BASE_URL
  const response = await fetch(`${base}photos.json`)
  if (!response.ok) {
    throw new Error('无法加载 photos.json')
  }
  const data = (await response.json()) as Photo[]
  return data.filter((p) => p.url && p.url.trim())
}
