import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiLock, FiUser } from 'react-icons/fi';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Login = ({ setIsAuthenticated }: LoginProps) => {
  const { darkMode } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'e' && password === 'e') { //* Placeholder credentials for now
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Passwault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your secure password manager
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           transition-colors duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           transition-colors duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg
                       hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       transform transition-all duration-200 hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
