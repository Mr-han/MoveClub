<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b flex items-center justify-between">
        <h3 class="text-2xl font-semibold text-gray-900">
          {{ isEdit ? 'Edit Event' : 'Create Event' }}
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <form @submit.prevent="submit" class="space-y-6">
          <!-- Icon selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Event Cover *</label>
            <div class="grid grid-cols-8 gap-3">
              <button
                v-for="option in iconOptions"
                :key="option.icon"
                type="button"
                @click="selectIcon(option)"
                :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center shadow hover:scale-105 transition-transform',
                  option.bg,
                  selectedIcon.icon === option.icon ? 'ring-4 ring-primary' : '',
                ]"
              >
                <i :class="[option.icon, 'text-white text-lg']"></i>
              </button>
            </div>
          </div>

          <!-- Name & Type -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Event Name *</label>
              <input
                type="text"
                v-model="form.name"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter event name"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Event Type *</label>
              <select
                v-model="form.type"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select event type</option>
                <option v-for="option in iconOptions" :key="option.type" :value="option.type">
                  {{ option.type }}
                </option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your event..."
            ></textarea>
          </div>

          <!-- Location (Mapbox Autocomplete) -->
          <!-- 地址输入 -->
          <div class="space-y-2">
            <!-- 提示信息 -->
            <p class="text-sm text-gray-500">Please enter an address in Melbourne</p>

            <label class="block text-sm font-medium text-gray-700">Address *</label>

            <!-- Mapbox Autocomplete 容器 -->
            <div ref="geocoderContainer" class="relative"></div>

            <!-- 选中地址显示 -->
            <p class="text-sm text-gray-500">
              Selected: {{ form.address }}
              <span v-if="form.latitude && form.longitude">
                ({{ form.latitude }}, {{ form.longitude }})
              </span>
            </p>
          </div>

          <!-- Date, Capacity, Duration -->
          <div class="grid grid-cols-12 gap-4">
            <!-- Date & Time -->
            <div class="col-span-6 space-y-2">
              <label class="block text-sm font-medium text-gray-700">Date & Time *</label>
              <input
                type="datetime-local"
                v-model="form.datetime"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <!-- Capacity -->
            <div class="col-span-3 space-y-2">
              <label class="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                v-model="form.capacity"
                min="1"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Capacity"
              />
            </div>

            <!-- Duration -->
            <div class="col-span-3 space-y-2">
              <label class="block text-sm font-medium text-gray-700">Duration (hours)</label>
              <input
                type="number"
                v-model="form.duration"
                min="0.5"
                step="0.5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Duration"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              @click="close"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-indigo-600 transition flex items-center justify-center gap-2 shadow-sm"
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
import { reactive, ref, defineExpose, inject, nextTick, onBeforeUnmount, watch } from 'vue'
import { EventService } from '@/api/event'
import mapboxgl from 'mapbox-gl'
import { iconOptions } from '@/config'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const loading = ref(false)
const alert = inject('alert')
const visible = ref(false)
const isEdit = ref(false)
const selectedEventId = ref(null)
const emit = defineEmits(['saved'])
const geocoderContainer = ref(null)
let geocoderInstance = null

const selectedIcon = reactive({
  icon: 'fas fa-running',
  bg: 'bg-gradient-to-r from-green-400 to-green-600',
})

// 表单
const form = reactive({
  name: '',
  type: 'Sports',
  description: '',
  address: '',
  latitude: null,
  longitude: null,
  datetime: '',
  capacity: 10,
  duration: 1,
})

// 当 type 变化时，自动选中对应 icon
watch(
  () => form.type,
  (newType) => {
    const matched = iconOptions.find((i) => i.type === newType)
    if (matched) {
      selectedIcon.icon = matched.icon
      selectedIcon.bg = matched.bg
    }
  },
)

function destroyGeocoder() {
  if (geocoderInstance) {
    geocoderInstance.onRemove()
    geocoderInstance = null
  }
}

function selectIcon(option) {
  selectedIcon.icon = option.icon
  selectedIcon.bg = option.bg
  form.type = option.type // 同步 type
}

function openModal(event = null) {
  if (event) {
    isEdit.value = true
    selectedEventId.value = event.id
    Object.assign(form, event)
    const matched = iconOptions.find((i) => i.type === event.type)
    if (matched) {
      selectedIcon.icon = matched.icon
      selectedIcon.bg = matched.bg
    }
  } else {
    isEdit.value = false
    selectedEventId.value = null
    Object.assign(form, {
      name: '',
      type: 'Sports',
      description: '',
      address: '',
      latitude: null,
      longitude: null,
      datetime: '',
      capacity: 10,
      duration: 1,
    })
    const matched = iconOptions.find((i) => i.type === 'Sports')
    selectedIcon.icon = matched.icon
    selectedIcon.bg = matched.bg
  }

  visible.value = true

  nextTick(() => {
    destroyGeocoder()

    if (!mapboxAccessToken) {
      alert.value.show('Mapbox access token is missing. Please check your environment config.', 'error')
      return
    }

    mapboxgl.accessToken = mapboxAccessToken
    geocoderInstance = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: 'Search for address in Melbourne',
      types: 'address,place',
      proximity: { longitude: 144.9631, latitude: -37.8136 },
      countries: 'au',
      mapboxgl: mapboxgl,
      marker: false,
      language: 'en',
    })
    geocoderInstance.addTo(geocoderContainer.value)

    geocoderInstance.on('result', (e) => {
      form.address = e.result.place_name
      form.longitude = e.result.geometry.coordinates[0]
      form.latitude = e.result.geometry.coordinates[1]
    })

    if (form.address) {
      geocoderInstance.setInput(form.address)
    }
  })
}
function close() {
  visible.value = false
  destroyGeocoder()
}
async function submit() {
  if (!form.name.trim()) return alert.value.show('Event name is required', 'error')
  if (!form.type) return alert.value.show('Event type is required', 'error')
  if (!form.address.trim()) return alert.value.show('Address is required', 'error')
  if (!form.latitude || !form.longitude)
    return alert.value.show('Please select a valid address from the suggestions', 'error')
  if (!form.datetime) return alert.value.show('Date & time are required', 'error')

  try {
    loading.value = true
    const payload = { ...form, icon: selectedIcon.icon }
    if (isEdit.value) {
      await EventService.update({ id: selectedEventId.value, ...payload })
      alert.value.show('Updated successfully', 'success')
    } else {
      await EventService.add(payload)
      alert.value.show('Created successfully', 'success')
    }
    emit('saved')
    visible.value = false
  } catch (err) {
    console.error(err)
    alert.value.show('Submit failed', 'error')
  } finally {
    loading.value = false
  }
}

defineExpose({ openModal })
onBeforeUnmount(destroyGeocoder)
</script>

<style>
/* ============================ */

/* 清除按钮在右边 */
.mapboxgl-ctrl-geocoder .clear-button {
  flex: none;
  background-color: #e5e7eb; /* gray-200 */
  color: #6b7280; /* gray-500 */
  border-radius: 9999px; /* fully rounded */
  padding: 0.25rem;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mapboxgl-ctrl-geocoder .clear-button:hover {
  background-color: #d1d5db; /* gray-300 */
}

/* 下拉提示框 */
.mapboxgl-ctrl-geocoder .suggestions {
  position: absolute !important; /* 相对父容器绝对定位 */
  top: 100% !important; /* 紧贴输入框下方 */
  left: 0 !important; /* 左对齐 */
  width: 100% !important; /* 与输入框等宽 */
  margin-top: 0.25rem; /* Tailwind mt-1 */
  border-radius: 0.5rem; /* rounded-lg */
  border: 1px solid #d1d5db; /* gray-300 */
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); /* shadow-sm */
  font-size: 0.875rem;
  z-index: 50; /* 确保在 modal 上层显示 */
}

/* 下拉项 */
.mapboxgl-ctrl-geocoder .suggestions li {
  padding: 0.5rem 0.75rem; /* Tailwind px-3 py-2 */
  cursor: pointer;
  transition: background-color 0.2s;
}

.mapboxgl-ctrl-geocoder .suggestions li:hover {
  background-color: #eef2ff; /* Tailwind indigo-100 */
}

.mapboxgl-ctrl-geocoder .suggestions li.active {
  background-color: #6366f1; /* Tailwind primary-indigo */
  color: white;
}

/* 统一整体容器 */
.mapboxgl-ctrl-geocoder {
  width: 100% !important;
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.5rem; /* rounded-lg */
  background-color: #ffffff;
  height: 3rem; /* py-3 等价于约 3rem */
  padding: 0 1rem; /* px-4 */
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

/* 聚焦时高亮 */
.mapboxgl-ctrl-geocoder:focus-within {
  border-color: transparent;
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.5); /* focus:ring-primary */
}

/* 输入框 */
.mapboxgl-ctrl-geocoder input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem; /* text-sm */
  color: #111827; /* gray-900 */
  background-color: transparent;
  padding: 0; /* 去除默认 padding */
  height: 100%; /* 填充容器高度 */
  font-family: inherit;
}

/* 占位符样式 */
.mapboxgl-ctrl-geocoder input::placeholder {
  color: #9ca3af; /* gray-400 */
}

/* 左侧图标 */
.mapboxgl-ctrl-geocoder .geocoder-icon {
  color: #6b7280; /* gray-500 */
  font-size: 1rem;
  margin-right: 0.75rem;
}

/* 清除按钮 */
.mapboxgl-ctrl-geocoder .clear-button {
  background-color: #f3f4f6; /* gray-100 */
  color: #6b7280;
  border-radius: 9999px;
  padding: 0.25rem;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mapboxgl-ctrl-geocoder .clear-button:hover {
  background-color: #e5e7eb; /* gray-200 */
}
</style>
