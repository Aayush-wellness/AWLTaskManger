import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress known Material-UI DOM manipulation errors
window.addEventListener('error', (event) => {
  // Suppress the removeChild error - it's a known Material-UI issue
  if (event.error?.message && event.error.message.includes('removeChild')) {
    console.warn('Suppressed DOM removeChild error (Material-UI internal issue)');
    event.preventDefault();
    return;
  }
  
  console.error('Global error:', event.error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Application Error</h1>
      <p>Error: ${event.error?.message || 'Unknown error'}</p>
      <p>Stack: ${event.error?.stack || 'No stack trace'}</p>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React app initialized successfully');
} catch (error) {
  console.error('Failed to initialize React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee; border: 1px solid #fcc;">
      <h1>Initialization Error</h1>
      <p>Failed to start the application: ${error.message}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `;
}
