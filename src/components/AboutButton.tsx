interface AboutButtonProps {
  onClick: () => void
}

export default function AboutButton({ onClick }: AboutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 text-sm text-zinc-200 backdrop-blur-sm transition hover:bg-white/10"
      aria-label="查看制作思路与艺术组成"
    >
      <span aria-hidden>✦</span>
      <span>说明</span>
    </button>
  )
}
