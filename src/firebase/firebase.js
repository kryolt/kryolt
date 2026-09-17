import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCTZJon2mUwa2l-_FK-jKQSsgRWESBYDHg",
    authDomain: "kryolt.firebaseapp.com",
    projectId: "kryolt",
    storageBucket: "kryolt.firebasestorage.app",
    messagingSenderId: "1056779868309",
    appId: "1:1056779868309:web:aed18cd4c9ac123c6a239c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

export default app;