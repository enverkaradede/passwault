/**
 * Database initialization script
 * Run this script to create the database and tables
 */
import { ensureDatabaseInitialized } from '../services/initDatabase';

console.log('Initializing database...');

try {
  ensureDatabaseInitialized();
  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}
