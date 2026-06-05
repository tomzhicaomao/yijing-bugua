import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

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
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            注册成功！正在跳转到登录页...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-ink tracking-widest">
            注册账号
          </h2>
          <div className="w-12 h-0.5 bg-gold mx-auto rounded-full mt-3" />
          <p className="mt-4 text-center text-sm text-stone-500">
            或者{' '}
            <Link to="/login" className="font-medium text-vermillion hover:text-vermillion-dark">
              登录已有账号
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ink-light">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-light">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
                placeholder="请输入密码（至少6位）"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-light">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
                placeholder="请再次输入密码"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-vermillion hover:bg-vermillion-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vermillion disabled:opacity-50 transition-colors"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
