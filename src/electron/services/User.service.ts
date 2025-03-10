import { connect, closeDb } from './Database.service';
import type { Database as DatabaseType } from 'better-sqlite3';
import { encrypt, decrypt, isEncrypted } from './Encryption.service';

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Authenticate a user
 */
export const authenticateUser = (username: string, password: string): User | null => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // First, get the user by username
    const userStmt = db.prepare(`
      SELECT * FROM users
      WHERE username = ?
    `);
    
    const user = userStmt.get(username) as User | undefined;
    
    if (!user) {
      return null;
    }
    
    // Decrypt the stored password hash and compare
    const storedHash = isEncrypted(user.password_hash) 
      ? decrypt(user.password_hash) 
      : user.password_hash;
    
    // Compare with provided password
    if (storedHash === password) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Get user by ID
 */
export const getUserById = (id: number): User | null => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
    `);
    
    const user = stmt.get(id) as User | undefined;
    
    return user || null;
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Create a new user
 */
export const createUser = (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): number => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // Encrypt the password hash
    const encryptedPasswordHash = encrypt(user.password_hash);
    
    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(user.username, encryptedPasswordHash);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Update user password
 */
export const updateUserPassword = (id: number, newPasswordHash: string): boolean => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // Encrypt the new password hash
    const encryptedPasswordHash = encrypt(newPasswordHash);
    
    const stmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(encryptedPasswordHash, id);
    
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to update user password:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};
