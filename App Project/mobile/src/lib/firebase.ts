import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArywJWtBe7rXNM-zETPcHMDTF8Li9ABRY",
  authDomain: "music-space-fe322.firebaseapp.com",
  projectId: "music-space-fe322",
  storageBucket: "music-space-fe322.firebasestorage.app",
  messagingSenderId: "405253103561",
  appId: "1:405253103561:web:e3099f8be19cae2ab95218",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth already initialized
  auth = getAuth(app);
}

export { app, auth };
