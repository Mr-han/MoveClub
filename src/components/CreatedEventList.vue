<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-900">Created Events ({{ events.length }})</h3>
      <button
        @click="openModal()"
        class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>Add New Event
      </button>
    </div>

    <div class="space-y-6">
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
      <div v-else class="bg-transparent shadow-none border-none">
        <DataTable
          :value="events"
          dataKey="id"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          class="custom-datatable"
        >
          <Column>
            <template #body="{ data }">
              <EventItem
                :key="data.id"
                :title="data.name"
                :description="data.description"
                :type="data.type"
                :capacity="data.capacity"
                :address="data.address"
                :participants="data.participants"
                :time="data.datetime"
                :duration="data.duration"
                :organizerName="'Me'"
                :organizerAvatar="'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'"
                context="profile-created"
                @edit="openModal(data)"
                @delete="deleteEvent(data.id)"
                @manage-users="$emit('manage-users')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <EventModal ref="eventModal" @saved="loadEvents(true)" />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import EventItem from './EventItem.vue'
import EventModal from './EventModal.vue'
import { EventService } from '@/api/event'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUserStatsStore } from '@/stores/store.js'

const state = useUserStatsStore()
const auth = getAuth()
const uid = ref(null)
const events = ref([])
const loading = ref(false)
const eventModal = ref(null)
const alert = inject('alert')
function normalizeEvent(e) {
  return { ...e, capacity: e.capacity ?? 10, address: e.address ?? '', createdByMe: true }
}

async function loadEvents() {
  if (!uid.value || loading.value) return
  loading.value = true
  try {
    const res = await EventService.getByUid(uid.value)
    events.value = (res || []).map(normalizeEvent)
    state.setCreated(events.value.length)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
function deleteEvent(id) {
  if (confirm('Delete?')) {
    try {
      EventService.remove(id)
      events.value = events.value.filter((e) => e.id !== id)
      alert.value.show('delete successful!', 'success')
    } catch (err) {
      console.log(err)
      alert.value.show('delete failed!', 'error')
    }
  }
}
function openModal(event = null) {
  eventModal.value?.openModal(event)
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    uid.value = user?.uid ?? null
    if (uid.value) loadEvents()
  })
})
</script>

<style scoped>
/* 整个表格背景去掉 */
:deep(.p-datatable) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 表头去掉 */
:deep(.p-datatable .p-datatable-thead) {
  display: none !important;
}

/* 行去掉背景 */
:deep(.p-datatable .p-datatable-tbody > tr) {
  background: transparent !important;
  border: none !important;
}

/* 单元格去掉 padding 和边框 */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 10px 0px;
  border: none !important;
  background: transparent !important;
}

/* 分页栏背景也透明 */
:deep(.p-paginator) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
</style>
