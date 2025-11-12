import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import DebugInfo from './components/DebugInfo';

const PrivateRoute = ({ children, adminOnly }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/employee" />;
  }
  
  return children;
};

function App() {
  // Emergency fallback - if nothing renders, show this
  try {
    return (
      <div>
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          background: 'green', 
          color: 'white', 
          padding: '10px',
          zIndex: 9999 
        }}>
          APP LOADED - React is working
        </div>
        <AuthProvider>
          <Router>
            <DebugInfo />
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
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: 'red', 
        color: 'white',
        fontSize: '16px'
      }}>
        <h1>Error in App Component:</h1>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
}

export default App;
