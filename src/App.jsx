import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { getAuthToken } from './api/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
