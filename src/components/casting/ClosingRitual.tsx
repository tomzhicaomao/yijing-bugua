/**
 * 谢卦仪式 — 一卦已毕，事有回环
 */

interface Props {
  feedbackDueDays?: number
  onClose: () => void
}

export function ClosingRitual({ feedbackDueDays = 14, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nothing-bg/95 backdrop-blur-sm animate-fade-in">
      <div className="text-center px-8 max-w-sm">
        <div className="w-12 h-12 mx-auto mb-8 rounded-full border border-nothing-accent/30 flex items-center justify-center">
          <span className="text-nothing-accent/60 text-lg">☰</span>
        </div>
        <p className="text-nothing-text-primary text-lg tracking-wider mb-3">一卦已毕</p>
        <p className="text-nothing-text-secondary text-sm tracking-wider mb-8 leading-relaxed">卦有终始，事有回环</p>
        <p className="text-nothing-text-tertiary text-xs tracking-widest mb-10 leading-relaxed">{feedbackDueDays} 天后将收到反馈提醒</p>
        <button className="w-10 h-10 flex items-center justify-center mx-auto text-nothing-text-tertiary hover:text-nothing-text-primary transition-colors" onClick={onClose} aria-label="关闭">✕</button>
      </div>
    </div>
  )
}
