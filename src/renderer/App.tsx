import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AppProvider } from './context/AppContext';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}
