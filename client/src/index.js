import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('INDEX.JS LOADED - Starting React app');

try {
  const rootElement = document.getElementById('root');
  console.log('Root element found:', rootElement);
  
  if (!rootElement) {
    document.body.innerHTML = '<div style="background: red; color: white; padding: 20px;">ERROR: Root element not found!</div>';
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered');
} catch (error) {
  console.error('Error in index.js:', error);
  document.body.innerHTML = `
    <div style="background: red; color: white; padding: 20px; font-family: monospace;">
      <h1>React Mount Error:</h1>
      <pre>${error.toString()}</pre>
      <p>Check browser console for more details</p>
    </div>
  `;
}
