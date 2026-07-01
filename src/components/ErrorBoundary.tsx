/**
 * 全局错误边界
 *
 * 捕获子组件树中的未处理异常，显示友好回退 UI。
 * 放在路由外层，防止一个页面崩溃导致整个应用白屏。
 */

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <p className="font-mono text-sm text-nothing-text-display mb-2">出错了</p>
            <p className="font-mono text-xs text-nothing-text-disabled mb-6">
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="font-mono text-xs text-nothing-text-secondary hover:text-nothing-text-primary transition-colors"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
