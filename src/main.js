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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        currentUser.value = { uid: user.uid, email: user.email, ...userDoc.data() }
        isAuthenticated.value = true
      } else {
        isAuthenticated.value = false
        currentUser.value = null
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      isAuthenticated.value = false
      currentUser.value = null
    }
  } else {
    isAuthenticated.value = false
    currentUser.value = null
  }

  // 🟢 only init once
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
