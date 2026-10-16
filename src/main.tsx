import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CipherForge Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#0e0e11] border border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-orange-400">Application Initialization Error</h2>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-black p-3 rounded-xl border border-zinc-800 text-left overflow-auto max-h-40">
              {this.state.error?.message || 'An unknown error occurred while initializing CipherForge.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 transition-colors shadow-md shadow-orange-500/20"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
