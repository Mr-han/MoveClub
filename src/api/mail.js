import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app, 'asia-southeast1')
function callFunction(name, data) {
  const fn = httpsCallable(functions, name)
  return fn(data).then((res) => res.data)
}
export const MailService = {
  // ---------- 获取所有事件 ----------
  send(mail) {
    return callFunction('mail-sendEmail', mail).then((res) => {
      if (res.code !== 200) {
        console.error('Failed to send:', res.message)
        return []
      }
      return res.data
    })
  },
}
