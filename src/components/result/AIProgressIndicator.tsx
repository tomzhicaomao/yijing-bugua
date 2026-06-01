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
    <div className={`p-4 rounded-lg border ${isError ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
      <div className="flex items-center gap-3">
        {(progress === "reasoning" || progress === "narrative") && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
        <span className={`text-sm ${isError ? "text-red-700" : "text-blue-700"}`}>
          {PROGRESS_LABELS[progress]}
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
