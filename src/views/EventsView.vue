<template>
  <div class="font-inter bg-gray-50 min-h-screen">
    <!-- Header -->
    <section class="bg-white border-b border-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">All Events</h2>
        <p class="text-gray-600">Discover amazing events happening in your community</p>
      </div>
    </section>

    <!-- Filters -->
    <section class="bg-white border-b border-gray-100 py-6">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <div class="flex-1 min-w-[300px] relative">
            <i
              class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            ></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            v-model="selectedCategory"
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option v-for="icon in iconOptions" :key="icon.type" :value="icon.type">
              {{ icon.type }}
            </option>
          </select>
          <select
            v-model="sortOption"
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="dateAsc">Date Ascending</option>
            <option value="dateDesc">Date Descending</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Events -->
    <main class="py-8">
      <div class="max-w-7xl mx-auto px-6">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="n in rowsPerPage"
            :key="n"
            class="h-64 bg-gray-200 animate-pulse rounded-lg"
          ></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EventCard v-for="event in paginatedEvents" :key="event.id" :event="event" />
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center">
          <Paginator
            :first="currentPage * rowsPerPage"
            :rows="rowsPerPage"
            :totalRecords="filteredEvents.length"
            :rowsPerPageOptions="[6, 12, 18]"
            @page="onPageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import EventCard from '../components/EventCard.vue'
import { EventService } from '@/api/event'
import Paginator from 'primevue/paginator'
import { iconOptions } from '@/config'

const events = ref([])
const loading = ref(true)

const searchQuery = ref('')
const selectedCategory = ref('')
const sortOption = ref('dateAsc')

const currentPage = ref(0)
const rowsPerPage = ref(6)

const loadEvents = async () => {
  loading.value = true
  const res = await EventService.getAll()
  events.value = res || []
  loading.value = false
}

onMounted(() => loadEvents())

const filteredEvents = computed(() => {
  let list = [...events.value]
  if (selectedCategory.value) list = list.filter((e) => e.type === selectedCategory.value)
  if (searchQuery.value)
    list = list.filter((e) => e.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (sortOption.value === 'dateAsc')
    list.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  if (sortOption.value === 'dateDesc')
    list.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  if (sortOption.value === 'popular')
    list.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
  return list
})

const paginatedEvents = computed(() => {
  const start = currentPage.value * rowsPerPage.value
  return filteredEvents.value.slice(start, start + rowsPerPage.value)
})

watch([searchQuery, selectedCategory, sortOption], () => {
  currentPage.value = 0
})

const onPageChange = (event) => {
  currentPage.value = event.page
  rowsPerPage.value = event.rows
}
</script>
