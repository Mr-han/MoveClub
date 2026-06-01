<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-100 h-fit top-8 p-6">
    <div class="text-center mb-6">
      <img
        :src="currentUser.avatar"
        alt="Profile"
        class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100"
      />
      <h3 class="text-xl font-semibold text-gray-900">
        {{ currentUser.name }}
        <i v-if="currentUser.gender === 'male'" class="fas fa-mars text-blue-500"></i>
        <i v-else-if="currentUser.gender === 'female'" class="fas fa-venus text-pink-500"></i>
        <i v-else class="fas fa-genderless text-gray-400"></i>
      </h3>
      <p class="text-gray-600">{{ currentUser.email }}</p>
      <span
        class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2"
      >
        {{ currentUser.role }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="text-center p-3 bg-green-50 rounded-lg">
        <div
          class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
        >
          <i class="fas fa-plus-circle text-green-600 text-lg"></i>
        </div>
        <div class="text-lg font-bold text-green-800">{{ state.created }}</div>
        <div class="text-xs text-green-600">Created</div>
      </div>
      <div class="text-center p-3 bg-blue-50 rounded-lg">
        <div
          class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
        >
          <i class="fas fa-calendar-check text-blue-600 text-lg"></i>
        </div>
        <div class="text-lg font-bold text-blue-800">{{ state.joined }}</div>
        <div class="text-xs text-blue-600">Joined</div>
      </div>
      <div class="text-center p-3 bg-yellow-50 rounded-lg">
        <div
          class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2"
        >
          <i class="fas fa-bookmark text-yellow-600 text-lg"></i>
        </div>
        <div class="text-lg font-bold text-yellow-800">{{ state.saved }}</div>
        <div class="text-xs text-yellow-600">Saved</div>
      </div>
    </div>

    <div class="border-t pt-4">
      <h4 class="font-semibold text-gray-900 mb-3">Bio</h4>
      <p class="text-gray-600 text-sm">
        {{ currentUser.bio || 'No bio provided' }}
      </p>
    </div>

    <button
      class="w-full mt-6 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
      @click="openProfileModal"
    >
      <i class="fas fa-edit mr-2"></i>Edit Profile
    </button>
    <button
      @click="handleLogout"
      class="w-full mt-2 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
    >
      <i class="fas fa-sign-out-alt mr-2"></i>Logout
    </button>

    <!-- Profile Edit Modal -->
    <ProfileModal v-if="profileModalVisible" @close="closeProfileModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { currentUser, logout } from '@/api/auth'
import ProfileModal from './ProfileModal.vue'
import { useRouter } from 'vue-router'
import { useUserStatsStore } from '@/stores/store.js'

const state = useUserStatsStore()
const router = useRouter()

const profileModalVisible = ref(false)

function openProfileModal() {
  profileModalVisible.value = true
}
function closeProfileModal() {
  profileModalVisible.value = false
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
