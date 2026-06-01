import { ref } from 'vue'
import { auth, googleProvider, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { AVATAR } from '@/config'

function generateDefaultAvatar(uid) {
  return `${AVATAR.baseUrl}` + uid
}

export const isAuthenticated = ref(false)
export const currentUser = ref(null)

export async function register({ name, email, password, gender, role, bio }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const avatar = generateDefaultAvatar(user.uid)
    await setDoc(doc(db, 'users', user.uid), { name, email, gender, role, bio, avatar })

    currentUser.value = { uid: user.uid, email: user.email, name, gender, role, bio, avatar }
    isAuthenticated.value = true
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const avatar = generateDefaultAvatar(user.uid)
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      const defaultProfile = {
        role: 'User',
        gender: 'Unknown',
        bio: '',
        name: user.displayName || 'New User',
        email: user.email,
        avatar,
      }
      await setDoc(userRef, defaultProfile)

      currentUser.value = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        ...defaultProfile,
      }
    } else {
      currentUser.value = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        ...userDoc.data(),
      }
    }
    isAuthenticated.value = true
    return { success: true, error: null }
  } catch (error) {
    isAuthenticated.value = false
    return { success: false, error: error.message }
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      const defaultProfile = {
        role: 'User',
        gender: 'Unknown',
        bio: '',
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      }
      await setDoc(userRef, defaultProfile)

      currentUser.value = {
        uid: user.uid,
        ...defaultProfile,
      }
    } else {
      currentUser.value = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        ...userDoc.data(),
      }
    }
    isAuthenticated.value = true
    return { success: true, error: null }
  } catch (error) {
    isAuthenticated.value = false
    return { success: false, error: error.message }
  }
}

export async function logout() {
  await signOut(auth)
  isAuthenticated.value = false
  currentUser.value = null
}

export function getCurrentUser() {
  return currentUser.value
}

/**
 * 修改用户信息
 * @param {Object} updates - 可以包含 name, gender, role, bio, password
 */
export async function updateUserProfile(updates) {
  if (!currentUser.value) {
    return { success: false, error: 'User not logged in' }
  }

  const userRef = doc(db, 'users', currentUser.value.uid)

  try {
    // 如果更新密码，需要单独通过 Firebase Auth
    // if (updates.password) {
    //   await auth.currentUser.updatePassword(updates.password)
    //   delete updates.password
    // }

    // 更新 Firestore 用户信息
    await updateDoc(userRef, updates)

    // 同步 currentUser
    currentUser.value = {
      ...currentUser.value,
      ...updates,
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: error.message }
  }
}
