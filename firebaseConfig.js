// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
