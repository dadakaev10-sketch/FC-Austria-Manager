// ============================================================================
// Firebase Auth Functions
// ============================================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserRole } from '@/types/database';

/**
 * Sign up with email + password and create a Firestore profile at users/{uid}.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Create profile doc in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    fullName,
    email: user.email,
    role: 'manager' as UserRole,
    clubId: null,
    phone: null,
    avatarUrl: null,
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign out the current user.
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
