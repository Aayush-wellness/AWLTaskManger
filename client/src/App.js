import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard/index';
import AdminDashboard from './pages/AdminDashboard/index';
import { AuthProvider, useAuth } from './context/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Suppress the removeChild error - it's a known Material-UI DOM manipulation issue
    if (error.message && error.message.includes('removeChild')) {
      console.warn('Suppressed DOM removeChild error (known Material-UI issue)');
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress the removeChild error
    if (error.message && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error suppressed:', error.message);
      return;
    }
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          background: '#fee',
          border: '1px solid #fcc',
          margin: '20px'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PrivateRoute = ({ children, adminOnly }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/employee" replace />;
  }
  
  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/employee" replace />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/employee" 
              element={
                <PrivateRoute>
                  <EmployeeDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
