import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HexagramBoard from '../../../src/components/casting/HexagramBoard.js'
import type { } from '../../../src/types'

vi.mock('../../../src/lib/gsap.js', () => ({
  gsap: { from: vi.fn(), to: vi.fn(), fromTo: vi.fn() },
  useGSAP: () => {},
}))
vi.mock('../../../src/hooks/useReducedMotion.js', () => ({ useReducedMotion: () => false }))

describe('HexagramBoard', () => {
  it('渲染所有行标', () => {
    render(<HexagramBoard lines={[7, 8, 7, 8, 7, 8]} />)
    expect(screen.getByText('初爻')).toBeInTheDocument()
    expect(screen.getByText('上爻')).toBeInTheDocument()
  })
  it('显示爻值', () => {
    render(<HexagramBoard lines={[7, 8, 7, 8, 7, 8]} />)
    expect(screen.getAllByText('少阳 ⚊')).toHaveLength(3)
    expect(screen.getAllByText('少阴 ⚋')).toHaveLength(3)
  })
  it('null 显示占位符', () => {
    render(<HexagramBoard lines={[null, null, null, null, null, null]} />)
    expect(screen.getAllByText('·····')).toHaveLength(6)
  })
  it('hexagramName 显示卦名', () => {
    render(<HexagramBoard lines={[7, 7, 7, 7, 7, 7]} hexagramName="乾为天" />)
    expect(screen.getByText('乾为天')).toBeInTheDocument()
  })
  it('动爻显示"动"标签', () => {
    render(<HexagramBoard lines={[6, 8, 8, 8, 8, 8]} changingLinePositions={[1]} />)
    expect(screen.getAllByText('动')).toHaveLength(1)
  })
})
