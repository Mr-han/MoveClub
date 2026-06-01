import { createRouter, createWebHistory } from 'vue-router'
import { currentUser, isAuthenticated } from '@/api/auth'

const HomeView = () => import('../views/HomeView.vue')
const EventsView = () => import('../views/EventsView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const UserCenter = () => import('@/views/UserCenter.vue')
const MapView = () => import('@/views/MapView.vue')
const AdminDashboard = () => import('@/views/AdminDashboard.vue')

const routes = [
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, showHeader: true, requireAdmin: true },
  },
  {
    path: '/admin-dashborad',
    redirect: '/admin-dashboard',
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: false, showHeader: true, requireAdmin: false },
  },
  {
    path: '/events',
    name: 'Events',
    component: EventsView,
    meta: { requiresAuth: false, showHeader: true, requireAdmin: false },
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView,
    meta: { requiresAuth: false, showHeader: true, requireAdmin: false },
  },
  {
    path: '/user',
    name: 'User',
    component: UserCenter,
    meta: { requiresAuth: true, showHeader: true, requireAdmin: false },
  },
  { path: '/login', name: 'Login', component: LoginView, meta: { showHeader: false } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { showHeader: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.meta.requireAdmin && currentUser.value?.role !== 'Admin') {
    next('/')
  } else {
    next()
  }
})

export default router
