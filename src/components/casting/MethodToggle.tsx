import type { CastingMethod } from '../../types'

interface MethodToggleProps {
  method: CastingMethod
  onChange: (m: CastingMethod) => void
}

export default function MethodToggle({ method, onChange }: MethodToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-parchment-dark rounded-lg p-1">
      <button
        onClick={() => onChange('virtual')}
        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all
          ${method === 'virtual'
            ? 'bg-white text-vermillion shadow-sm'
            : 'text-stone-500 hover:text-ink-light'
          }`}
      >
        虚拟摇卦
      </button>
      <button
        onClick={() => onChange('manual')}
        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all
          ${method === 'manual'
            ? 'bg-white text-vermillion shadow-sm'
            : 'text-stone-500 hover:text-ink-light'
          }`}
      >
        手动输入
      </button>
    </div>
  )
}
