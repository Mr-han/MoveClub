<template>
  <div class="font-inter bg-gray-50 min-h-screen flex flex-col relative">
    <!-- Header -->
    <section class="bg-white border-b border-gray-100 py-6 z-20">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Event Map</h2>
        <p class="text-gray-600">Explore all events around Melbourne</p>
      </div>
    </section>

    <!-- Map -->
    <div
      ref="mapContainer"
      class="flex-1 w-full h-[calc(100vh-120px)] relative p-2 sm:p-4 md:p-6 box-border"
    ></div>

    <!-- Event Detail Card -->
    <!-- Event Detail Overlay -->
    <transition name="slide-up">
      <div v-if="selectedEvent" class="fixed bottom-6 right-6 w-[380px] z-50">
        <div class="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible">
          <!-- Close Button -->
          <button
            class="absolute -top-4 -right-4 bg-white border border-gray-300 rounded-full shadow-md w-8 h-8 flex items-center justify-center hover:bg-gray-100 z-10"
            @click="selectedEvent = null"
          >
            <i class="fas fa-times text-gray-500"></i>
          </button>
          <button
            v-if="selectedEvent"
            class="absolute -top-4 right-10 bg-blue-600 text-white rounded-full shadow-md px-3 py-1 text-sm flex items-center gap-1 hover:bg-blue-700 z-10"
            @click="openInGoogleMaps(selectedEvent)"
          >
            <i class="fas fa-location-arrow text-xs"></i>
            Navigate
          </button>

          <!-- Scrollable card content -->
          <div class="max-h-[80vh] overflow-y-auto rounded-xl">
            <EventDetailCard :event="selectedEvent" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { EventService } from '@/api/event'
import EventDetailCard from '@/components/EventCard.vue'
import { showLoading, hideLoading } from '@/utils/loading'
import { iconOptions } from '@/config'

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
if (!mapboxAccessToken) {
  throw new Error('Missing required environment variable: VITE_MAPBOX_ACCESS_TOKEN')
}

mapboxgl.accessToken = mapboxAccessToken

const mapContainer = ref(null)
let map = null
const events = ref([])
let userLocation = null
const selectedEvent = ref(null)

// 获取用户位置
const getUserLocation = () =>
  new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(null),
      )
    } else {
      resolve(null)
    }
  })

const loadEvents = async () => {
  const res = await EventService.getAll()
  events.value = res || []
}

onMounted(async () => {
  showLoading()
  userLocation = await getUserLocation()
  await loadEvents()

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: userLocation || [144.9631, -37.8136],
    zoom: 11,
  })
  map.addControl(new mapboxgl.NavigationControl())

  map.on('load', () => {
    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3b82f6', 'line-width': 4 },
    })
    addMarkers()
    addUserMarker()
    fitMapToEvents()
    hideLoading()
  })
})

const openInGoogleMaps = (event) => {
  const lat = event.latitude
  const lng = event.longitude
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  window.open(url, '_blank')
}

// 适应地图边界
const fitMapToEvents = () => {
  const bounds = new mapboxgl.LngLatBounds()
  events.value.forEach((e) => {
    if (e.longitude && e.latitude) bounds.extend([Number(e.longitude), Number(e.latitude)])
  })
  if (userLocation) bounds.extend(userLocation)
  if (!bounds.isEmpty())
    map.fitBounds(bounds, { padding: { top: 100, bottom: 100, left: 80, right: 80 } })
}

// 自定义 Marker
const createMarkerElement = (event) => {
  // 找到对应类型的 iconOptions
  const match = iconOptions.find((i) => i.type === event.type)
  const icon = match ? match.icon : 'fas fa-map-marker-alt'
  const bg = match ? match.bg : 'bg-gradient-to-r from-gray-400 to-gray-600'

  // 创建 DOM 元素
  const el = document.createElement('div')
  el.className = 'relative flex flex-col items-center group cursor-pointer'
  el.innerHTML = `
    <div class="w-10 h-10 flex items-center justify-center rounded-full
                ${bg} text-white shadow-md
                transform transition-transform duration-200
                group-hover:scale-110">
      <i class="${icon} text-lg"></i>
    </div>
  `
  return el
}

// 添加 markers
const addMarkers = () => {
  events.value.forEach((event) => {
    if (!event.longitude || !event.latitude) return
    const lat = Number(event.latitude)
    const lng = Number(event.longitude)
    if (isNaN(lat) || isNaN(lng)) return

    const el = createMarkerElement(event)

    el.addEventListener('click', async () => {
      const start = userLocation || [144.9631, -37.8136]
      selectedEvent.value = event
      await drawRoute(start, [lng, lat])
    })

    new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map)
  })
}

// 绘制路线
async function drawRoute(start, end) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
  const res = await fetch(url)
  const data = await res.json()
  const route = data.routes[0]?.geometry
  if (!route) return

  map.getSource('route').setData({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: route }],
  })

  const bounds = new mapboxgl.LngLatBounds()
  route.coordinates.forEach((coord) => bounds.extend(coord))
  if (userLocation) bounds.extend(userLocation)
  map.fitBounds(bounds, { padding: 60 })
}

// 用户位置
const addUserMarker = () => {
  if (!userLocation) return
  const el = document.createElement('div')
  el.className = `
    w-10 h-10 flex items-center justify-center rounded-full
    bg-blue-600 text-white shadow-md
  `
  el.innerHTML = '<i class="fas fa-user"></i>'
  new mapboxgl.Marker(el).setLngLat(userLocation).addTo(map)
}
</script>

<style scoped>
.mapboxgl-popup-content {
  font-family: 'Inter', sans-serif;
  border-radius: 0.75rem;
  padding: 12px 16px;
}

.mapboxgl-popup-tip {
  display: none;
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
