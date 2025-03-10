import React, { createContext, useContext, useState, useEffect } from 'react';

interface SavedPassword {
  id: number;
  website: string;
  username: string;
  password: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  savedPasswords: SavedPassword[];
  loadPasswords: (userId: number) => Promise<void>;
  addPassword: (userId: number, website: string, username: string, password: string, notes?: string) => Promise<void>;
  deletePassword: (passwordId: number, userId: number) => Promise<void>;
  searchPasswords: (userId: number, query: string) => Promise<void>;
  decryptPassword: (encryptedPassword: string) => Promise<string>;
  currentUserId: number | null;
  setCurrentUserId: (userId: number | null) => void;
  filteredPasswords: SavedPassword[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<SavedPassword[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const loadPasswords = async (userId: number) => {
    try {
      const response = await window.electron.passwords.getAll(userId);
      if (response.success) {
        setSavedPasswords(response.passwords);
        setFilteredPasswords(response.passwords);
      } else {
        console.error('Failed to load passwords:', response.message);
      }
    } catch (error) {
      console.error('Error loading passwords:', error);
    }
  };

  const addPassword = async (userId: number, website: string, username: string, password: string, notes?: string) => {
    try {
      const response = await window.electron.passwords.add({
        user_id: userId,
        website,
        username,
        password,
        notes: notes || ''
      });
      
      if (response.success) {
        // Reload passwords after adding a new one
        await loadPasswords(userId);
      } else {
        console.error('Failed to add password:', response.message);
      }
    } catch (error) {
      console.error('Error adding password:', error);
    }
  };

  const deletePassword = async (passwordId: number, userId: number) => {
    try {
      const response = await window.electron.passwords.delete(passwordId, userId);
      if (response.success) {
        // Reload passwords after deletion
        await loadPasswords(userId);
      } else {
        console.error('Failed to delete password:', response.message);
      }
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  const searchPasswords = async (userId: number, query: string) => {
    if (!query.trim()) {
      setFilteredPasswords(savedPasswords);
      return;
    }
    
    try {
      const response = await window.electron.passwords.search(userId, query);
      if (response.success) {
        setFilteredPasswords(response.passwords);
      } else {
        console.error('Failed to search passwords:', response.message);
      }
    } catch (error) {
      console.error('Error searching passwords:', error);
    }
  };

  const decryptPassword = async (encryptedPassword: string): Promise<string> => {
    try {
      const response = await window.electron.passwords.decrypt(encryptedPassword);
      if (response.success) {
        return response.password;
      } else {
        console.error('Failed to decrypt password:', response.message);
        return '';
      }
    } catch (error) {
      console.error('Error decrypting password:', error);
      return '';
    }
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        savedPasswords,
        loadPasswords,
        addPassword,
        deletePassword,
        searchPasswords,
        decryptPassword,
        currentUserId,
        setCurrentUserId,
        filteredPasswords
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
