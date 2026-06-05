import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface AboutPanelProps {
  open: boolean
  onClose: () => void
}

export default function AboutPanel({ open, onClose }: AboutPanelProps) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add('about-open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('about-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99990] flex items-end justify-center p-4 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[#020810]/75 backdrop-blur-sm"
        aria-hidden
      />

      <article
        className="relative z-10 flex max-h-[min(82vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-medium tracking-wide text-white sm:text-lg">
            写给深海的一页
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="关闭"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4 text-sm leading-[1.85] text-zinc-300 sm:text-[15px]">
          <p className="mb-5 text-zinc-200">
            贺峻霖的照片散落在网络的各个角落——舞台、练习室、日常、笑容。这个网站想做的，是把它们轻轻拢进同一片夜里，像把散落的星光收进掌心，再捧到你面前。
          </p>

          <section className="mb-6">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-teal-300/90">
              一片属于「深海」的夜海
            </h3>
            <p className="mb-3">
              粉丝叫深海，应援色叫春海月明。于是整站是深海底色的暗蓝，再晕开青绿与月银——不是炫目的灯牌，而是夜里抬头时，海面上那层安静又温柔的光。气泡缓缓上升，星点明灭，偶尔有流星划过，像陪他在同一片天空下多站了一会儿。
            </p>
            <p>
              进入网站时，会先等每一张照片都准备好，再慢慢潜入。那一路的靠近与旋转，是想把「去见他的路上」也留给你——不急着打断，只让你从远处一点一点游近那团光。
            </p>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-teal-300/90">
              藏在他身上的小事
            </h3>
            <p className="mb-3">
              场景里那些不太起眼的光点，都是刻意留下的记号：
            </p>
            <ul className="space-y-3">
              <li>
                <strong className="font-normal text-zinc-100">乒乓球</strong>
                — 橙白小光在远处绕圈，像他挂在嘴边的球桌，和那份说到就要做到的认真。
              </li>
              <li>
                <strong className="font-normal text-zinc-100">绘画与书法</strong>
                — 调色盘般的彩色微光，墨色轻轻飘动，是他安静画画、一笔一划写字时那种专注又柔软的样子。
              </li>
              <li>
                <strong className="font-normal text-zinc-100">火星</strong>
                — 偶尔闪过的暖红余烬，是他对华晨宇、对「火星」那份长久而赤诚的追随——喜欢一个人的时候，眼睛是会发光的。
              </li>
              <li>
                <strong className="font-normal text-zinc-100">美食</strong>
                — 暖黄微光，像他说起好吃的东西时，语气里藏不住的小雀跃。
              </li>
              <li>
                <strong className="font-normal text-zinc-100">指尖的爱心</strong>
                — 滑动屏幕时，会留下形态各异的爱心拖影。那些不好开口的喜欢，就让它留在经过的地方。
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-teal-300/90">
              环绕他的两种方式
            </h3>
            <p className="mb-3">
              照片可以围成一颗星体——许多瞬间环绕着他，像被温柔包围；也可以收成一颗立体爱心，正面朝向你的那一刻，像把「喜欢你」的形状，直接递到眼前。
            </p>
            <p>
              你可以在外侧远远地看着，也可以一路靠近、穿进相册深处；点开任意一张，它会从原来的位置轻轻展开——像在翻阅一本只关于他的记忆册，每一页都是某一刻真实的他。
            </p>
          </section>

          <p className="border-t border-white/10 pt-4 text-zinc-400">
            如果这些细节让你在某一刻觉得柔软，那这一页就达到了它想做的事——不是为了热闹，只是想认真地说：贺峻霖值得被这样温柔地记住。谢谢你来看他。
          </p>
        </div>
      </article>
    </div>,
    document.body,
  )
}
