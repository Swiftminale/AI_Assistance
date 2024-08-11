import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Import getAnalytics

const firebaseConfig = {
  apiKey: "AIzaSyCtwdF-bFGuePYIcErFl5s8i0KwxyVkMdU",
  authDomain: "ai-customer-support-41400.firebaseapp.com",
  projectId: "ai-customer-support-41400",
  storageBucket: "ai-customer-support-41400.appspot.com",
  messagingSenderId: "420476496267",
  appId: "1:420476496267:web:6e05fb538b9312ce33678e",
  measurementId: "G-RYCMJT8W65",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics

// Export the necessary Firebase functions
export { db, collection, addDoc, serverTimestamp, getDocs };
