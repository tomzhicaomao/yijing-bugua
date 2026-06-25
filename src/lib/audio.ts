/**
 * 铜钱音效合成（Web Audio API）
 *
 * 程序化合成，零外部音频文件
 * - toss:  掷钱金属碰撞 (100ms)
 * - land:  落钱木桌碰击 (150ms)
 * - confirm: 爻位确认低频声 (200ms)
 *
 * 降级: Web Audio API 不支持 → 静默运行
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (audioCtx) return audioCtx
  try { audioCtx = new AudioContext(); return audioCtx }
  catch { return null }
}

/** 掷钱音效 */
export function playToss(): void {
  const ctx = getCtx()
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(1800, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08)
  g.gain.setValueAtTime(0.15, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  o.connect(g); g.connect(ctx.destination)
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1)
}

/** 落钱音效（可配合 stagger 延时）*/
export function playLand(delay = 0): void {
  const ctx = getCtx()
  if (!ctx) return
  const len = ctx.sampleRate * 0.15
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.3))
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.08, ctx.currentTime + delay)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15)
  src.connect(bp); bp.connect(g); g.connect(ctx.destination)
  src.start(ctx.currentTime + delay)
}

/** 三次落钱 */
export function playAllLands(): void {
  playLand(0); playLand(0.08); playLand(0.16)
}

/** 确认爻位 */
export function playConfirm(): void {
  const ctx = getCtx()
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(80, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2)
  g.gain.setValueAtTime(0.12, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  o.connect(g); g.connect(ctx.destination)
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2)
}

/** 触觉 — 掷钱三连振 */
export function vibrateToss(): void {
  if (navigator.vibrate) navigator.vibrate([15, 30, 15])
}

/** 触觉 — 确认短振 */
export function vibrateConfirm(): void {
  if (navigator.vibrate) navigator.vibrate(10)
}
