import { useState } from 'react';
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
    addPassword,
    deletePassword,
    searchPasswords,
  } = useApp();

  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  // const [existingPassword, setExistingPassword] = useState(''); //? Muhtemelen password state'ini kullanmak daha mantıklı olacak
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
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
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      generatedPassword += validChars[randomIndex];
    }

    setPassword(generatedPassword);
  };

  const handleSavePassword = () => {
    if (newWebsite && newUsername && password) {
      addPassword(newWebsite, newUsername, password);
      setNewWebsite('');
      setNewUsername('');
      setPassword('');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePasswordVisibility = (passwordId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const toggleIsExisting = () => {
    setIsExisting(prev => !prev);
  }

  const filteredPasswords = searchQuery ? searchPasswords(searchQuery) : savedPasswords;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} pb-8`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 pt-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Password Manager
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl 
                       border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
                       text-gray-700 dark:text-gray-300 transition-colors"
            >
              {darkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium
                       bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600
                       hover:from-rose-500 hover:via-rose-600 hover:to-rose-700
                       text-white shadow-lg shadow-rose-500/30
                       transform hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 ease-out"
            >
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
  
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            <FiKey className="text-blue-500" /> Generate New Password
          </h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Password Length: {passwordLength}
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={passwordLength}
              onChange={(e) => setPasswordLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                       accent-blue-500 dark:accent-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className="relative flex items-center">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded 
                          peer-checked:bg-blue-500 peer-checked:border-blue-500
                          dark:peer-checked:bg-blue-400 dark:peer-checked:border-blue-400
                          transition-colors duration-200 mr-3
                          after:content-[''] after:absolute after:left-[7px] after:top-[3px]
                          after:w-[6px] after:h-[10px] after:border-white after:border-r-2 
                          after:border-b-2 after:transform after:rotate-45 after:opacity-0
                          peer-checked:after:opacity-100"
              />
              <span className="text-gray-700 dark:text-gray-300">Include Numbers</span>
            </label>

            <label className="relative flex items-center">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded 
                          peer-checked:bg-blue-500 peer-checked:border-blue-500
                          dark:peer-checked:bg-blue-400 dark:peer-checked:border-blue-400
                          transition-colors duration-200 mr-3
                          after:content-[''] after:absolute after:left-[7px] after:top-[3px]
                          after:w-[6px] after:h-[10px] after:border-white after:border-r-2 
                          after:border-b-2 after:transform after:rotate-45 after:opacity-0
                          peer-checked:after:opacity-100"
              />
              <span className="text-gray-700 dark:text-gray-300">Include Symbols</span>
            </label>

            <label className="relative flex items-center">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded 
                          peer-checked:bg-blue-500 peer-checked:border-blue-500
                          dark:peer-checked:bg-blue-400 dark:peer-checked:border-blue-400
                          transition-colors duration-200 mr-3
                          after:content-[''] after:absolute after:left-[7px] after:top-[3px]
                          after:w-[6px] after:h-[10px] after:border-white after:border-r-2 
                          after:border-b-2 after:transform after:rotate-45 after:opacity-0
                          peer-checked:after:opacity-100"
              />
              <span className="text-gray-700 dark:text-gray-300">Include Uppercase</span>
            </label>
          </div>
            
            <button
              onClick={generatePassword}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg
                       hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]
                       font-medium flex items-center justify-center gap-2"
            >
              <FiPlus /> Generate Password
            </button>

            {!isExisting && password && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg dark:text-white">{password}</span>
                <button
                  onClick={() => copyToClipboard(password)}
                  className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg
                       hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]
                       font-medium flex items-center justify-center gap-2"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">

            <div className='flex flex-row justify-start'>
              <label htmlFor="is-existing" className='text-black dark:text-white mr-4'>Already Existing Credentials?</label>
              <input type="checkbox" name="isExistingPassword" id="is-existing" checked={isExisting} onClick={toggleIsExisting} />
            </div>
            <input
              type="text"
              placeholder="Website or App Name"
              value={newWebsite}
              onChange={(e) => setNewWebsite(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            {isExisting && <input
              type="text"
              placeholder="Existing Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />}
            <button
              onClick={handleSavePassword}
              disabled={!newWebsite || !newUsername || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg
                       hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]
                       font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Save Password
            </button>
          </div>
        </div>

        
  
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
              <FiKey className="text-blue-500" /> Saved Passwords
            </h2>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search passwords..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
  
          <div className="space-y-3">
            {filteredPasswords.map((saved) => (
              <div key={saved.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div>
                <h3 className="font-medium dark:text-white">{saved.website}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{saved.username}</p>
                <p className="font-mono text-sm mt-1">
                  {visiblePasswords[saved.id] ? (
                    <span className="text-green-600 dark:text-green-400">{saved.password}</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">••••••••</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePasswordVisibility(saved.id)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg text-gray-600 dark:text-gray-300"
                >
                  {visiblePasswords[saved.id] ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  onClick={() => copyToClipboard(saved.password)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg"
                >
                  <FiCopy className="text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => deletePassword(saved.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default Dashboard;
