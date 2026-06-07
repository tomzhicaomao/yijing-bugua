import { useState } from 'react'

interface CoinProps {
  onFlip?: (value: number) => void
}

export default function Coin({ onFlip }: CoinProps) {
  const [isFlipping, setIsFlipping] = useState(false)

  const handleFlip = () => {
    if (isFlipping) return

    setIsFlipping(true)

    setTimeout(() => {
      // 随机生成 0-3 的背面数量
      const backs = Math.floor(Math.random() * 4)
      setIsFlipping(false)
      onFlip?.(backs)
    }, 1000)
  }

  return (
    <div
      className={`coin cursor-pointer ${isFlipping ? 'flipping' : ''}`}
      onClick={handleFlip}
    />
  )
}
