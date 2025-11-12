import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

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
    <div>
      {/* Temporary debug indicator */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        background: 'blue', 
        color: 'white', 
        padding: '5px 10px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        React App Loaded
      </div>
      
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
    </div>
  );
}

export default App;
