// src/api/event.js
export const EventService = {
  STORAGE_KEY: 'events',

  getAll() {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  saveAll(events) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events))
  },

  add(event) {
    const events = this.getAll()
    const newEvent = {
      id: Date.now(),
      uid: event.uid,
      name: event.name,
      type: event.type,
      capacity: event.capacity,
      address: event.address,
      description: event.description || '',
      participants: [],
      ratings: {}, // map: { userId: rating }
    }
    events.push(newEvent)
    this.saveAll(events)
  },

  update(event) {
    const events = this.getAll()
    const index = events.findIndex((e) => e.id === event.id)
    if (index !== -1) {
      events[index] = {
        ...events[index],
        name: event.name,
        type: event.type,
        capacity: event.capacity,
        address: event.address,
        description: event.description,
      }
      this.saveAll(events)
    }
  },

  remove(id) {
    const events = this.getAll().filter((e) => e.id !== id)
    this.saveAll(events)
  },

  addOrUpdateRating(eventId, userId, rating) {
    const events = this.getAll()
    const event = events.find((e) => e.id === eventId)
    if (event) {
      event.ratings[userId] = rating
      this.saveAll(events)
    }
  },

  registerParticipant(eventId, userId) {
    const events = this.getAll()
    const event = events.find((e) => e.id === eventId)
    if (event) {
      if (!event.participants) event.participants = []
      if (!event.participants.includes(userId)) event.participants.push(userId)
      this.saveAll(events)
    }
  },

  removeParticipant(eventId, userId) {
    const events = this.getAll()
    const event = events.find((e) => e.id === eventId)
    if (event && event.participants) {
      event.participants = event.participants.filter((uid) => uid !== userId)
      this.saveAll(events)
    }
  },

  averageRating(event) {
    const vals = Object.values(event.ratings)
    if (vals.length === 0) return 5
    const sum = vals.reduce((a, b) => a + b, 0)
    return (sum / vals.length).toFixed(1)
  },

  getByUid(uid) {
    const events = this.getAll()
    return events.filter((e) => e.uid === uid)
  },

  getJoinedEvents(userId) {
    const events = this.getAll()
    return events.filter((e) => e.participants.includes(userId))
  },
}
