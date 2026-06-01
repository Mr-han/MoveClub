<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50',
        typeClasses[type] || typeClasses.info,
      ]"
    >
      <i :class="iconClasses[type] || iconClasses.info"></i>
      <span>{{ message }}</span>
      <button @click="close" class="ml-2 text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'AlertMessage',
})

const visible = ref(false)
const message = ref('')
const type = ref('info')

// 不同类型样式
const typeClasses = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white',
}

// 不同类型图标
const iconClasses = {
  success: 'fas fa-check-circle',
  error: 'fas fa-times-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle',
}

function show(msg, alertType = 'info', duration = 3000) {
  message.value = msg
  type.value = alertType
  visible.value = true
  if (duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, duration)
  }
}

function close() {
  visible.value = false
}

defineExpose({ show })
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
