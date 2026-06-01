<script setup>
import MHeader from './components/MHeader.vue'
import { useRoute } from 'vue-router'
import Alert from './components/Alert.vue'
import { ref, provide } from 'vue'
import GlobalLoading from './components/GlobalLoading.vue'
const route = useRoute()
const alertRef = ref(null)
provide('alert', alertRef)
</script>

<template>
  <div class="main-container">
    <MHeader v-if="route.meta.showHeader" />
  </div>
  <div class="main-box" role="main">
    <router-view />
  </div>
  <Alert ref="alertRef" />
  <GlobalLoading />
</template>
