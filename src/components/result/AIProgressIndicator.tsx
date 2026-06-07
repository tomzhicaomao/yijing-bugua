import type { AIProgress } from "../../ai/double-call.js"

interface AIProgressIndicatorProps {
  progress: AIProgress
  error: string | null
}

const PROGRESS_LABELS: Record<AIProgress, string> = {
  idle: "",
  reasoning: "AI 正在分析卦象...",
  narrative: "正在生成解读...",
  done: "解读完成",
  error: "解读失败",
}

export default function AIProgressIndicator({ progress, error }: AIProgressIndicatorProps) {
  if (progress === "idle") return null

  const isError = progress === "error"

  return (
    <div className={`p-4 rounded-lg border ${isError ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-gold/20"}`}>
      <div className="flex items-center gap-3">
        {(progress === "reasoning" || progress === "narrative") && (
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        )}
        <span className={`text-sm ${isError ? "text-red-400" : "text-gold"}`}>
          {PROGRESS_LABELS[progress]}
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
