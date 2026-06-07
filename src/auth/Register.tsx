import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }

    setLoading(true)
    const { error } = await signUp(username, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-obsidian text-luxury-50 flex items-center justify-center px-6">
        <GlassCard className="p-8 text-center">
          <p className="text-gold">注册成功！正在跳转到登录页...</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-luxury-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-light tracking-[0.2em] mb-3">注册账号</h1>
          <div className="divider w-16 mx-auto" />
          <p className="mt-4 text-sm text-white/40">
            或者{' '}
            <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
              登录已有账号
            </Link>
          </p>
        </div>

        {/* 注册表单 */}
        <GlassCard className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-white/40 mb-2 tracking-wide">用户名</label>
              <Input
                type="text"
                required
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-2 tracking-wide">密码</label>
              <Input
                type="password"
                required
                placeholder="请输入密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-2 tracking-wide">确认密码</label>
              <Input
                type="password"
                required
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
