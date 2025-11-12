import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugInfo = () => {
  const { user, loading } = useAuth();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.name : 'null'}</div>
      <div>Path: {window.location.pathname}</div>
      <div>API Base: {process.env.REACT_APP_API_URL || 'default'}</div>
    </div>
  );
};

export default DebugInfo;