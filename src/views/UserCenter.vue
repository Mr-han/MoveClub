<template>
  <div class="font-inter bg-gray-50 min-h-screen">
    <section class="bg-white border-b border-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">User Center</h2>
        <p class="text-gray-600">Manage your profile and events</p>
      </div>
    </section>
    <main class="py-8">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8">
        <ProfileSidebar />
        <div class="flex-1">
          <div class="flex items-center justify-between mb-8">
            <div class="flex border-b border-gray-200">
              <button
                v-if="isOrganizer"
                @click="activeTab = 'created'"
                :class="
                  activeTab === 'created'
                    ? activeClass
                    : 'text-gray-600 hover:text-primary transition-colors'
                "
                class="px-8 py-4 font-semibold text-lg rounded-t-lg flex items-center"
              >
                <i class="fas fa-plus-circle mr-2"></i>Created
              </button>
              <button
                @click="activeTab = 'joined'"
                :class="
                  activeTab === 'joined'
                    ? activeClass
                    : 'text-gray-600 hover:text-primary transition-colors'
                "
                class="px-8 py-4 font-semibold text-lg rounded-t-lg flex items-center"
              >
                <i class="fas fa-calendar-check mr-2"></i>Joined
              </button>
              <button
                v-if="isOrganizer"
                @click="activeTab = 'participant'"
                :class="
                  activeTab === 'participant'
                    ? activeClass
                    : 'text-gray-600 hover:text-primary transition-colors'
                "
                class="px-8 py-4 font-semibold text-lg rounded-t-lg flex items-center"
              >
                <i class="fas fa-users-cog mr-2"></i>Participant
              </button>
              <button
                @click="activeTab = 'calendar'"
                :class="
                  activeTab === 'calendar'
                    ? activeClass
                    : 'text-gray-600 hover:text-primary transition-colors'
                "
                class="px-8 py-4 font-semibold text-lg rounded-t-lg flex items-center"
              >
                <i class="fas fa-calendar-alt mr-2"></i>Calendar
              </button>
            </div>
          </div>
          <CreatedEventList
            v-if="activeTab === 'created'"
            @manage-users="activeTab = 'participant'"
          />
          <JoinedEventList v-else-if="activeTab === 'joined'" />
          <Participant v-else-if="activeTab === 'participant'" />
          <CalendarTab v-else-if="activeTab === 'calendar'" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProfileSidebar from '../components/ProfileSidebar.vue'
import CreatedEventList from '../components/CreatedEventList.vue'
import JoinedEventList from '../components/JoinedEventList.vue'
import Participant from '../components/Participant.vue'
import CalendarTab from '../components/CalendarTab.vue'
import { currentUser } from '@/api/auth'
const isOrganizer = computed(
  () => currentUser.value?.role === 'Organizer' || currentUser.value?.role === 'Admin',
)
const activeTab = ref(isOrganizer.value ? 'created' : 'joined')
const activeClass = 'text-primary border-b-3 border-primary bg-primary/5 bg-opacity-5'
</script>
