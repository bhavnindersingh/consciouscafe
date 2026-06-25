import React from 'react';

/**
 * App-level error boundary. Its main job is graceful recovery when a lazy route
 * chunk fails to load — which happens routinely when a redeploy invalidates the
 * hashed chunk filenames a user still has cached. Without this, such a failure
 * unmounts the whole React tree to a blank white screen. Here we offer a reload,
 * which fetches the fresh index.html and chunk manifest.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            textAlign: 'center',
            padding: '0 24px',
            fontFamily: 'var(--serif, Georgia, serif)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--display, Georgia, serif)', fontWeight: 400, fontSize: 'clamp(26px,4vw,44px)' }}>
            Something interrupted us.
          </h2>
          <p style={{ color: 'var(--ink-mute, #777)', maxWidth: '40ch' }}>
            The page didn’t load fully — usually a brief hiccup or a fresh update. A reload should put it right.
          </p>
          <button
            type="button"
            className="btn forest"
            onClick={() => window.location.reload()}
          >
            Reload the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
