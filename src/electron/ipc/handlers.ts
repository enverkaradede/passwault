import { ipcMain } from 'electron';
import { authenticateUser, getUserById, createUser, updateUserPassword } from '../services/User.service';
import { 
  addPassword, 
  getPasswordsByUserId, 
  updatePassword, 
  deletePassword, 
  searchPasswords,
  decryptPassword,
  getPasswordById
} from '../services/Password.service';
import { ensureDatabaseInitialized } from '../services/initDatabase';
import { initializeEncryption } from '../services/Encryption.service';

export const setupIpcHandlers = (): void => {
  // Initialize database
  ensureDatabaseInitialized();
  
  // Initialize encryption with a default master password
  // In a production app, this would be securely managed
  initializeEncryption('passwault-master-key');

  // User authentication handlers
  ipcMain.handle('auth:login', async (_, username: string, password: string) => {
    try {
      const user = authenticateUser(username, password);
      return user ? { success: true, user } : { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  });

  ipcMain.handle('auth:get-user', async (_, userId: number) => {
    try {
      const user = getUserById(userId);
      return user ? { success: true, user } : { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, message: 'Failed to get user' };
    }
  });

  ipcMain.handle('auth:create-user', async (_, username: string, password: string) => {
    try {
      const userId = createUser({ username, password_hash: password });
      return { success: true, userId };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, message: 'Failed to create user' };
    }
  });

  ipcMain.handle('auth:update-password', async (_, userId: number, newPassword: string) => {
    try {
      const success = updateUserPassword(userId, newPassword);
      return { success };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Failed to update password' };
    }
  });

  // Password management handlers
  ipcMain.handle('passwords:add', async (_, passwordData) => {
    try {
      const passwordId = addPassword(passwordData);
      return { success: true, passwordId };
    } catch (error) {
      console.error('Add password error:', error);
      return { success: false, message: 'Failed to add password' };
    }
  });

  ipcMain.handle('passwords:get-all', async (_, userId: number) => {
    try {
      const passwords = getPasswordsByUserId(userId);
      return { success: true, passwords };
    } catch (error) {
      console.error('Get passwords error:', error);
      return { success: false, message: 'Failed to get passwords' };
    }
  });

  ipcMain.handle('passwords:get-by-id', async (_, passwordId: number, userId: number) => {
    try {
      const password = getPasswordById(passwordId, userId);
      return password ? { success: true, password } : { success: false, message: 'Password not found' };
    } catch (error) {
      console.error('Get password by ID error:', error);
      return { success: false, message: 'Failed to get password' };
    }
  });

  ipcMain.handle('passwords:update', async (_, passwordData) => {
    try {
      const success = updatePassword(passwordData);
      return { success };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Failed to update password' };
    }
  });

  ipcMain.handle('passwords:delete', async (_, passwordId: number, userId: number) => {
    try {
      const success = deletePassword(passwordId, userId);
      return { success };
    } catch (error) {
      console.error('Delete password error:', error);
      return { success: false, message: 'Failed to delete password' };
    }
  });

  ipcMain.handle('passwords:search', async (_, userId: number, searchTerm: string) => {
    try {
      const passwords = searchPasswords(userId, searchTerm);
      return { success: true, passwords };
    } catch (error) {
      console.error('Search passwords error:', error);
      return { success: false, message: 'Failed to search passwords' };
    }
  });

  // Decrypt password for display or clipboard
  ipcMain.handle('passwords:decrypt', async (_, encryptedPassword: string) => {
    try {
      const decryptedPassword = decryptPassword(encryptedPassword);
      return { success: true, password: decryptedPassword };
    } catch (error) {
      console.error('Decrypt password error:', error);
      return { success: false, message: 'Failed to decrypt password' };
    }
  });
};
