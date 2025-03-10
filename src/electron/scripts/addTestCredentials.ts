/**
 * Script to add test credentials to the database
 */
import { addPassword } from '../services/Password.service';
import { ensureDatabaseInitialized } from '../services/initDatabase';
import { initializeEncryption } from '../services/Encryption.service';

// Initialize database and encryption
ensureDatabaseInitialized();
initializeEncryption('passwault-master-key');

// User ID for the default admin user
const userId = 1;

// Test credentials
const testCredentials = [
  {
    website: 'testwebsite.com',
    username: 'testuser',
    password: 'testpassword',
    notes: 'Test credentials'
  },
  {
    website: 'test2_website.com',
    username: 'testuser2',
    password: 'testpassword2',
    notes: 'Test credentials 2'
  },
  {
    website: 'test_website',
    username: 'test_user',
    password: 'test_password',
    notes: 'Test credentials'
  },
  {
    website: 'test3_website.com',
    username: 'testuser3',
    password: 'testpassword3',
    notes: 'Test credentials 3'
  }
];

console.log('Adding test credentials to database...');

try {
  // Add each credential to the database
  testCredentials.forEach(cred => {
    const passwordId = addPassword({
      user_id: userId,
      website: cred.website,
      username: cred.username,
      password: cred.password,
      notes: cred.notes
    });
    
    console.log(`Added credential for ${cred.website} with ID: ${passwordId}`);
  });
  
  console.log('All test credentials added successfully!');
} catch (error) {
  console.error('Failed to add test credentials:', error);
  process.exit(1);
}
