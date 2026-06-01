<template>
  <div class="font-inter bg-gray-50 min-h-screen">
    <main class="w-full">
      <!-- Header -->
      <section class="bg-white border-b border-gray-100 py-8">
        <div class="max-w-7xl mx-auto px-6">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p class="text-gray-600">Overview and control of your website's data</p>
        </div>
      </section>

      <div class="p-6 max-w-7xl mx-auto">
        <!-- Metrics Cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            v-for="card in metricsCards"
            :key="card.title"
            class="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">{{ card.title }}</p>
                <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
                <p class="text-green-600 text-sm">{{ card.trend }}</p>
              </div>
              <div
                :class="card.iconBg"
                class="w-12 h-12 rounded-lg flex items-center justify-center"
              >
                <i :class="card.icon" class="text-white"></i>
              </div>
            </div>
          </div>
        </section>

        <!-- Charts Section -->
        <section class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div
            v-for="chart in charts"
            :key="chart.id"
            class="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ chart.title }}</h3>
            <apexchart
              v-if="chart.type && chart.series && chart.options"
              :type="chart.type"
              :series="chart.series"
              :options="chart.options"
              height="250"
            />
          </div>
        </section>

        <!-- Events Table -->
        <section class="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Events</h3>
            <div class="flex space-x-3">
              <InputText v-model="eventFilters.name" placeholder="Search by name" />
              <Dropdown
                v-model="eventFilters.type"
                :options="eventTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by type"
              />
            </div>
          </div>

          <DataTable :value="filteredEvents" paginator :rows="5" responsive-layout="scroll">
            <Column field="name" header="Event" sortable></Column>
            <Column field="type" header="Type" sortable></Column>
            <Column field="organizerName" header="Organizer" sortable></Column>
            <Column field="address" header="Location" sortable></Column>
            <Column header="P/C">
              <template #body="slotProps">
                {{ slotProps.data.participants?.length || 0 }}/{{ slotProps.data.capacity || 0 }}
              </template>
            </Column>
            <Column field="datetime" header="Date" :body="dateTemplate"></Column>
          </DataTable>
        </section>

        <!-- Users Table -->
        <section class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Users</h3>
            <InputText v-model="userSearch" placeholder="Search by name" />
          </div>

          <DataTable :value="filteredUsers" paginator :rows="5" responsive-layout="scroll">
            <Column field="name" header="Name" sortable></Column>
            <Column field="role" header="Role" sortable></Column>
            <Column field="email" header="Email"></Column>
            <Column field="gender" header="Gender"></Column>
          </DataTable>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { showLoading, hideLoading } from '@/utils/loading'
import { EventService } from '@/api/event'
import { UserService } from '@/api/user'
import { iconOptions } from '@/config'

const events = ref([])
const users = ref([])
const metricsCards = ref([])
const charts = ref([])

const eventFilters = ref({ name: '', type: null })
const userSearch = ref('')

const eventTypes = ref([
  { label: 'All', value: null },
  ...iconOptions.map((option) => ({ label: option.type, value: option.type })),
])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const dateTemplate = (rowData) => formatDate(rowData.datetime)

const filteredEvents = computed(() =>
  events.value.filter(
    (e) =>
      (!eventFilters.value.name ||
        e.name.toLowerCase().includes(eventFilters.value.name.toLowerCase())) &&
      (!eventFilters.value.type || e.type === eventFilters.value.type),
  ),
)

const filteredUsers = computed(() =>
  users.value.filter(
    (u) => !userSearch.value || u.name.toLowerCase().includes(userSearch.value.toLowerCase()),
  ),
)

const initCharts = (eventsData, usersData) => {
  const typeCounts = eventsData.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})
  const roleCounts = usersData.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})
  const genderCounts = usersData.reduce((acc, u) => {
    acc[u.gender] = (acc[u.gender] || 0) + 1
    return acc
  }, {})

  charts.value = [
    {
      id: 'event-types-chart',
      title: 'Event Types Distribution',
      type: 'pie',
      series: Object.values(typeCounts),
      options: { labels: Object.keys(typeCounts), legend: { position: 'bottom' } },
    },
    {
      id: 'users-role-chart',
      title: 'Users by Role',
      type: 'bar',
      series: [{ name: 'Users', data: Object.values(roleCounts) }],
      options: { xaxis: { categories: Object.keys(roleCounts) }, colors: ['#6366f1'] },
    },
    {
      id: 'gender-chart',
      title: 'Users by Gender',
      type: 'pie',
      series: Object.values(genderCounts),
      options: { labels: Object.keys(genderCounts), legend: { position: 'bottom' } },
    },
    {
      id: 'participation-chart',
      title: 'Average Event Participation',
      type: 'line',
      series: [
        {
          name: 'Participants per Event',
          data: eventsData.map((e) => e.participants?.length || 0),
        },
      ],
      options: { xaxis: { categories: eventsData.map((e) => e.name) } },
    },
  ]
}

const initMetrics = (eventsData, usersData) => {
  metricsCards.value = [
    {
      title: 'Total Events',
      value: eventsData.length,
      //   trend: '+12% from last month',
      icon: 'fas fa-calendar',
      iconBg: 'bg-gradient-to-r from-blue-400 to-blue-600',
    },
    {
      title: 'Total Users',
      value: usersData.length,
      //   trend: '+8% from last month',
      icon: 'fas fa-users',
      iconBg: 'bg-gradient-to-r from-green-400 to-green-600',
    },
    {
      title: 'Total Participants',
      value: eventsData.reduce((sum, e) => sum + (e.participants?.length || 0), 0),
      //   trend: '+15% from last month',
      icon: 'fas fa-user-check',
      iconBg: 'bg-gradient-to-r from-purple-400 to-purple-600',
    },
    {
      title: 'Active Organizers',
      value: usersData.filter((u) => u.role === 'Organizer').length,
      //   trend: '+5% from last month',
      icon: 'fas fa-crown',
      iconBg: 'bg-gradient-to-r from-orange-400 to-orange-600',
    },
  ]
}

onMounted(async () => {
  showLoading()
  events.value = await EventService.getAll()
  users.value = await UserService.getAll()
  initMetrics(events.value, users.value)
  initCharts(events.value, users.value)
  hideLoading()
})
</script>

<style>
.font-inter {
  font-family: 'Inter', sans-serif;
}
::-webkit-scrollbar {
  display: none;
}
</style>
