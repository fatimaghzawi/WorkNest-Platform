import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Catches render crashes so the whole SPA doesn't go blank in production.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('UI error boundary:', error, info);
    }
  }

  private handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            background: '#FAFAFA',
            color: '#1F2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div>
            <h1 style={{ color: '#49225B', marginBottom: '0.75rem' }}>Something went wrong</h1>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              The page hit an unexpected error. You can return home and continue.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: '#49225B',
                color: '#fff',
                border: 0,
                borderRadius: 8,
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Go to home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
