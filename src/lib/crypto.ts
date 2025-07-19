
'use client'

import CryptoJS from 'crypto-js';

// WARNING: THIS IS NOT A SECURE WAY TO MANAGE KEYS IN A REAL PRODUCTION APP.
// In a real app, this key should come from a secure vault or environment-specific config
// that is not bundled with the client-side code. For this prototype, we use an env var.
const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 's3cr3t_k3y_f0r_AES_32_ch4r_l3ngth';

if (process.env.NODE_ENV === 'development' && secretKey === 's3cr3t_k3y_f0r_AES_32_ch4r_l3ngth') {
  console.warn(
    'Using default encryption key. Please set NEXT_PUBLIC_ENCRYPTION_KEY in your .env.local file for better security.'
  );
}

// Encrypts a string using AES
export function encryptId(text: string): string {
  if (!text) return '';
  try {
    const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    // Use a URL-safe Base64 encoding
    return btoa(ciphertext).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error("Encryption failed:", error);
    return '';
  }
}

// Decrypts a string using AES
export function decryptId(ciphertextUrlSafe: string): string {
  if (!ciphertextUrlSafe) return '';
  try {
    // Restore the standard Base64 string
    let ciphertext = atob(ciphertextUrlSafe.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      throw new Error("Decryption resulted in empty string. Check key or ciphertext.");
    }
    return originalText;
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return a value that is unlikely to match any real ID
    return 'decryption_error'; 
  }
}
