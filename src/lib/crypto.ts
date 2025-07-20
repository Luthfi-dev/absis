
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
  if (!ciphertextUrlSafe) return 'decryption_error';
  try {
    // Restore the standard Base64 string
    let base64 = ciphertextUrlSafe.replace(/-/g, '+').replace(/_/g, '/');
    // Pad the string with '=' characters if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    const ciphertext = atob(base64);
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      // This can happen if the key is wrong or the ciphertext is corrupt
      return 'decryption_error';
    }
    return originalText;
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return a value that is unlikely to match any real ID
    return 'decryption_error'; 
  }
}
