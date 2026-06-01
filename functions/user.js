const admin = require('firebase-admin')
const { wrapOnCall } = require('./utils')

const db = admin.firestore()

const getAllUsers = wrapOnCall(
  async () => {
    const snapshot = await db.collection('users').get()

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { users }
  },
  true,
  true,
)
const getUserCount = wrapOnCall(
  async () => {
    const snapshot = await db.collection('users').get()
    const count = snapshot.size
    return { count }
  },
  false,
  false,
)
module.exports = { getAllUsers, getUserCount }
