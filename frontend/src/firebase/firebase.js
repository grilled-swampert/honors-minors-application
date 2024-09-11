// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuuVBuFl671Cg16XrvoCynxqr_-y015pw",
  authDomain: "honours-minors.firebaseapp.com",
  projectId: "honours-minors",
  storageBucket: "honours-minors.appspot.com",
  messagingSenderId: "617640855071",
  appId: "1:617640855071:web:deca2410605d2d0264b72a",
  measurementId: "G-ZQXMMD73QQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);  

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword ,db};