<template>
  <div class="font-inter bg-gray-50 min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary to-secondary h-[400px] flex items-center">
      <div class="max-w-7xl mx-auto px-6 w-full">
        <div class="text-center text-white">
          <h2 class="text-5xl font-bold mb-6">Connect. Move. Grow.</h2>
          <p class="text-xl mb-8 text-indigo-100">
            Join thousands of people organizing and participating in amazing events
          </p>

          <div class="flex justify-center items-center space-x-12 mb-8">
            <div class="text-center">
              <div class="text-4xl font-bold">{{ usersCount }}</div>
              <div class="text-indigo-200">Active Members</div>
            </div>
            <div class="w-px h-16 bg-indigo-300"></div>
            <div class="text-center">
              <div class="text-4xl font-bold">{{ allEvents.length }}</div>
              <div class="text-indigo-200">Events Organized</div>
            </div>
          </div>

          <button
            @click="goToEvents"
            class="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Now
          </button>
        </div>
      </div>
    </section>

    <!-- Popular Events -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">Popular Events</h3>
          <p class="text-gray-600 text-lg">Discover amazing events happening in your community</p>
        </div>
        <!-- Loading Animation -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="n in 6" :key="n" class="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <EventCard v-for="event in events" :key="event.id" :event="event" />
        </div>

        <div class="text-center mt-12">
          <button
            @click="goToEvents"
            class="bg-primary text-white px-8 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
          >
            View All Events
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { EventService } from '@/api/event.js'
import { UserService } from '@/api/user'
import EventCard from '../components/EventCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref([])
const loading = ref(true)
const allEvents = ref([])
const usersCount = ref(0)
const loadEvents = async () => {
  loading.value = true
  try {
    allEvents.value = await EventService.getAll()
    usersCount.value = await UserService.getCount()
    events.value = allEvents.value
      .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
      .slice(0, 6)
  } catch (err) {
    console.error(err)
    events.value = []
  } finally {
    loading.value = false
  }
}

function goToEvents() {
  router.push('/events')
}

onMounted(() => loadEvents())
</script>

<style scoped></style>
