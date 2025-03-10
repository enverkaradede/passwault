import crypto from 'crypto';

// Encryption key and initialization vector settings
const ENCRYPTION_KEY_SIZE = 32; // 256 bits
const IV_SIZE = 16; // 128 bits
const ALGORITHM = 'aes-256-cbc';

// Secret key for encryption (in production, this should be stored securely)
// This is a placeholder - in a real app, you'd use a secure key management solution
let encryptionKey: Buffer | null = null;

/**
 * Initialize the encryption service with a master key
 * @param masterPassword The master password to derive the encryption key from
 */
export const initializeEncryption = (masterPassword: string): void => {
  // Derive a key from the master password using PBKDF2
  const salt = 'passwault-salt'; // In production, use a secure random salt
  encryptionKey = crypto.pbkdf2Sync(
    masterPassword,
    salt,
    10000, // Number of iterations
    ENCRYPTION_KEY_SIZE,
    'sha256'
  );
};

/**
 * Encrypt a string
 * @param text The text to encrypt
 * @returns The encrypted text as a base64 string with IV prepended
 */
export const encrypt = (text: string): string => {
  if (!encryptionKey) {
    // Use a default key if not initialized (not recommended for production)
    initializeEncryption('default-master-password');
  }
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_SIZE);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey!, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Prepend the IV to the encrypted text (IV doesn't need to be secret)
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt a string
 * @param encryptedText The encrypted text with IV prepended
 * @returns The decrypted text
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptionKey) {
    // Use a default key if not initialized (not recommended for production)
    initializeEncryption('default-master-password');
  }
  
  // Split the IV and encrypted text
  const textParts = encryptedText.split(':');
  if (textParts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedData = textParts[1];
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey!, iv);
  
  // Decrypt the text
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Check if a string is encrypted
 * @param text The text to check
 * @returns True if the text appears to be encrypted
 */
export const isEncrypted = (text: string): boolean => {
  // Check if the text matches our encryption format (IV:encryptedData)
  const parts = text.split(':');
  if (parts.length !== 2) return false;
  
  // Check if the first part is a valid hex string of the correct length (IV)
  const ivHex = parts[0];
  if (!/^[0-9a-f]+$/i.test(ivHex)) return false;
  if (ivHex.length !== IV_SIZE * 2) return false;
  
  // Check if the second part is a valid base64 string
  const encryptedData = parts[1];
  try {
    Buffer.from(encryptedData, 'base64');
    return true;
  } catch (e) {
    return false;
  }
};
