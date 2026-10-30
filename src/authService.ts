
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase";

export function registerUser(
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
}

export function loginUser(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
}

export function logoutUser() {
  return signOut(auth);
}

export function watchAuth(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}
