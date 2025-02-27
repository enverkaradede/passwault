import React, { createContext, useContext, useState, useEffect } from 'react';

interface SavedPassword {
  id: string;
  website: string;
  username: string;
  password: string;
  createdAt: string;
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  savedPasswords: SavedPassword[];
  addPassword: (website: string, username: string, password: string) => void;
  deletePassword: (id: string) => void;
  searchPasswords: (query: string) => SavedPassword[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>(() => {
    const saved = localStorage.getItem('savedPasswords');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
  }, [savedPasswords]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addPassword = (website: string, username: string, password: string) => {
    const newPassword: SavedPassword = {
      id: Date.now().toString(),
      website,
      username,
      password,
      createdAt: new Date().toISOString(),
    };
    setSavedPasswords([...savedPasswords, newPassword]);
  };

  const deletePassword = (id: string) => {
    setSavedPasswords(savedPasswords.filter((pw) => pw.id !== id));
  };

  const searchPasswords = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return savedPasswords.filter(
      (pw) =>
        pw.website.toLowerCase().includes(lowercaseQuery) ||
        pw.username.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        savedPasswords,
        addPassword,
        deletePassword,
        searchPasswords,
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
