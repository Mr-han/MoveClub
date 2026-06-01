<template>
  <div v-if="loading" class="col-span-full flex justify-center items-center py-20">
    <svg
      class="animate-spin h-10 w-10 text-primary"
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
    <span class="ml-2 text-gray-700">Loading events...</span>
  </div>
  <div v-else>
    <FullCalendar :options="calendarOptions" />
    <div
      v-if="selectedEvent"
      class="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl overflow-hidden z-50"
    >
      <div class="flex justify-end p-2 border-b border-gray-200">
        <button
          @click="selectedEvent = null"
          class="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <EventCard :event="selectedEvent" @close="selectedEvent = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import EventCard from './EventCard.vue'
import { EventService } from '@/api/event'
const loading = ref(false)
const auth = getAuth()
const uid = ref(null)
const events = ref([])
const selectedEvent = ref(null)

const calendarOptions = ref({
  initialView: 'dayGridMonth',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  events: [],
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  height: 'auto',
  eventClick: (info) => {
    selectedEvent.value = info.event.extendedProps.fullEvent
  },
})

watch(events, (newEvents) => {
  calendarOptions.value.events = newEvents
})

function dedupe(eventsArray) {
  const map = new Map()
  eventsArray.forEach((ev) => map.set(ev.id, ev))
  return Array.from(map.values())
}

async function loadEvents() {
  if (!uid.value) return
  loading.value = true
  const createdEvents = await EventService.getByUid(uid.value)
  const joinedEvents = await EventService.getJoinedEvents(uid.value)

  const allEvents = dedupe([...createdEvents, ...joinedEvents])

  events.value = allEvents.map((ev) => {
    const start = new Date(ev.datetime)
    const end = new Date(start.getTime() + (ev.duration || 1) * 60 * 60 * 1000)
    return {
      id: ev.id,
      title: `${ev.name} (${ev.duration}h)`,
      start,
      end,
      extendedProps: {
        fullEvent: ev,
      },
    }
  })
  loading.value = false
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    uid.value = user?.uid ?? null
    if (uid.value) loadEvents()
  })
})
</script>
