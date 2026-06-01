import type { CastingMethod } from '../../types'

interface MethodToggleProps {
  method: CastingMethod
  onChange: (m: CastingMethod) => void
}

export default function MethodToggle({ method, onChange }: MethodToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('virtual')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
          ${method === 'virtual'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        虚拟摇卦
      </button>
      <button
        onClick={() => onChange('manual')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
          ${method === 'manual'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        手动输入
      </button>
    </div>
  )
}
