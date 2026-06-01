import { callCallableExpectCollection, callCallableExpectData } from './callable'

export const UserService = {
  getAll() {
    return callCallableExpectCollection('user-getAllUsers', {}, 'users', 'Failed to fetch users')
  },

  getCount() {
    return callCallableExpectData('user-getUserCount', {}, 'Failed to fetch user count').then(
      (data) => data?.count || 0,
    )
  },
}
