import { defineStore } from 'pinia'

export const useUserStatsStore = defineStore('eventCounts', {
  state: () => ({
    saved: 0,
    created: 0,
    joined: 0,
  }),
  actions: {
    setSaved(count) {
      this.saved = count
    },
    setCreated(count) {
      this.created = count
    },
    setJoined(count) {
      this.joined = count
    },
  },
})
