import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(username, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-[0.2em] mb-3 text-nothing-text-display">易经占卜</h1>
          <div className="divider-nothing w-16 mx-auto" />
          <p className="mt-4 text-sm text-nothing-text-secondary">
            或者{' '}
            <Link to="/register" className="text-nothing-accent hover:text-nothing-text-display transition-colors">
              注册新账号
            </Link>
          </p>
        </div>

        {/* 登录表单 */}
        <GlassCard className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-nothing-accent-subtle border border-nothing-accent rounded-lg text-sm text-nothing-accent">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-nothing-text-secondary mb-2 tracking-wide">用户名</label>
              <Input
                type="text"
                required
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-nothing-text-secondary mb-2 tracking-wide">密码</label>
              <Input
                type="password"
                required
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
