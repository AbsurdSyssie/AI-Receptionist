// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Remove this line if not using analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0ZOHo8PSWEHR--yS022jPyGwLNIVzpuY",
  authDomain: "med-transcriber.firebaseapp.com",
  projectId: "med-transcriber",
  storageBucket: "med-transcriber.appspot.com",
  messagingSenderId: "918225360557",
  appId: "1:918225360557:web:56a8d8a59270a0ff019824",
  measurementId: "G-9J0EXDVZ7B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Remove this line if not using analytics
export const auth = getAuth(app);
export const db = getFirestore(app);
