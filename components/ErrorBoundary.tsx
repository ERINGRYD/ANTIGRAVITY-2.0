import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Ocorreu um erro inesperado. Nossa equipe já foi notificada. Por favor, recarregue a página para tentar novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-blue-500/20"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
