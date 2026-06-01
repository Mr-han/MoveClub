<template>
  <div
    class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
  >
    <div class="p-6 space-y-4">
      <!-- Icon + Type -->
      <div class="flex items-center justify-between">
        <div :class="selectedIcon.bg + ' w-16 h-16 rounded-xl flex items-center justify-center'">
          <i :class="selectedIcon.icon + ' text-white text-2xl'"></i>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="selectedIcon.colorClass">
          {{ event.type }}
        </span>
      </div>

      <!-- Title & Description -->
      <div>
        <h4 class="text-xl font-semibold text-gray-900 mb-2">{{ event.name }}</h4>
        <p class="text-gray-600">{{ event.description }}</p>
      </div>

      <!-- Participants, Location, Time -->
      <div class="space-y-2 text-gray-500 text-sm">
        <!-- Participants / Capacity -->
        <div class="flex items-center">
          <i class="fas fa-users w-4 mr-2"></i>
          <span>{{ participantCount }}/{{ event.capacity }}</span>
        </div>

        <!-- Duration -->
        <div class="flex items-center">
          <i class="fas fa-clock w-4 mr-2"></i>
          <span>{{ event.duration }} hours</span>
        </div>

        <div class="flex items-center">
          <i class="fas fa-map-marker-alt w-4 mr-2"></i>
          <span>{{ event.address }}</span>
        </div>
        <div class="flex items-center">
          <i class="fas fa-calendar w-4 mr-2"></i>
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img :src="event.organizerAvatar" alt="Organizer" class="w-8 h-8 rounded-full mr-2" />
          <span class="text-sm text-gray-600">{{ event.organizerName }}</span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            v-if="!joined"
            class="text-primary hover:text-indigo-600 font-medium"
            @click="joinEvent"
          >
            Join Event
          </button>
          <button
            v-else
            class="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-100"
            @click="leaveEvent"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { EventService } from '@/api/event.js'
import { currentUser } from '@/api/auth'
import { showLoading, hideLoading } from '@/utils/loading'
import { iconOptions } from '@/config'

const alert = inject('alert')

const props = defineProps({
  event: { type: Object, required: true },
})

const localParticipants = ref([])

watch(
  () => props.event.participants,
  (participants) => {
    localParticipants.value = [...(participants || [])]
  },
  { immediate: true },
)

const selectedIcon = computed(
  () =>
    iconOptions.find((i) => i.type === props.event.type) || {
      icon: 'fas fa-question',
      bg: 'bg-gray-400',
      color: 'gray',
    },
)

const formattedTime = computed(() => {
  if (!props.event.datetime) return ''
  const d = new Date(props.event.datetime)
  return d.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const joined = computed(() => {
  return localParticipants.value.includes(currentUser.value?.uid)
})

const participantCount = computed(() => localParticipants.value.length)

const joinEvent = async () => {
  if (!currentUser.value) {
    window.location.href = '/login'
    return
  }
  showLoading()
  await EventService.registerParticipant(props.event.id)
  if (!localParticipants.value.includes(currentUser.value.uid)) {
    localParticipants.value = [...localParticipants.value, currentUser.value.uid]
  }
  alert.value.show('Successfully joined the event.', 'success')
  hideLoading()
}

const leaveEvent = async () => {
  showLoading()
  await EventService.removeParticipant(props.event.id)
  localParticipants.value = localParticipants.value.filter((id) => id !== currentUser.value.uid)
  alert.value.show('You have left this event.', 'success')
  hideLoading()
}
</script>
