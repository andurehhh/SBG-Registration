import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-sbg-black flex items-center justify-center p-8">
          <div className="bg-sbg-navy border border-red-500/30 rounded-[8px] p-8 max-w-2xl w-full">
            <h1 className="font-mono text-red-400 text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sbg-text-muted text-sm mb-4">
              A component crashed. Check the browser console for details.
            </p>
            <pre className="bg-sbg-black rounded-[8px] p-4 text-xs text-red-300 overflow-auto whitespace-pre-wrap border border-white/[0.08]">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-sbg-purple text-white font-mono text-sm rounded-[8px] hover:bg-sbg-purple-light transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
