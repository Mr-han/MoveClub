import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app, 'asia-southeast1')

function callFunction(name, data) {
  const fn = httpsCallable(functions, name)
  return fn(data).then((res) => res.data)
}

export const UserService = {
  getAll() {
    return callFunction('user-getAllUsers', {}).then((res) => {
      if (res.code !== 200) {
        console.error('Failed to fetch users:', res.message)
        return []
      }
      return res.data?.users || []
    })
  },
  getCount() {
    return callFunction('user-getUserCount', {}).then((res) => {
      if (res.code !== 200) {
        console.error('Failed to fetch user count:', res.message)
        return 0
      }
      return res.data?.count || 0
    })
  },
}
