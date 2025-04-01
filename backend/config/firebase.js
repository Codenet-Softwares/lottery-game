import admin from 'firebase-admin';
import serviceAccount from '../lottery-firebase.json' assert { type: "json" };


const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin SDK initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

export const db = initializeFirebase(); 