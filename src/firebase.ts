import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsEvaG5vOf66uJrFy58OMqkQ8-ZACCmGg",
  authDomain: "yakinsohbet.firebaseapp.com",
  projectId: "yakinsohbet",
  storageBucket: "yakinsohbet.firebasestorage.app",
  messagingSenderId: "165497798766",
  appId: "1:165497798766:web:65d0343d5b6e8f2043267f",
  measurementId: "G-1PSLMF9WPB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
