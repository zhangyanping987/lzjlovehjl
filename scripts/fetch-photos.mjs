#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../public/photos.json')

/** 与百度联想词一致的关键词，提高相关度 */
const DEFAULT_KEYWORDS = [
  '贺峻霖图片',
  '贺峻霖 神仙颜值',
  '贺峻霖 神图',
  '贺峻霖 可爱',
  '贺峻霖 壁纸高清',
  '贺峻霖 高清 帅气',
  '贺峻霖 头像',
  '贺峻霖 可爱呆萌',
  '贺峻霖 可爱霖霖兔',
  '时代少年团 贺峻霖',
  'TNT 贺峻霖',
]

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function parseArgs(argv) {
  const opts = {
    keywords: [...DEFAULT_KEYWORDS],
    count: 150,
    fromFile: null,
    title: '贺峻霖',
    demo: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--keyword' && argv[i + 1]) {
      opts.keywords = [argv[++i]]
    } else if (arg === '--keywords' && argv[i + 1]) {
      opts.keywords = argv[++i].split(',').map((s) => s.trim()).filter(Boolean)
    } else if (arg === '--count' && argv[i + 1]) {
      opts.count = Math.max(1, parseInt(argv[++i], 10) || 150)
    } else if (arg === '--from-file' && argv[i + 1]) {
      opts.fromFile = argv[++i]
    } else if (arg === '--title' && argv[i + 1]) {
      opts.title = argv[++i]
    } else if (arg === '--demo') {
      opts.demo = true
    } else if (arg === '--help' || arg === '-h') {
      console.log(`用法:
  npm run fetch-photos -- [选项]

选项:
  --keyword <词>       单个搜索关键词
  --keywords <a,b,c>   多个关键词，逗号分隔
  --count <数量>       目标图片数量（默认: 150）
  --from-file <文件>   从文件读取 URL，与搜图结果合并
  --title <标题>       图片标题（默认: 贺峻霖）
  --demo               演示占位图（勿用于正式相册）

默认使用百度图片搜索，关键词已针对「贺峻霖 神图/壁纸/头像」等优化。

示例:
  npm run fetch-photos -- --count 150
  npm run fetch-photos -- --from-file urls.txt --count 200

链接失效后重新运行并 push public/photos.json 即可刷新。`)
      process.exit(0)
    }
  }

  return opts
}

function loadUrlsFromFile(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`文件不存在: ${filePath}`)
    return []
  }
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.startsWith('http'))
}

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http')) return false
  const lower = url.toLowerCase()
  if (lower.includes('favicon') || lower.endsWith('.svg')) return false
  if (lower.includes('emoji') || lower.includes('icon')) return false
  return true
}

function pickBestUrl(item) {
  const candidates = [
    item.middleURL,
    item.hoverURL,
    item.thumbURL,
    item.replaceUrl,
  ].filter(isValidImageUrl)
  return candidates[0] || null
}

function parseBaiduJson(text) {
  const cleaned = text
    .replace(/[\x00-\x1f]/g, (ch) => (ch === '\n' || ch === '\r' || ch === '\t' ? ch : ''))
    .replace(/\\'/g, "'")
  return JSON.parse(cleaned)
}

async function fetchWithBaidu(keyword, maxResults) {
  const urls = []
  const pageSize = 30

  for (let page = 0; page < 8 && urls.length < maxResults; page++) {
    const pn = page * pageSize
    const params = new URLSearchParams({
      tn: 'resultjson_com',
      logid: String(Date.now()),
      ipn: 'rj',
      ct: '201326592',
      fp: 'result',
      word: keyword,
      queryWord: keyword,
      cl: '2',
      lm: '-1',
      ie: 'utf-8',
      oe: 'utf-8',
      pn: String(pn),
      rn: String(pageSize),
      gsm: '1e',
    })

    const apiUrl = `https://image.baidu.com/search/acjson?${params}&${Date.now()}=1`
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'https://image.baidu.com/',
        Accept: 'application/json, text/plain, */*',
      },
    })

    if (!res.ok) throw new Error(`百度请求失败: ${res.status}`)

    const text = await res.text()
    let data
    try {
      data = parseBaiduJson(text)
    } catch {
      throw new Error(`百度返回解析失败: "${keyword}"`)
    }

    const items = (data.data || []).filter(Boolean)
    if (items.length === 0) break

    for (const item of items) {
      const url = pickBestUrl(item)
      if (!url) continue

      const w = Number(item.width) || 0
      const h = Number(item.height) || 0
      if ((w > 0 && w < 150) || (h > 0 && h < 150)) continue

      urls.push(url)
      if (urls.length >= maxResults) break
    }

    if (items.length < pageSize) break
    await new Promise((r) => setTimeout(r, 800))
  }

  return urls
}

async function searchImagesForKeyword(keyword, maxPerKeyword) {
  console.log(`  搜索: "${keyword}" ...`)
  try {
    const urls = await fetchWithBaidu(keyword, maxPerKeyword)
    console.log(`    找到 ${urls.length} 张`)
    return urls
  } catch (err) {
    console.warn(`    失败: ${err.message}`)
    return []
  }
}

function generateDemoPhotos(count, title) {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/hjl-${i + 1}/400/400`,
    title,
  }))
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const urlSet = new Set()
  const photos = []

  if (opts.demo) {
    const demo = generateDemoPhotos(opts.count, opts.title)
    writeFileSync(OUT_PATH, JSON.stringify(demo, null, 2), 'utf-8')
    console.log(`\n演示模式: 写入 ${demo.length} 张（非贺峻霖真实图片）`)
    console.log('正式使用请运行: npm run fetch-photos -- --count 150')
    return
  }

  if (opts.fromFile) {
    const fileUrls = loadUrlsFromFile(opts.fromFile)
    console.log(`从文件读取 ${fileUrls.length} 个 URL`)
    for (const url of fileUrls) {
      if (!urlSet.has(url)) {
        urlSet.add(url)
        photos.push({ url, title: opts.title })
      }
    }
  }

  const need = opts.count - photos.length
  if (need > 0) {
    console.log(`\n百度图片搜图，目标 ${opts.count} 张（已有 ${photos.length}）\n`)
    const perKeyword = Math.ceil(need / opts.keywords.length) + 15

    for (const keyword of opts.keywords) {
      if (photos.length >= opts.count) break
      const urls = await searchImagesForKeyword(keyword, perKeyword)
      for (const url of urls) {
        if (photos.length >= opts.count) break
        if (!urlSet.has(url)) {
          urlSet.add(url)
          photos.push({ url, title: opts.title })
        }
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  if (photos.length === 0) {
    console.error('\n未找到任何图片。可尝试:')
    console.error('  npm run fetch-photos -- --from-file urls.txt')
    process.exit(1)
  }

  writeFileSync(OUT_PATH, JSON.stringify(photos, null, 2), 'utf-8')
  console.log(`\n完成! 写入 ${photos.length} 张贺峻霖相关图片 -> ${OUT_PATH}`)
  console.log('推送: git add public/photos.json && git commit -m "refresh photo urls" && git push')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
