import { callCallableExpectCollection, callCallableExpectData } from './callable'

export const EventService = {
  getAll() {
    return callCallableExpectCollection('event-getEvents', {}, 'events', 'Failed to fetch events')
  },

  add(event) {
    return callCallableExpectData('event-createEvent', event, 'Failed to create event')
  },

  update(event) {
    return callCallableExpectData('event-updateEvent', event, 'Failed to update event')
  },

  remove(id) {
    return callCallableExpectData('event-deleteEvent', { id }, 'Failed to delete event')
  },

  addOrUpdateRating(eventId, rating) {
    return callCallableExpectData('event-rateEvent', { eventId, rating }, 'Failed to rate event')
  },

  registerParticipant(eventId) {
    return callCallableExpectData('event-joinEvent', { eventId }, 'Failed to join event')
  },

  removeParticipant(eventId) {
    return callCallableExpectData('event-leaveEvent', { eventId }, 'Failed to leave event')
  },

  averageRating(event) {
    const vals = Object.values(event.ratings || {})
    if (vals.length === 0) return 5
    const sum = vals.reduce((a, b) => a + b, 0)
    return +(sum / vals.length).toFixed(1)
  },

  getByUid(uid) {
    return callCallableExpectCollection('event-getEventsByUid', { uid }, 'events')
  },

  getJoinedEvents(userId) {
    return callCallableExpectCollection('event-getJoinedEvents', { userId }, 'events')
  },

  getEventParticipants(userId) {
    return callCallableExpectCollection(
      'event-getEventParticipants',
      { userId },
      'users',
      'Failed to fetch participants',
    )
  },
}
