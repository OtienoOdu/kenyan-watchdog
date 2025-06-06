
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

// Basic validation for critical Firebase config values
if (!apiKey) {
  throw new Error("Firebase Config Error: Missing NEXT_PUBLIC_FIREBASE_API_KEY in your .env file. Please ensure it is set correctly.");
}
if (!authDomain) {
  throw new Error("Firebase Config Error: Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in your .env file. Please ensure it is set correctly.");
}
if (!projectId) {
  throw new Error("Firebase Config Error: Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in your .env file. Please ensure it is set correctly.");
}
if (!databaseURL) {
  throw new Error("Firebase Config Error: Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL in your .env file. It should be in the format https://<YOUR-PROJECT-ID>.firebaseio.com or https://<YOUR-PROJECT-ID>.<REGION>.firebasedatabase.app. Please ensure it is set correctly.");
}
// A simple check for the database URL format
if (!databaseURL.startsWith("https://") || !(databaseURL.endsWith(".firebaseio.com") || databaseURL.endsWith(".firebasedatabase.app"))) {
  throw new Error(`Firebase Config Error: Invalid format for NEXT_PUBLIC_FIREBASE_DATABASE_URL: "${databaseURL}". It must start with "https://" and end with ".firebaseio.com" or ".firebasedatabase.app". Please check your .env file.`);
}


const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  databaseURL: databaseURL,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const rtdb: Database = getDatabase(app); // Initialize Realtime Database

export { app, auth, rtdb };
