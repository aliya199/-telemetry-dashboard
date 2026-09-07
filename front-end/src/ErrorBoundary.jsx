import React from 'react';

/**
 * ErrorBoundary — catches any unhandled render-time error and shows a
 * friendly recovery screen instead of a blank white page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#F4E3B2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #947268',
              borderRadius: '1rem',
              padding: '2.5rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 4px 24px rgba(49,14,16,0.10)',
            }}
          >
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
            <h1 style={{ color: '#310E10', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#947268', fontSize: '0.8rem', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
              {this.state.message}
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: '#310E10',
                color: '#F4E3B2',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.5rem',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
