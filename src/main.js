// import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { auth, db } from '@/api/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { isAuthenticated, currentUser } from '@/api/auth'
import { doc, getDoc } from 'firebase/firestore'
import VueApexCharts from 'vue3-apexcharts'
import { createPinia } from 'pinia'

let app
const pinia = createPinia()

async function syncCurrentUser(user) {
  const userRef = doc(db, 'users', user.uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    isAuthenticated.value = false
    currentUser.value = null
    return
  }

  currentUser.value = { uid: user.uid, email: user.email, ...userDoc.data() }
  isAuthenticated.value = true
}

function resetAuthState() {
  isAuthenticated.value = false
  currentUser.value = null
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      await syncCurrentUser(user)
    } catch (err) {
      console.error('Error fetching user:', err)
      resetAuthState()
    }
  } else {
    resetAuthState()
  }

  if (!app) {
    app = createApp(App)
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: { darkModeSelector: 'none' },
      },
    })
    app.use(router)
    app.use(VueApexCharts)
    app.use(pinia)
    app.mount('#app')
  }
})
