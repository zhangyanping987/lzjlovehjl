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
      className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6"
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
            致「深海」的信
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

        <div className="overflow-y-auto px-5 py-4 text-sm leading-[1.85] text-zinc-300 sm:text-[15px] [&_p]:indent-[2em] [&_p.text-center]:indent-0">
          <p className="mb-3 text-zinc-200">
            生日快乐。这是一份独属于你的小礼物，我花心思把关于贺峻霖的许多瞬间收进深海倒映的一片星空，再捧到你面前。
          </p>
          <p className="mb-5 text-zinc-300">
            他的照片散落在网络的各个角落：舞台、练习室、日常、笑容。我想做的，是让你打开它时，可以拥有耐心，像收到一本只属于你的记忆册，或是可以慢慢翻阅的故事。
          </p>

          <section className="mb-6">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-teal-300/90">
              一片属于「深海」的夜海
            </h3>
            <p className="mb-3">
              粉丝叫深海，应援色叫春海月明。于是整站是深海底色的暗蓝，再晕开青绿与月银——不是炫目的灯牌，而是夜里抬头时，海面上那层安静又温柔的光。气泡缓缓上升，星点明灭，偶尔有流星划过，像陪他在同一片天空下多站了一会儿。
            </p>
            <p>
              进入深海时，会先等待他的每一个身影都准备好，再慢慢潜入。那一路的靠近与旋转，是想把「去见他的路上」的心情表达出来，就像跳动的心脏，由慢到快，由远到近，可以让你从远处一点一点游近那团光。
            </p>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-teal-300/90">
              他走过来的光
            </h3>
            <p className="mb-3">
              贺峻霖是时代少年团的一员。舞台上看起来的轻松，背后是从练习生时期一路练过来、等过来、熬过来的年月——那些没有上热搜的日子，同样真实，同样值得被记住。
            </p>
            <p className="mb-3">
              粉丝叫「深海」，不是没有来由：像在海面下陪他潜行，等一束光慢慢靠近。网站进入时要先等、再缓缓下沉，是想把那种「终于见到他」的心情留给你——不着急，不敷衍，像深海陪他走过来的那些日子一样，安静但有方向。
            </p>
            <p className="mb-3">
              应援色「春海月明」——春是希望，海是陪伴，月是远处仍亮着的那一点。整站用深海的暗蓝托底，再晕春海月明的青绿与月银，是把粉丝对他的祝愿写进颜色里：暗处有人同行，远处仍有光亮。
            </p>
            <p>
              相册里的照片，有舞台、有练习室、有日常——是他从少年走到现在的许多切面。你在外围绕着他转，或一路穿进深处，都像在翻阅他自己走过的路：不是只有高光，也有练习、等待和那些没被镜头完整记录、却真实发生过的时刻。
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

          <div className="border-t border-white/10 pt-4">
            <p className="mb-4 text-center text-zinc-300">
              也许不会每天都有惊喜，但是惊喜的是，每天都有你。
            </p>
            <p className="text-zinc-400">
              如果这些细节让你在某一刻觉得柔软，那这一页想做的事就完成了。贺峻霖值得被温柔地记住——而你，值得收到这样一份用心准备的礼物。希望你喜欢。
            </p>
          </div>
        </div>
      </article>
    </div>,
    document.body,
  )
}
