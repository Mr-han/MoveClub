<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-12"
  >
    <div class="w-full max-w-2xl">
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
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Join Our Community</h2>
        <p class="text-gray-600">Create your account to start organizing and joining events</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
        >
          <i class="fas fa-exclamation-circle mr-2"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Email + Gender -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-900"
              >Email Address *</label
            >
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              @blur="validateField('email')"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            <small v-if="errors.email" class="text-red-600">{{ errors.email }}</small>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-gray-900">Name *</label>
              <input
                type="text"
                id="name"
                v-model="name"
                placeholder="Enter your name"
                @blur="validateField('name')"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <small v-if="errors.name" class="text-red-600">{{ errors.name }}</small>
            </div>

            <!-- Gender -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-900">Gender</label>
              <div class="relative">
                <select
                  v-model="gender"
                  @blur="validateField('gender')"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <i class="fas fa-chevron-down text-gray-400"></i>
                </div>
              </div>
              <small v-if="errors.gender" class="text-red-600">{{ errors.gender }}</small>
            </div>
          </div>

          <!-- Password + Confirm Password -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-900"
                >Password *</label
              >
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  placeholder="Create a password"
                  @blur="validateField('password')"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <small v-if="errors.password" class="text-red-600">{{ errors.password }}</small>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-900"
                >Confirm Password *</label
              >
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  placeholder="Confirm your password"
                  @blur="validateField('confirmPassword')"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <small v-if="errors.confirmPassword" class="text-red-600">{{
                errors.confirmPassword
              }}</small>
            </div>
          </div>

          <!-- Role -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-900">Account Type</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Normal User -->
              <label
                class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                :class="!isOrganizer ? 'border-primary bg-primary/5' : ''"
              >
                <input
                  type="radio"
                  :checked="!isOrganizer"
                  @change="isOrganizer = false"
                  class="sr-only"
                />
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                    :class="!isOrganizer ? 'bg-primary/10' : ''"
                  >
                    <i
                      class="fas fa-user"
                      :class="!isOrganizer ? 'text-primary' : 'text-gray-600'"
                    ></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">Normal User</h4>
                    <p class="text-sm text-gray-600">Join and participate in events</p>
                  </div>
                </div>
              </label>

              <!-- Organizer -->
              <label
                class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                :class="isOrganizer ? 'border-primary bg-primary/5' : ''"
              >
                <input
                  type="radio"
                  :checked="isOrganizer"
                  @change="isOrganizer = true"
                  class="sr-only"
                />
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                    :class="isOrganizer ? 'bg-primary/10' : ''"
                  >
                    <i
                      class="fas fa-crown"
                      :class="isOrganizer ? 'text-primary' : 'text-gray-600'"
                    ></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">Event Organizer</h4>
                    <p class="text-sm text-gray-600">Create and manage events</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Bio -->
          <div class="space-y-2">
            <label for="bio" class="block text-sm font-medium text-gray-900">Bio</label>
            <textarea
              id="bio"
              v-model="bio"
              placeholder="Tell us about yourself"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            ></textarea>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input
              type="checkbox"
              v-model="agreeTerms"
              class="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label class="ml-3 text-sm text-gray-600">
              I agree to the
              <span class="text-primary hover:text-indigo-600 cursor-pointer"
                >Terms of Service</span
              >
              and
              <span class="text-primary hover:text-indigo-600 cursor-pointer">Privacy Policy</span>
            </label>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="w-full bg-primary/80 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium flex justify-center items-center"
            :disabled="loading"
          >
            <template v-if="!loading">
              <i class="fas fa-user-plus mr-2"></i>Create Account
            </template>
            <template v-else>
              <svg
                class="animate-spin h-5 w-5 text-white mr-2"
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
              Registering...
            </template>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?
            <button @click="goToLogin" class="text-primary/80 hover:text-indigo-600 font-medium">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'

const router = useRouter()
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const alert = inject('alert')
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const gender = ref(null)
const isOrganizer = ref(false)
const bio = ref('')
const errors = ref({})
const loading = ref(false)

function validateField(field) {
  switch (field) {
    case 'email':
      errors.value.email =
        email.value && /\S+@\S+\.\S+/.test(email.value) ? '' : 'Valid email is required'
      break
    case 'name':
      errors.value.name = name.value ? '' : 'Name is required'
      break
    case 'password':
      errors.value.password =
        password.value && password.value.length >= 6 ? '' : 'Password must be at least 6 characters'
      break
    case 'confirmPassword':
      errors.value.confirmPassword =
        confirmPassword.value === password.value ? '' : 'Passwords do not match'
      break
    case 'gender':
      errors.value.gender = gender.value ? '' : 'Please select gender'
      break
  }
}

function validateForm() {
  validateField('email')
  validateField('name')
  validateField('password')
  validateField('confirmPassword')
  validateField('gender')
  if (!agreeTerms.value) {
    errorMessage.value = 'You must agree to Terms of Service and Privacy Policy'
  } else {
    errorMessage.value = ''
  }

  return Object.values(errors.value).every((v) => !v)
}
function goToLogin() {
  router.push('/login')
}
async function handleRegister() {
  if (validateForm()) {
    loading.value = true
    const role = isOrganizer.value ? 'Organizer' : 'User'
    const result = await register({
      name: name.value,
      email: email.value,
      password: password.value,
      gender: gender.value,
      role,
      bio: bio.value,
    })

    if (result.success) {
      alert.value.show('Registration is successful, go to login!', 'success')
      router.push('/login')
    } else {
      errorMessage.value = result.error || 'Registration failed'
    }
    loading.value = false
  }
}
</script>
