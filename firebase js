
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArpVV4O8XbnIa5mpykeIs-hxRhmXI8PJ8",
  authDomain: "i-marketplaces.firebaseapp.com",
  projectId: "i-marketplaces",
  storageBucket: "i-marketplaces.firebasestorage.app",
  messagingSenderId: "459809913983",
  appId: "1:459809913983:web:e0fd20625c9504ddc5534a",
  measurementId: "G-2ZRDZ7HSHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Keep users signed in
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Firestore Database
const db = getFirestore(app);

// Make Firebase available to app.js
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;

console.log("Firebase connected successfully!");
