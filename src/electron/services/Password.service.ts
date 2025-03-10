import { connect, closeDb } from './Database.service';
import type { Database as DatabaseType } from 'better-sqlite3';
import { encrypt, decrypt, isEncrypted } from './Encryption.service';

export interface PasswordEntry {
  id?: number;
  user_id: number;
  website: string;
  username: string;
  password: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Add a new password entry with encryption
 */
export const addPassword = (entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>): number => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // Encrypt sensitive data
    const encryptedUsername = encrypt(entry.username);
    const encryptedPassword = encrypt(entry.password);
    
    const stmt = db.prepare(`
      INSERT INTO passwords (user_id, website, username, password, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      entry.user_id,
      entry.website,
      encryptedUsername,
      encryptedPassword,
      entry.notes || null
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('Failed to add password:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Get all password entries for a user with decryption for usernames
 */
export const getPasswordsByUserId = (userId: number): PasswordEntry[] => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    const stmt = db.prepare(`
      SELECT * FROM passwords
      WHERE user_id = ?
      ORDER BY website ASC
    `);
    
    const entries = stmt.all(userId) as PasswordEntry[];
    
    // Decrypt usernames for display but keep passwords encrypted
    return entries.map(entry => ({
      ...entry,
      username: isEncrypted(entry.username) ? decrypt(entry.username) : entry.username,
      // Password remains encrypted and will be decrypted only when needed
    }));
  } catch (error) {
    console.error('Failed to get passwords:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Update a password entry with encryption
 */
export const updatePassword = (entry: PasswordEntry): boolean => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // Encrypt sensitive data
    const encryptedUsername = encrypt(entry.username);
    const encryptedPassword = encrypt(entry.password);
    
    const stmt = db.prepare(`
      UPDATE passwords
      SET website = ?, username = ?, password = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(
      entry.website,
      encryptedUsername,
      encryptedPassword,
      entry.notes || null,
      entry.id,
      entry.user_id
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Delete a password entry
 */
export const deletePassword = (id: number, userId: number): boolean => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    const stmt = db.prepare(`
      DELETE FROM passwords
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(id, userId);
    
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to delete password:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Search password entries by website or decrypted username
 */
export const searchPasswords = (userId: number, searchTerm: string): PasswordEntry[] => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // First get all passwords for the user
    const stmt = db.prepare(`
      SELECT * FROM passwords
      WHERE user_id = ?
      ORDER BY website ASC
    `);
    
    const entries = stmt.all(userId) as PasswordEntry[];
    
    // Decrypt usernames and filter based on search term
    const decryptedEntries = entries.map(entry => ({
      ...entry,
      username: isEncrypted(entry.username) ? decrypt(entry.username) : entry.username,
      // Password remains encrypted
    }));
    
    // Filter entries based on search term
    return decryptedEntries.filter(entry => 
      entry.website.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Failed to search passwords:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Get a password entry by ID with decrypted username
 */
export const getPasswordById = (id: number, userId: number): PasswordEntry | null => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    const stmt = db.prepare(`
      SELECT * FROM passwords
      WHERE id = ? AND user_id = ?
    `);
    
    const entry = stmt.get(id, userId) as PasswordEntry | undefined;
    
    if (!entry) {
      return null;
    }
    
    // Decrypt username but keep password encrypted
    return {
      ...entry,
      username: isEncrypted(entry.username) ? decrypt(entry.username) : entry.username,
      // Password remains encrypted
    };
  } catch (error) {
    console.error('Failed to get password by ID:', error);
    throw error;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Decrypt a password for display or clipboard
 */
export const decryptPassword = (encryptedPassword: string): string => {
  if (isEncrypted(encryptedPassword)) {
    return decrypt(encryptedPassword);
  }
  return encryptedPassword; // Return as is if not encrypted
};
