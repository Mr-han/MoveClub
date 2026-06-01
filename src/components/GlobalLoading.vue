<!-- src/components/GlobalLoading.vue -->
<template>
  <transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black/30 bg-opacity-30 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl flex flex-col items-center shadow-lg">
        <svg
          class="animate-spin h-10 w-10 text-primary mb-2"
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
        <span class="text-gray-700">Loading...</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { isLoading } from '@/utils/loading'
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
