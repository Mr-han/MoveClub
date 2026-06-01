<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center space-x-3 mb-6">
          <div
            class="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center"
          >
            <i class="fas fa-users text-white text-xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">MoveClub</h1>
        </div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
        <p class="text-gray-600">Sign in to continue to your account</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          <i class="fas fa-exclamation-circle mr-2"></i>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label for="username" class="block text-sm font-medium text-gray-900">
              Email Address
            </label>
            <input
              type="text"
              id="username"
              v-model="username"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-900"> Password </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="togglePassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="text-right">
              <button
                type="button"
                @click="handleResetPassword"
                class="text-sm text-primary/80 hover:text-indigo-600 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-primary/80 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <template v-if="!loading"> <i class="fas fa-sign-in-alt mr-2"></i>Sign In </template>
            <template v-else>
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                ></path>
              </svg>
              Signing In...
            </template>
          </button>
        </form>

        <!-- Google Login -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            @click="handleGoogleLogin"
            class="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.05 2.54-2.24 3.32v2.77h3.62c2.11-1.94 3.26-4.79 3.26-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.95 0 5.42-.98 7.23-2.67l-3.62-2.77c-1 .67-2.27 1.07-3.61 1.07-2.78 0-5.13-1.87-5.97-4.39H2.28v2.83C4.09 20.53 7.74 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M6.03 14.24c-.23-.67-.36-1.38-.36-2.12s.13-1.45.36-2.12V7.17H2.28A10.01 10.01 0 0 0 2 12.12c0 1.61.39 3.13 1.08 4.45l2.95-2.33z"
              />
              <path
                fill="#EA4335"
                d="M12 4.88c1.61 0 3.06.55 4.2 1.62l3.14-3.14C17.42 1.44 14.95.46 12 .46 7.74.46 4.09 2.94 2.28 6.29l3.75 2.95c.84-2.52 3.19-4.39 5.97-4.39z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <!-- Go to Register -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <button @click="goToRegister" class="text-primary/80 hover:text-indigo-600 font-medium">
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { loginWithGoogle, login, resetPassword } from '../api/auth'
import { getErrorMessage } from '@/utils/error'
import { useRouter, useRoute } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)
const alert = inject('alert')
const router = useRouter()
const route = useRoute()
const loading = ref(false)
function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  loading.value = true
  try {
    const result = await login(username.value, password.value)
    if (result.success) {
      error.value = ''
      alert.value.show('Login successful!', 'success')
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      error.value = getErrorMessage(result.error, 'Email or password is incorrect!')
    }
  } finally {
    loading.value = false
  }
}
async function handleGoogleLogin() {
  loading.value = true
  try {
    const result = await loginWithGoogle()
    if (result.success) {
      error.value = ''
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      error.value = getErrorMessage(result.error, 'Google login authorization error!')
    }
  } finally {
    loading.value = false
  }
}
async function handleResetPassword() {
  if (!username.value) {
    alert.value.show('Please enter your email first!', 'warning')
    return
  }

  const result = await resetPassword(username.value)
  if (result.success) {
    alert.value.show('Password reset email sent! Please check your inbox.', 'success')
  } else {
    alert.value.show(result.error || 'Failed to send reset email.', 'error')
  }
}
function goToRegister() {
  router.push('/register')
}
</script>
