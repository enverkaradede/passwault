import fs from 'fs';
import path from 'path';
import { connect, closeDb } from './Database.service';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * Initialize the database with the schema
 */
export const initDatabase = (): void => {
  let db: DatabaseType | null = null;
  
  try {
    // Connect to the database
    db = connect();
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    db.exec('BEGIN TRANSACTION');
    
    for (const statement of statements) {
      db.exec(`${statement};`);
    }
    
    db.exec('COMMIT');
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    
    // Rollback transaction if there was an error
    if (db) {
      db.exec('ROLLBACK');
    }
    
    throw error;
  } finally {
    // Close the database connection
    if (db) {
      closeDb(db);
    }
  }
};

/**
 * Check if the database exists and is initialized
 */
export const isDatabaseInitialized = (): boolean => {
  let db: DatabaseType | null = null;
  
  try {
    db = connect();
    
    // Check if the users table exists
    const result = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();
    
    return !!result;
  } catch (error) {
    console.error('Failed to check if database is initialized:', error);
    return false;
  } finally {
    if (db) {
      closeDb(db);
    }
  }
};

// Export a function to initialize the database if it doesn't exist
export const ensureDatabaseInitialized = (): void => {
  if (!isDatabaseInitialized()) {
    initDatabase();
  }
};
