import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Filter out the removeChild error as it's a known Material-UI issue
    if (error.message && error.message.includes('removeChild')) {
      console.warn('Suppressed DOM removeChild error (known Material-UI issue):', error);
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Filter out the removeChild error
    if (error.message && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error (suppressed):', error);
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          background: '#fee',
          border: '1px solid #fcc',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
