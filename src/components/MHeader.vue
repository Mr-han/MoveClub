<template>
  <header class="bg-white shadow-sm border-b border-gray-100" role="banner">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center"
        >
          <i class="fas fa-users text-white text-lg"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">MoveClub</h1>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center space-x-8" role="navigation">
        <router-link
          to="/"
          class="text-gray-600 hover:text-primary transition-colors"
          active-class="text-primary font-medium"
          >Home</router-link
        >
        <router-link
          to="/events"
          class="text-gray-600 hover:text-primary transition-colors"
          active-class="text-primary font-medium"
          >Events</router-link
        >
        <router-link
          to="/map"
          class="text-gray-600 hover:text-primary transition-colors"
          active-class="text-primary font-medium"
          >Map</router-link
        >
        <router-link
          to="/user"
          class="text-gray-600 hover:text-primary transition-colors"
          active-class="text-primary font-medium"
          >Profile</router-link
        >

        <router-link
          v-if="isAdmin"
          to="/admin-dashboard"
          class="text-gray-600 hover:text-primary transition-colors"
          active-class="text-primary font-medium"
          >Dashboard</router-link
        >
      </nav>

      <!-- User / Auth -->
      <div class="flex items-center space-x-4">
        <!-- Logged in -->
        <div v-if="isAuth" class="flex items-center space-x-2">
          <!-- 用户头像 -->
          <img
            :src="avatarUrl || defaultAvatar"
            :alt="currentUser.name ? currentUser.name + ' profile picture' : 'User profile picture'"
            class="w-8 h-8 rounded-full object-cover cursor-pointer"
            @click="goToUserView"
          />

          <!-- 登出按钮 -->
          <button
            class="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <!-- Not logged in -->
        <router-link
          v-else
          to="/login"
          class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
        >
          Login
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated, logout, getCurrentUser } from '../api/auth.js'
import { AVATAR } from '@/config'

const router = useRouter()
const isAuth = computed(() => isAuthenticated.value)
const currentUser = ref(null)
const avatarUrl = ref('')
const isAdmin = ref(false)
const defaultAvatar = `${AVATAR.baseUrl}guest`
// 获取当前用户
watchEffect(() => {
  const user = getCurrentUser()
  if (user) {
    currentUser.value = user
    // 如果用户没有 avatar，则用 DiceBear 默认头像
    avatarUrl.value = user.avatar || `${AVATAR.baseUrl}${user.uid}`
    isAdmin.value = user.role === 'Admin'
  } else {
    currentUser.value = null
    avatarUrl.value = ''
    isAdmin.value = false
  }
})

function handleLogout() {
  logout()
  router.push('/login')
}

function goToUserView() {
  router.push('/user')
}
</script>
