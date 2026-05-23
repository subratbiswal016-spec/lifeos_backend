import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let isInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    // Basic init if path provided
    // In production, parse the JSON or require it directly
    admin.initializeApp({
      credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    });
    isInitialized = true;
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

export const messaging = isInitialized ? admin.messaging() : null;
