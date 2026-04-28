import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newline characters in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Firebase admin initialization error', error.stack);
    } else {
      console.error('Firebase admin initialization error', error);
    }
  }
}

export const db = admin.firestore();
