/**
 * Script to test password decryption
 */
import { getPasswordsByUserId, decryptPassword } from '../services/Password.service';
import { ensureDatabaseInitialized } from '../services/initDatabase';
import { initializeEncryption } from '../services/Encryption.service';

// Initialize database and encryption
ensureDatabaseInitialized();
initializeEncryption('passwault-master-key');

// User ID for the default admin user
const userId = 1;

console.log('Testing password decryption...');

try {
  // Get all passwords for the user
  const passwords = getPasswordsByUserId(userId);
  
  console.log(`Found ${passwords.length} password entries`);
  
  // Display each password entry with decrypted values
  passwords.forEach(entry => {
    const decryptedPassword = decryptPassword(entry.password);
    
    console.log('\n---------------------------------');
    console.log(`Website: ${entry.website}`);
    console.log(`Username: ${entry.username}`); // Already decrypted by getPasswordsByUserId
    console.log(`Password: ${decryptedPassword}`);
    console.log(`Notes: ${entry.notes || 'N/A'}`);
    console.log('---------------------------------');
  });
  
  console.log('\nDecryption test completed successfully!');
} catch (error) {
  console.error('Failed to test decryption:', error);
  process.exit(1);
}
