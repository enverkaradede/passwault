import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiSearch, FiPlus, FiKey, FiTrash2, FiCopy, FiEye, FiEyeOff, FiLogOut } from 'react-icons/fi';

interface DashboardProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Dashboard = ({ setIsAuthenticated }: DashboardProps) => {
  const {
    darkMode,
    toggleDarkMode,
    savedPasswords,
    filteredPasswords,
    loadPasswords,
    addPassword,
    deletePassword,
    searchPasswords,
    decryptPassword,
    currentUserId
  } = useApp();

  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserPasswords = async () => {
      if (currentUserId) {
        setIsLoading(true);
        await loadPasswords(currentUserId);
        setIsLoading(false);
      }
    };

    loadUserPasswords();
  }, [currentUserId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const generatePassword = () => {
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let validChars = lowercase;
    if (includeNumbers) validChars += numbers;
    if (includeSymbols) validChars += symbols;
    if (includeUppercase) validChars += uppercase;

    let generatedPassword = '';
    for (let i = 0; i <passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      generatedPassword += validChars[randomIndex];
    }

    setPassword(generatedPassword);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserId) {
      await searchPasswords(currentUserId, searchQuery);
    }
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebsite || !newUsername || !password || !currentUserId) return;

    try {
      await addPassword(currentUserId, newWebsite, newUsername, password, newNotes);
      setNewWebsite('');
      setNewUsername('');
      setPassword('');
      setNewNotes('');
      setIsExisting(false);
    } catch (error) {
      console.error('Error adding password:', error);
    }
  };

  const handleDeletePassword = async (id: number) => {
    if (!currentUserId) return;
    
    try {
      await deletePassword(id, currentUserId);
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  const togglePasswordVisibility = async (id: number, encryptedPassword: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    // If we're showing the password and haven't decrypted it yet, decrypt it
    if (!visiblePasswords[id] && !decryptedPasswords[id]) {
      try {
        const decrypted = await decryptPassword(encryptedPassword);
        setDecryptedPasswords((prev) => ({
          ...prev,
          [id]: decrypted,
        }));
      } catch (error) {
        console.error('Error decrypting password:', error);
      }
    }
  };

  const copyToClipboard = async (text: string, isEncryptedPassword = false) => {
    let textToCopy = text;
    
    // If it's an encrypted password, decrypt it first
    if (isEncryptedPassword) {
      try {
        textToCopy = await decryptPassword(text);
      } catch (error) {
        console.error('Error decrypting password for clipboard:', error);
        return;
      }
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Show a temporary success message (could be improved with a toast notification)
        console.log('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-2xl font-bold dark:from-blue-400 dark:to-purple-400">
            Passwault
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Password Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
          <div className="flex items-center mb-3">
            <FiKey className="text-blue-500 mr-2" size={18} />
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Generate New Password</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Password Length: {passwordLength}</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={passwordLength}
              onChange={(e) => setPasswordLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={() => setIncludeNumbers(!includeNumbers)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Include Numbers</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={() => setIncludeSymbols(!includeSymbols)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Include Symbols</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={() => setIncludeUppercase(!includeUppercase)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Include Uppercase</span>
            </label>
          </div>

          <button
            onClick={generatePassword}
            // className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg focus:outline-none transition-colors flex items-center justify-center"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg
                       hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]
                       font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isExisting}>
            <span className="mr-2">+</span>
            <span>Generate Password</span>
          </button>
          
          {!isExisting && password && (
            <div className="mt-4 relative">
              <input
                type="text"
                value={password}
                readOnly
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={() => copyToClipboard(password)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiCopy />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
          {/* Add Password Form */}
          <div>
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isExisting}
                onChange={() => setIsExisting(!isExisting)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Already Existing Credentials?</span>
            </label>
            <div className="mb-4">
              <input
                type="text"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Website or App Name"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Username"
              />
            </div>
            {isExisting && <div className="mb-4">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Password"
              />
            </div>}
            <button
              onClick={handleAddPassword}
              // className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              className="w-full bg-gradient-to-r from-blue-400 to-purple-700 text-white py-3 px-6 rounded-lg
                       hover:from-blue-700 hover:to-purple-800 transition-all transform hover:scale-[1.02]
                       font-medium flex items-center justify-center gap-2"
            >
              Save Password
            </button>
          </div>

          {/* Password List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiKey className="text-blue-500 mr-2" size={18} />
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Saved Passwords</h2>
              </div>
              <div className="relative w-48">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentUserId) {
                      searchPasswords(currentUserId, e.target.value);
                    }
                  }}
                  className="block w-full pl-8 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search passwords..."
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">Loading passwords...</p>
              </div>
            ) : filteredPasswords.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No passwords found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredPasswords.map((pw) => (
                  <div
                    key={pw.id}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-800 dark:text-white">{pw.website}</h3>
                      <button
                        onClick={() => handleDeletePassword(pw.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{pw.username}</span>
                        <button
                          onClick={() => copyToClipboard(pw.username)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">
                          {visiblePasswords[pw.id] ? decryptedPasswords[pw.id] || '...' : '••••••••'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => togglePasswordVisibility(pw.id, pw.password)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {visiblePasswords[pw.id] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(pw.password, true)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <FiCopy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
