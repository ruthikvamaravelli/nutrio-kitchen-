import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validate Firebase configuration
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

console.log('Firebase Config Status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  authDomain: firebaseConfig.authDomain
});

if (!isFirebaseConfigured) {
  console.error('❌ Firebase is NOT fully configured. Check your .env file:');
  console.error('   Missing:', [
    !firebaseConfig.apiKey && 'VITE_FIREBASE_API_KEY',
    !firebaseConfig.projectId && 'VITE_FIREBASE_PROJECT_ID',
    !firebaseConfig.appId && 'VITE_FIREBASE_APP_ID'
  ].filter(Boolean).join(', '));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✓ Firebase app initialized:', app.name);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log('✓ Firebase Auth initialized');

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Request specific OAuth scopes for Google sign-in
googleProvider.addScope('profile');
googleProvider.addScope('email');
console.log('✓ Google Auth Provider configured with scopes');

// Initialize Firestore
export const db = getFirestore(app);

// Firestore User Management Functions
export const saveUserToFirestore = async (uid, userData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    return false;
  }
};

export const getUserFromFirestore = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

export const updateUserInFirestore = async (uid, updatedData) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    return false;
  }
};

export default app;
