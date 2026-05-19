import admin from 'firebase-admin';
import type { Messaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import path from "node:path";
dotenv.config();

let initialized = false;

try {
  let serviceAccount: object;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Railway / production — read from environment variable
    console.log('📁 Loading Firebase config from environment variable');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local — read from file
    const serviceAccountPath = path.resolve(
      process.cwd(),
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
    );
    console.log(`📁 Loading Firebase config from: ${serviceAccountPath}`);

    if (!existsSync(serviceAccountPath)) {
      throw new Error(`File not found: ${serviceAccountPath}`);
    }

    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  initialized = true;
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('⚠️ Push notifications will be disabled');
}

export const fcm: Messaging | null = initialized ? admin.messaging() : null;
export default admin;
