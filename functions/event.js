const admin = require('firebase-admin')
const { wrapOnCall } = require('./utils')

const db = admin.firestore()
const EVENTS_COLLECTION = 'events'

// ---------- 创建事件 ----------
const createEvent = wrapOnCall(async (data, context) => {
  const newEvent = {
    uid: context.auth.uid,
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    address: data.address,
    description: data.description || '',
    latitude: data.latitude,
    longitude: data.longitude,
    participants: [],
    ratings: {},
    datetime: data.datetime,
    duration: data.duration,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  const docRef = await db.collection(EVENTS_COLLECTION).add(newEvent)
  return { id: docRef.id, ...newEvent }
})

// ---------- 更新事件 ----------
const updateEvent = wrapOnCall(async (data, context) => {
  const docRef = db.collection(EVENTS_COLLECTION).doc(data.id)
  const eventSnap = await docRef.get()
  if (!eventSnap.exists) throw new Error('Event not found')
  if (eventSnap.data().uid !== context.auth.uid) throw new Error('Permission denied')

  await docRef.update({
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    address: data.address,
    description: data.description,
    datetime: data.datetime,
    latitude: data.latitude,
    longitude: data.longitude,
    duration: data.duration,
  })
  return { success: true }
})

// ---------- 删除事件 ----------
const deleteEvent = wrapOnCall(async (data, context) => {
  const docRef = db.collection(EVENTS_COLLECTION).doc(data.id)
  const eventSnap = await docRef.get()
  if (!eventSnap.exists) throw new Error('Event not found')
  if (eventSnap.data().uid !== context.auth.uid) throw new Error('Permission denied')

  await docRef.delete()
  return { success: true }
})

// ---------- 给事件评分 ----------
const rateEvent = wrapOnCall(async (data, context) => {
  const { eventId, rating } = data
  const docRef = db.collection(EVENTS_COLLECTION).doc(eventId)
  const eventSnap = await docRef.get()
  if (!eventSnap.exists) throw new Error('Event not found')

  await docRef.update({ [`ratings.${context.auth.uid}`]: rating })
  return { success: true }
})

// ---------- 注册参加者 ----------
const joinEvent = wrapOnCall(async (data, context) => {
  const { eventId } = data
  const docRef = db.collection(EVENTS_COLLECTION).doc(eventId)
  const eventSnap = await docRef.get()
  if (!eventSnap.exists) throw new Error('Event not found')

  const participants = eventSnap.data().participants || []
  if (!participants.includes(context.auth.uid)) participants.push(context.auth.uid)

  await docRef.update({ participants })
  return { success: true }
})

// ---------- 移除参加者 ----------
const leaveEvent = wrapOnCall(async (data, context) => {
  const { eventId } = data
  const docRef = db.collection(EVENTS_COLLECTION).doc(eventId)
  const eventSnap = await docRef.get()
  if (!eventSnap.exists) throw new Error('Event not found')

  const participants = (eventSnap.data().participants || []).filter(
    (uid) => uid !== context.auth.uid,
  )
  await docRef.update({ participants })
  return { success: true }
})

// ---------- 获取事件 ----------
const getEvents = wrapOnCall(async () => {
  const snapshot = await db.collection(EVENTS_COLLECTION).orderBy('createdAt', 'desc').get()
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  // 获取所有创建者 uid 去重
  const creatorIds = [...new Set(events.map((e) => e.uid))]

  // 批量获取用户信息
  let usersMap = {}
  if (creatorIds.length) {
    const usersSnap = await db
      .collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', creatorIds)
      .get()
    usersSnap.docs.forEach((doc) => {
      const data = doc.data()
      usersMap[doc.id] = { name: data.name, avatar: data.avatar }
    })
  }

  // 给事件附加 creator 信息
  const enrichedEvents = events.map((e) => ({
    ...e,
    organizerName: usersMap[e.uid]?.name || 'Unknown',
    organizerAvatar: usersMap[e.uid]?.avatar || '',
  }))

  return { events: enrichedEvents }
}, false)

// ---------- 根据 uid 获取事件 ----------
const getEventsByUid = wrapOnCall(async (data) => {
  const { uid } = data
  const q = db.collection(EVENTS_COLLECTION).where('uid', '==', uid).orderBy('createdAt', 'desc')
  const snapshot = await q.get()
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const userSnap = await db.collection('users').doc(uid).get()
  const userData = userSnap.exists ? userSnap.data() : {}
  const enrichedEvents = events.map((e) => ({
    ...e,
    organizerName: userData.name || 'Unknown',
    organizerAvatar: userData.avatar || '',
  }))

  return { events: enrichedEvents }
})

// ---------- 获取用户已加入事件 ----------
const getJoinedEvents = wrapOnCall(async (data) => {
  const { userId } = data
  const q = db
    .collection(EVENTS_COLLECTION)
    .where('participants', 'array-contains', userId)
    .orderBy('createdAt', 'desc')

  const snapshot = await q.get()
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  // 获取创建者信息
  const creatorIds = [...new Set(events.map((e) => e.uid))]
  let usersMap = {}
  if (creatorIds.length) {
    const usersSnap = await db
      .collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', creatorIds)
      .get()
    usersSnap.docs.forEach((doc) => {
      const data = doc.data()
      usersMap[doc.id] = { name: data.name, avatar: data.avatar }
    })
  }

  const enrichedEvents = events.map((e) => ({
    ...e,
    organizerName: usersMap[e.uid]?.name || 'Unknown',
    organizerAvatar: usersMap[e.uid]?.avatar || '',
  }))

  return { events: enrichedEvents }
})

const getEventParticipants = wrapOnCall(async (data) => {
  const { userId } = data
  const eventsSnap = await db.collection(EVENTS_COLLECTION).where('uid', '==', userId).get()

  const events = eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const userEventMap = {} // { uid: [eventName1, eventName2] }
  events.forEach((event) => {
    const participants = event.participants || []
    participants.forEach((userId) => {
      if (!userEventMap[userId]) userEventMap[userId] = []
      userEventMap[userId].push(event.name)
    })
  })

  const userIds = Object.keys(userEventMap)
  if (userIds.length === 0) return { users: [] }

  const usersSnap = await db
    .collection('users')
    .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
    .get()

  const users = usersSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      uid: doc.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      gender: data.gender,
      events: userEventMap[doc.id] || [],
    }
  })

  return { users }
})

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  rateEvent,
  joinEvent,
  leaveEvent,
  getEvents,
  getEventsByUid,
  getJoinedEvents,
  getEventParticipants,
}
