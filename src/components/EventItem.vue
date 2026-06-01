<template>
  <div
    class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-all duration-200"
  >
    <div class="flex items-start">
      <!-- Icon -->
      <div
        :class="
          selectedIcon.bg + ' w-20 h-20 rounded-2xl flex items-center justify-center mr-8 shadow-lg'
        "
      >
        <i :class="selectedIcon.icon + ' text-white text-3xl'"></i>
      </div>

      <!-- Main Info -->
      <div class="flex-1 mr-8">
        <div class="mb-4">
          <div class="flex flex-wrap items-center space-x-3 mb-2">
            <h4 class="text-2xl font-bold text-gray-900">{{ title }}</h4>
            <span
              class="px-4 py-1 rounded-full text-sm font-semibold"
              :class="selectedIcon.colorClass"
            >
              {{ type }}
            </span>
            <span
              v-if="context === 'profile-created'"
              class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >Created by me</span
            >
            <span
              v-else-if="context === 'profile-joined'"
              class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
              >Joined</span
            >
          </div>

          <p class="text-gray-600 text-lg leading-relaxed mb-4">
            {{ description }}
          </p>
        </div>

        <!-- Detail Info -->
        <div class="grid grid-cols-4 gap-6 text-sm text-gray-600">
          <!-- Capacity -->
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <i class="fas fa-users text-green-600"></i>
            </div>
            <div>
              <div>
                <div class="font-semibold text-gray-900">
                  {{ participants.length }}/{{ capacity }}
                </div>
                <div class="text-xs text-gray-500">Joined</div>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i class="fas fa-map-marker-alt text-blue-600"></i>
            </div>
            <div>
              <div class="font-semibold text-gray-900 truncate w-[100px]">
                {{ address }}
              </div>
              <div class="text-xs text-gray-500">Location</div>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <i class="fas fa-calendar text-purple-600"></i>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ datePart }}</div>
              <div class="text-xs text-gray-500">{{ timePart }}</div>
            </div>
          </div>

          <!-- Duration -->
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <i class="fas fa-clock text-yellow-600"></i>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ duration }} hours</div>
              <div class="text-xs text-gray-500">Duration</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col space-y-3 w-32">
        <!-- Created Events -->
        <template v-if="context === 'profile-created'">
          <button
            class="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            @click="$emit('manage-users')"
          >
            <i class="fas fa-users mr-1"></i>Manage
          </button>
          <button
            class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            @click="$emit('edit')"
          >
            <i class="fas fa-edit mr-1"></i>Edit
          </button>
          <button
            class="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            @click="$emit('delete')"
          >
            <i class="fas fa-trash mr-1"></i>Delete
          </button>
        </template>

        <!-- Joined Events -->
        <template v-else-if="context === 'profile-joined'">
          <button
            class="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            @click="$emit('leave')"
          >
            <i class="fas fa-sign-out-alt mr-1"></i>Leave
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { iconOptions } from '@/config'

const props = defineProps({
  title: String,
  description: String,
  type: String,
  capacity: Number,
  address: String,
  duration: Number,
  participants: Array,
  time: String,
  context: { type: String, default: 'home' }, // home / profile-created / profile-joined
})

const selectedIcon = computed(() => {
  return (
    iconOptions.find((i) => i.type === props.type) || {
      icon: 'fas fa-question',
      bg: 'bg-gray-400',
      color: 'gray',
    }
  )
})

const datePart = computed(() => {
  if (!props.time) return ''
  const d = new Date(props.time)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
})

const timePart = computed(() => {
  if (!props.time) return ''
  const d = new Date(props.time)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>
