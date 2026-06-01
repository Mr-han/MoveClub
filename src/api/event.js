import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app, 'asia-southeast1')

function callFunction(name, data) {
  const fn = httpsCallable(functions, name)
  return fn(data).then((res) => res.data)
}

function unwrapCollectionResponse(response, key, errorMessage) {
  if (response.code !== 200) {
    if (errorMessage) {
      console.error(errorMessage, response.message || response)
    }
    return []
  }

  return response.data?.[key] || []
}

export const EventService = {
  STORAGE_KEY: 'events', // 保留原字段，虽然不再用

  // ---------- 获取所有事件 ----------
  getAll() {
    return callFunction('event-getEvents', {}).then((res) =>
      unwrapCollectionResponse(res, 'events', 'Failed to fetch events:'),
    )
  },

  // ---------- 保存/创建事件 ----------
  add(event) {
    // 原 event 对象里可能有 uid、name、type、capacity、address、description
    return callFunction('event-createEvent', event)
  },

  // ---------- 更新事件 ----------
  update(event) {
    // 保留原签名，event 必须包含 id
    return callFunction('event-updateEvent', event)
  },

  // ---------- 删除事件 ----------
  remove(id) {
    return callFunction('event-deleteEvent', { id })
  },

  // ---------- 添加或更新评分 ----------
  addOrUpdateRating(eventId, rating) {
    return callFunction('event-rateEvent', { eventId, rating })
  },

  // ---------- 注册参加者 ----------
  registerParticipant(eventId) {
    return callFunction('event-joinEvent', { eventId })
  },

  // ---------- 移除参加者 ----------
  removeParticipant(eventId) {
    return callFunction('event-leaveEvent', { eventId })
  },

  // ---------- 计算平均评分 ----------
  averageRating(event) {
    const vals = Object.values(event.ratings || {})
    if (vals.length === 0) return 5
    const sum = vals.reduce((a, b) => a + b, 0)
    return +(sum / vals.length).toFixed(1)
  },

  // ---------- 根据 uid 获取事件（支持分页） ----------
  getByUid(uid) {
    return callFunction('event-getEventsByUid', { uid }).then((res) =>
      unwrapCollectionResponse(res, 'events'),
    )
  },

  // ---------- 获取用户已加入的所有事件 ----------
  getJoinedEvents(userId) {
    return callFunction('event-getJoinedEvents', { userId }).then((res) =>
      unwrapCollectionResponse(res, 'events'),
    )
  },

  getEventParticipants(userId) {
    return callFunction('event-getEventParticipants', { userId }).then((res) =>
      unwrapCollectionResponse(res, 'users', 'Failed to fetch participants:'),
    )
  },
}
