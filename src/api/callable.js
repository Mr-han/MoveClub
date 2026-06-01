import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app, 'asia-southeast1')

export function getResponseMessage(response, fallback = 'Request failed') {
  return response?.message || fallback
}

export async function callCallable(name, payload = {}) {
  const callable = httpsCallable(functions, name)
  const response = await callable(payload)
  return response.data
}

export async function callCallableExpectData(name, payload = {}, fallbackMessage) {
  const response = await callCallable(name, payload)

  if (response?.code !== 200) {
    throw new Error(getResponseMessage(response, fallbackMessage))
  }

  return response.data
}

export async function callCallableExpectCollection(
  name,
  payload = {},
  key,
  fallbackMessage = 'Request failed',
) {
  const data = await callCallableExpectData(name, payload, fallbackMessage)
  return data?.[key] || []
}
