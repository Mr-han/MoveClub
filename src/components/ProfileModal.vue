<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
      <div class="p-6 border-b flex items-center justify-between">
        <h3 class="text-2xl font-semibold text-gray-900">Edit Profile</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="p-8">
        <form @submit.prevent="submitProfile" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">Name *</label>
            <input
              type="text"
              v-model="profileForm.name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">Gender</label>
            <select
              v-model="profileForm.gender"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-3">Role</label>
            <div class="grid grid-cols-2 gap-4">
              <label
                class="cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
                :class="
                  profileForm.role === 'User'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-gray-400'
                "
              >
                <input type="radio" value="User" v-model="profileForm.role" class="hidden" />
                <i class="fas fa-user text-primary"></i>
                <span class="font-medium">Normal User</span>
              </label>

              <label
                class="cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
                :class="
                  profileForm.role === 'Organizer'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-gray-400'
                "
              >
                <input type="radio" value="Organizer" v-model="profileForm.role" class="hidden" />
                <i class="fas fa-users-cog text-primary"></i>
                <span class="font-medium">Organizer</span>
              </label>
            </div>
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">Bio</label>
            <textarea
              v-model="profileForm.bio"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <template v-if="!loading">Save Changes</template>
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
                Saving...
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, inject } from 'vue'
import { currentUser, updateUserProfile } from '@/api/auth'
const alert = inject('alert')
const emit = defineEmits(['close'])
const loading = ref(false)
const profileForm = reactive({
  name: currentUser.value?.name || '',
  gender: currentUser.value?.gender || '',
  role: currentUser.value?.role || 'User',
  bio: currentUser.value?.bio || '',
})

async function submitProfile() {
  loading.value = true
  const { success, error } = await updateUserProfile(profileForm)
  loading.value = false
  if (!success) {
    alert.value.show(error || 'Update user failed!', 'error')
    return
  }
  alert.value.show('Update user successfully!', 'success')
  emit('close')
}
</script>
